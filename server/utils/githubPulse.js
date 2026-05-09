import axios from 'axios';

export const fetchRepoPulse = async (owner, name, token) => {
  const headers = { Authorization: `token ${token}` };

  try {
    // Fetch 30 commits to get a good sample of recent activity
    const commitRes = await axios.get(
      `https://api.github.com/repos/${owner}/${name}/commits?per_page=30`,
      { headers }
    );

    const commits = commitRes.data;
    if (commits.length === 0) return { healthScore: 100, burnoutAlert: false };

    // --- 1. TIMING CALCULATION (30% weight) ---
    let lateNightCommits = 0;
    commits.forEach(item => {
      const hour = new Date(item.commit.author.date).getHours();
      if (hour >= 22 || hour <= 5) lateNightCommits++;
    });
    const timingScore = Math.max(0, 100 - (lateNightCommits * 10));

    // --- 2. VELOCITY CALCULATION (70% weight) ---
    // We calculate how many hours passed between the newest and oldest commit in our list
    const newestDate = new Date(commits[0].commit.author.date);
    const oldestDate = new Date(commits[commits.length - 1].commit.author.date);
    const hoursSpan = (newestDate - oldestDate) / (1000 * 60 * 60);

    // If 30 commits happened in a very short time (e.g., < 24 hours), velocity is high!
    // We'll say 48 hours for 30 commits is "Normal" (100). Anything faster drops the score.
    const velocityScore = Math.min(100, (hoursSpan / 48) * 100);

    // --- 3. DYNAMIC JITTER (For the "Live" feel) ---
    const jitter = (Math.random() * 8) - 4;

    // --- FINAL WEIGHTED HEALTH SCORE ---
    // 70% based on how fast they are working, 30% on when they work
    const healthScore = Math.round(
      Math.max(0, Math.min(100, (velocityScore * 0.7) + (timingScore * 0.3) + jitter))
    );

    return {
      commitCount: commits.length,
      healthScore,
      velocity: hoursSpan.toFixed(2), // Hours taken for last 30 commits
      burnoutAlert: healthScore < 50,
      lastUpdate: new Date()
    };
  } catch (error) {
    console.error("GitHub API Error:", error.response?.data || error.message);
    throw error;
  }
};