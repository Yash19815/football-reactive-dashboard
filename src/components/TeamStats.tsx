import { Target, Shield, TrendingUp, Activity, Zap, Trophy } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { LeagueStandings } from './LeagueStandings';
import { FormChart } from './FormChart';
import { TeamComparison } from './TeamComparison';
import { getTeamStats, getTeamById } from '../lib/csvLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TeamStatsProps {
  teamId: string;
  leagueId: string;
  seasonId: string;
}

export function TeamStats({ teamId, leagueId, seasonId }: TeamStatsProps) {
  const stats = getTeamStats(teamId, seasonId);
  const team = getTeamById(teamId);

  if (!stats || !team) {
    return <div className="text-white">No team data available</div>;
  }

  const performanceData = [
    { metric: 'Goals', team: stats.goals_for, average: 58 },
    { metric: 'xG', team: stats.xg, average: 61.3 },
    { metric: 'Possession', team: stats.possession_avg, average: 50.2 },
    { metric: 'Shots', team: stats.shots_total, average: 412 },
  ];

  const shotAccuracy = stats.shots_total > 0 
    ? ((stats.shots_on_target / stats.shots_total) * 100).toFixed(1)
    : '0.0';

  const cleanSheetPercentage = stats.matches_played > 0
    ? ((stats.clean_sheets / stats.matches_played) * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h2 className="text-xl text-white mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="League Position"
            value={stats.position}
            subtitle={`${stats.points} points`}
            icon={Trophy}
            highlight
          />
          <StatsCard
            title="Record"
            value={`${stats.wins}W-${stats.draws}D-${stats.losses}L`}
            subtitle={`${stats.matches_played} matches`}
            icon={Activity}
          />
          <StatsCard
            title="Goals"
            value={stats.goals_for}
            subtitle={`${stats.goals_against} conceded`}
            icon={Target}
            trend="up"
            trendValue={`+${stats.goals_for - stats.goals_against}`}
          />
          <StatsCard
            title="xG / xGA"
            value={`${stats.xg} / ${stats.xga}`}
            subtitle="Expected goals"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Advanced Metrics */}
      <div>
        <h2 className="text-xl text-white mb-4">Advanced Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Possession %"
            value={`${stats.possession_avg}%`}
            icon={Activity}
          />
          <StatsCard
            title="Total Shots"
            value={stats.shots_total}
            subtitle={`${stats.shots_on_target} on target`}
            icon={Target}
          />
          <StatsCard
            title="Shot Accuracy"
            value={`${shotAccuracy}%`}
            icon={Zap}
          />
          <StatsCard
            title="Clean Sheets"
            value={stats.clean_sheets}
            subtitle={`${cleanSheetPercentage}% of matches`}
            icon={Shield}
          />
        </div>
      </div>

      {/* League Standings */}
      <div>
        <h2 className="text-xl text-white mb-4">League Standings</h2>
        <LeagueStandings leagueId={leagueId} seasonId={seasonId} highlightTeamId={teamId} />
      </div>

      {/* Recent Form */}
      <div>
        <h2 className="text-xl text-white mb-4">Recent Form</h2>
        <FormChart form={stats.recent_form || []} />
      </div>

      {/* Performance Comparison */}
      <div>
        <h2 className="text-xl text-white mb-4">Performance vs League Average</h2>
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="metric" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="team" fill="#45914d" name={team.name} radius={[8, 8, 0, 0]} />
              <Bar dataKey="average" fill="#475569" name="League Average" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Team Comparison */}
      <div>
        <h2 className="text-xl text-white mb-4">Team Comparison</h2>
        <TeamComparison team1Id={teamId} leagueId={leagueId} seasonId={seasonId} />
      </div>
    </div>
  );
}
