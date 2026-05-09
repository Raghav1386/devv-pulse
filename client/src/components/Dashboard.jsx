import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea } from 'recharts';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

const Dashboard = ({ repos }) => {
  // Helper to turn the ISO timestamp into a readable 24h format (HH:mm:ss)
  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getStatus = (score) => {
    if (score > 85) return { label: "Optimal Flow", color: "text-emerald-400", desc: "Sustainable pace" };
    if (score > 65) return { label: "High Velocity", color: "text-blue-400", desc: "Fast but healthy" };
    if (score > 40) return { label: "Heavy Crunch", color: "text-orange-400", desc: "Increased pressure" };
    return { label: "Burnout Risk", color: "text-red-500", desc: "Urgent intervention needed" };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {repos.map(repo => {
        const status = getStatus(repo.healthScore);

        return (
          <div key={repo._id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{repo.fullName}</h2>
                <p className={`text-xs font-medium mt-1 ${status.color}`}>
                  {status.label} • {status.desc}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${repo.burnoutAlert ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                {repo.burnoutAlert ? <AlertTriangle className="text-red-500 animate-pulse" size={24} /> : <CheckCircle className="text-emerald-500" size={24} />}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Health Index</span>
                  <TooltipWrapper text="Calculated based on commit timing and velocity." />
                </div>
                <p className={`text-3xl font-black ${repo.healthScore < 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {repo.healthScore}%
                </p>
              </div>
              <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Cycle Velocity</span>
                  <TooltipWrapper text="Hours passed between the oldest and newest of the last 30 commits." />
                </div>
                <p className="text-3xl font-black text-blue-400">
                  {repo.velocity || '0'}h
                </p>
              </div>
            </div>

            {/* Timeline Header */}
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Temporal Pulse History</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                <span className="text-[10px] text-blue-400 font-bold uppercase">Live Monitor</span>
              </div>
            </div>

            {/* Descriptive Real-Time Graph */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={repo.history} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid vertical={false} stroke="#2d3748" strokeDasharray="3 3" opacity={0.5} />

                  {/* Visual Stress Zones */}
                  <ReferenceArea y1={0} y2={40} fill="#ef4444" fillOpacity={0.05} label={{ position: 'insideLeft', value: 'STRESS', fill: '#ef4444', fontSize: 10, dy: 10 }} />
                  <ReferenceArea y1={85} y2={100} fill="#10b981" fillOpacity={0.05} label={{ position: 'insideLeft', value: 'STABLE', fill: '#10b981', fontSize: 10, dy: 10 }} />

                  {/* X-Axis: Now Visible and Formatted */}
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    stroke="#4b5563"
                    fontSize={10}
                    dy={10}
                    minTickGap={30}
                  />

                  <YAxis domain={[0, 100]} ticks={[0, 50, 100]} stroke="#4b5563" fontSize={10} />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-950 border border-gray-700 p-3 rounded-lg shadow-xl">
                            <p className="text-[10px] font-mono text-gray-400 mb-1">
                              PULSE TIME: {new Date(payload[0].payload.timestamp).toLocaleTimeString()}
                            </p>
                            <p className="text-sm font-bold text-blue-400">
                              HEALTH SCORE: {payload[0].value}%
                            </p>
                            <p className="text-[9px] text-gray-500 italic mt-1">
                              {payload[0].value > 80 ? "Maintain current rhythm" : "High pressure detected"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 2, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false} // Disable animation for a snappier "live" feel
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TooltipWrapper = ({ text }) => (
  <div className="group relative">
    <Info size={12} className="text-gray-500 cursor-help" />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-black text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
      {text}
    </span>
  </div>
);

export default Dashboard;