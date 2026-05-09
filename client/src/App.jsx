import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import RepoForm from './components/RepoForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

function App() {
  const [repos, setRepos] = useState([]);

  // Fetch existing repos from DB on load
  useEffect(() => {
    axios.get(`${API_URL}/api/repos`)
      .then(res => setRepos(res.data))
      .catch(err => console.error("Initial fetch error:", err));
  }, []);

  // Socket listener for live updates
  useEffect(() => {
    socket.on('pulse-update', (updatedData) => {
      setRepos(prevRepos => 
        prevRepos.map(r => r.fullName === updatedData.fullName ? { ...r, ...updatedData } : r)
      );
    });
    return () => socket.off('pulse-update');
  }, []);

  // Function to add new repo to state immediately
  const handleRepoAdded = (newRepo) => {
    setRepos(prev => [...prev, newRepo]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Dev-Pulse
          </h1>
          <p className="text-gray-400 mt-2">Real-time developer burnout monitoring</p>
        </header>

        {/* INPUT FORM */}
        <RepoForm onRepoAdded={handleRepoAdded} />

        {/* DASHBOARD GRID */}
        <Dashboard repos={repos} />
      </div>
    </div>
  );
}

export default App;