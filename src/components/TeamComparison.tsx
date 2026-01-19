import { useState, useEffect, ChangeEvent } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getTeamStats,
  getTeamsForLeagueSeason,
  getTeamById,
} from "../lib/dataLoader";

interface TeamComparisonProps {
  team1Id: string;
  leagueId: string;
  seasonId: string;
}

export function TeamComparison({
  team1Id,
  leagueId,
  seasonId,
}: TeamComparisonProps) {
  const [team2Id, setTeam2Id] = useState<string>("");
  const [availableTeams, setAvailableTeams] = useState<
    { id: string; name: string }[]
  >([]);

  // Load available teams for comparison
  useEffect(() => {
    const teams = getTeamsForLeagueSeason(leagueId, seasonId)
      .filter((t) => t.id !== team1Id) // Exclude team1
      .map((t) => ({ id: t.id, name: t.name }));

    setAvailableTeams(teams);
    if (teams.length > 0 && !team2Id) {
      setTeam2Id(teams[0].id);
    }
  }, [leagueId, seasonId, team1Id]);

  const team1Stats = getTeamStats(team1Id, seasonId);
  const team2Stats = team2Id ? getTeamStats(team2Id, seasonId) : null;
  const team1 = getTeamById(team1Id);
  const team2 = team2Id ? getTeamById(team2Id) : null;

  if (!team1Stats || !team1) return null;

  // Max values for normalization (approximate for visualization)
  const maxGoals = 100;
  const maxPossession = 70;
  const maxCleanSheets = 20;

  const comparisonData = [
    {
      metric: "Attack",
      team1: Math.min((team1Stats.goals_for / maxGoals) * 100, 100),
      team2: team2Stats
        ? Math.min((team2Stats.goals_for / maxGoals) * 100, 100)
        : 0,
      fullMark: 100,
    },
    {
      metric: "Defense",
      team1: Math.min((team1Stats.clean_sheets / maxCleanSheets) * 100, 100),
      team2: team2Stats
        ? Math.min((team2Stats.clean_sheets / maxCleanSheets) * 100, 100)
        : 0,
      fullMark: 100,
    },
    {
      metric: "Possession",
      team1: Math.min((team1Stats.possession_avg / maxPossession) * 100, 100),
      team2: team2Stats
        ? Math.min((team2Stats.possession_avg / maxPossession) * 100, 100)
        : 0,
      fullMark: 100,
    },
    {
      metric: "Form",
      team1: (team1Stats.points / (team1Stats.matches_played * 3)) * 100, // Points percentage
      team2: team2Stats
        ? (team2Stats.points / (team2Stats.matches_played * 3)) * 100
        : 0,
      fullMark: 100,
    },
    {
      metric: "Efficiency",
      team1: (team1Stats.goals_for / team1Stats.xg) * 50, // >1 means good efficiency, scaled
      team2: team2Stats ? (team2Stats.goals_for / team2Stats.xg) * 50 : 0,
      fullMark: 100,
    },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="text-white font-bold">{team1.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">vs</span>
          <select
            value={team2Id}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setTeam2Id(e.target.value)
            }
            className="px-4 py-2 rounded-lg bg-slate-750 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500 max-w-[200px]"
          >
            {availableTeams.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-800">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={comparisonData}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
          <Radar
            name={team1.name}
            dataKey="team1"
            stroke="#45914d"
            fill="#45914d"
            fillOpacity={0.5}
          />
          {team2 && (
            <Radar
              name={team2.name}
              dataKey="team2"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.5}
            />
          )}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      {/* Stat Comparison Table */}
      {team2Stats && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl text-green-500">
              {team1Stats.goals_for}
            </div>
            <div className="text-xs text-slate-400 mt-1">Goals</div>
          </div>
          <div className="text-center border-l border-r border-slate-700">
            <div className="text-sm text-slate-400 mb-2">Points</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-500">{team1Stats.points}</span>
              <span className="text-slate-600">-</span>
              <span className="text-orange-500">{team2Stats.points}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-orange-500">
              {team2Stats.goals_for}
            </div>
            <div className="text-xs text-slate-400 mt-1">Goals</div>
          </div>
        </div>
      )}
    </div>
  );
}
