import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Github } from 'lucide-react';

const RepoForm = ({ onRepoAdded }) => {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!owner || !repo) return alert("Please fill in both fields");

    setLoading(true);
    try {
      // Sending data to your Express backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/repos`, { 
        owner: owner.trim(), 
        name: repo.trim() 
      });
      
      // Notify the parent (App.jsx) to add the new repo to the UI
      onRepoAdded(res.data);
      
      // Clear inputs
      setOwner('');
      setRepo('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add repo. Check if it exists on GitHub.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 shadow-2xl">
      <div className="flex items-center gap-2 mb-4 text-blue-400">
        <Github size={20} />
        <h2 className="text-lg font-semibold text-white">Track New Repository</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">GitHub Owner</label>
          <input 
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="e.g. facebook"
            className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Repo Name</label>
          <input 
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="e.g. react"
            className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg text-white focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="md:self-end bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors h-[50px]"
        >
          {loading ? "Adding..." : <><PlusCircle size={20} /> Track Pulse</>}
        </button>
      </form>
    </div>
  );
};

export default RepoForm;