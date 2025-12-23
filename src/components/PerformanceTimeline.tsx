import { getPlayerMatchStats } from '../lib/csvLoader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PerformanceTimelineProps {
  playerId: string;
  seasonId: string;
}

export function PerformanceTimeline({ playerId, seasonId }: PerformanceTimelineProps) {
  const matchStats = getPlayerMatchStats(playerId, seasonId);

  if (matchStats.length === 0) {
    // Use mock data if no match data available
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      matchday: i + 1,
      goals: Math.floor(Math.random() * 3),
      assists: Math.floor(Math.random() * 2),
      rating: 6.5 + Math.random() * 2.5,
    }));

    return <TimelineCharts data={mockData} />;
  }

  const timelineData = matchStats.map((match: any) => ({
    matchday: match.match.matchday,
    goals: match.goals,
    assists: match.assists,
    rating: match.rating,
  }));

  return <TimelineCharts data={timelineData} />;
}

function TimelineCharts({ data }: { data: any[] }) {
  // Calculate cumulative data
  const cumulativeData = data.map((match, index) => {
    const cumGoals = data.slice(0, index + 1).reduce((sum, m) => sum + m.goals, 0);
    const cumAssists = data.slice(0, index + 1).reduce((sum, m) => sum + m.assists, 0);
    return {
      ...match,
      cumGoals,
      cumAssists,
      cumContributions: cumGoals + cumAssists,
    };
  });

  return (
    <div className="space-y-6">
      {/* Goals and Assists per Match */}
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
        <h3 className="text-white mb-4">Goals & Assists per Matchday</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#45914d" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#45914d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAssists" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="matchday" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="goals"
              stroke="#45914d"
              fillOpacity={1}
              fill="url(#colorGoals)"
              name="Goals"
            />
            <Area
              type="monotone"
              dataKey="assists"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorAssists)"
              name="Assists"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Contributions */}
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
        <h3 className="text-white mb-4">Cumulative Goal Contributions</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="matchday" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cumGoals"
              stroke="#45914d"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Total Goals"
            />
            <Line
              type="monotone"
              dataKey="cumAssists"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Total Assists"
            />
            <Line
              type="monotone"
              dataKey="cumContributions"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Total Contributions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
