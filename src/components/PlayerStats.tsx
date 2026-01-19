import {
  Target,
  Activity,
  Footprints,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { PlayerHeatmap } from "./PlayerHeatmap";
import { PerformanceTimeline } from "./PerformanceTimeline";
import { getPlayerStats, getPlayerById } from "../lib/dataLoader";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PlayerStatsProps {
  playerId: string;
  teamId: string;
  seasonId: string;
}

export function PlayerStats({ playerId, teamId, seasonId }: PlayerStatsProps) {
  const stats = getPlayerStats(playerId, teamId, seasonId);
  const player = getPlayerById(playerId);

  if (!stats || !player) {
    return <div className="text-white">No player data available</div>;
  }

  const dribbleSuccessRate =
    stats.dribbles_attempted > 0
      ? ((stats.dribbles_successful / stats.dribbles_attempted) * 100).toFixed(
          0,
        )
      : "0";

  const skillsData = [
    { skill: "Shooting", value: 95, fullMark: 100 },
    { skill: "Passing", value: stats.pass_accuracy || 0, fullMark: 100 },
    {
      skill: "Dribbling",
      value: parseFloat(dribbleSuccessRate),
      fullMark: 100,
    },
    { skill: "Defending", value: 45, fullMark: 100 },
    { skill: "Physical", value: 92, fullMark: 100 },
    { skill: "Pace", value: 90, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h2 className="text-xl text-white mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Minutes Played"
            value={stats.minutes_played.toLocaleString()}
            subtitle={`${Math.floor(stats.minutes_played / 90)} full matches`}
            icon={Clock}
          />
          <StatsCard
            title="Goals"
            value={stats.goals}
            subtitle={`${stats.xg.toFixed(1)} xG`}
            icon={Target}
            highlight
            trend={
              stats.goals > stats.xg
                ? "up"
                : stats.goals < stats.xg
                  ? "down"
                  : "neutral"
            }
            trendValue={`${(stats.goals - stats.xg).toFixed(1)} vs xG`}
          />
          <StatsCard
            title="Assists"
            value={stats.assists}
            subtitle={`${stats.xa.toFixed(1)} xA`}
            icon={Activity}
          />
          <StatsCard
            title="Goal Contributions"
            value={stats.goals + stats.assists}
            subtitle="Goals + Assists"
            icon={TrendingUp}
            highlight
          />
        </div>
      </div>

      {/* Technical Statistics */}
      <div>
        <h2 className="text-xl text-white mb-4">Technical Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Passing Accuracy"
            value={`${stats.pass_accuracy.toFixed(1)}%`}
            icon={Activity}
          />
          <StatsCard
            title="Key Passes"
            value={stats.key_passes}
            subtitle="Per season"
            icon={Target}
          />
          <StatsCard
            title="Dribbles"
            value={stats.dribbles_attempted}
            subtitle={`${stats.dribbles_successful} successful (${dribbleSuccessRate}%)`}
            icon={Footprints}
          />
          <StatsCard
            title="Defensive Actions"
            value={stats.tackles + stats.interceptions}
            subtitle="Tackles + Interceptions"
            icon={Shield}
          />
        </div>
      </div>

      {/* Skills Profile */}
      <div>
        <h2 className="text-xl text-white mb-4">Player Skills Profile</h2>
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="skill" stroke="#94a3b8" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
              <Radar
                name={player.name}
                dataKey="value"
                stroke="#45914d"
                fill="#45914d"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <h2 className="text-xl text-white mb-4">Positional Heatmap</h2>
        <PlayerHeatmap position={player.position} />
      </div>

      {/* Performance Timeline */}
      <div>
        <h2 className="text-xl text-white mb-4">Goals & Assists Timeline</h2>
        <PerformanceTimeline playerId={playerId} seasonId={seasonId} />
      </div>
    </div>
  );
}
