import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Repo } from './models/Repo.js';
import { fetchRepoPulse } from './utils/githubPulse.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log("⏳ Attempting to connect to MongoDB...");

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // If it doesn't connect in 5s, it will error out
})
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  });

// --- REAL-TIME ENGINE ---
// Every 60 seconds, check all tracked repos and "Pulse" the data to the frontend

setInterval(async () => {
  const trackedRepos = await Repo.find();

  for (const repo of trackedRepos) {
    try {
      const stats = await fetchRepoPulse(repo.owner, repo.name, process.env.GITHUB_TOKEN);

      // Update DB
      repo.healthScore = stats.healthScore;
      repo.burnoutAlert = stats.burnoutAlert;
      repo.history.push({ commitCount: stats.commitCount, score: stats.healthScore });
      await repo.save();

      // Emit to Frontend via Socket
      io.emit('pulse-update', {
        repoId: repo._id,
        fullName: repo.fullName,
        ...stats
      });

      console.log(`📡 Pulsed update for ${repo.fullName}`);
    } catch (error) {
      console.error(`❌ Error pulsing ${repo.fullName}:`, error.message);
    }
  }
}, 10000);

// --- API ROUTES ---
app.post('/api/repos', async (req, res) => {
  const { owner, name } = req.body;
  const newRepo = new Repo({ owner, name, fullName: `${owner}/${name}` });
  await newRepo.save();
  res.json(newRepo);
});

// 1. Get all repos from the database
app.get('/api/repos', async (req, res) => {
  try {
    const repos = await Repo.find();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Add a new repo to the database
app.post('/api/repos', async (req, res) => {
  const { owner, name } = req.body;
  try {
    const newRepo = new Repo({
      owner,
      name,
      fullName: `${owner}/${name}`.toLowerCase()
    });
    await newRepo.save();
    res.status(201).json(newRepo);
  } catch (error) {
    res.status(400).json({ message: "Repo already exists or invalid data" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));