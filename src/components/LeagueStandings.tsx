import { getLeagueStandings, getTeamById } from "../lib/dataLoader";

interface LeagueStandingsProps {
  leagueId: string;
  seasonId: string;
  highlightTeamId: string;
}

export function LeagueStandings({
  leagueId,
  seasonId,
  highlightTeamId,
}: LeagueStandingsProps) {
  const standings = getLeagueStandings(leagueId, seasonId);

  if (standings.length === 0) {
    return <div className="text-white">No standings data available</div>;
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-750 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-slate-400">#</th>
              <th className="px-4 py-3 text-left text-xs text-slate-400">
                Team
              </th>
              <th className="px-4 py-3 text-center text-xs text-slate-400">
                P
              </th>
              <th className="px-4 py-3 text-center text-xs text-slate-400">
                W
              </th>
              <th className="px-4 py-3 text-center text-xs text-slate-400">
                D
              </th>
              <th className="px-4 py-3 text-center text-xs text-slate-400">
                L
              </th>
              <th className="px-4 py-3 text-center text-xs text-slate-400">
                GD
              </th>
              <th className="px-4 py-3 text-center text-xs text-slate-400">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const team = getTeamById(row.team_id);
              const goalDiff = row.goals_for - row.goals_against;

              return (
                <tr
                  key={row.id}
                  className={`border-b border-slate-700 ${
                    row.team_id === highlightTeamId
                      ? "bg-green-500/10"
                      : "hover:bg-slate-750"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs ${
                        row.position <= 4
                          ? "bg-green-500/20 text-green-500"
                          : "text-slate-400"
                      }`}
                    >
                      {row.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.team_id === highlightTeamId
                          ? "text-green-500"
                          : "text-white"
                      }
                    >
                      {team?.name || "Unknown Team"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400">
                    {row.matches_played}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400">
                    {row.wins}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400">
                    {row.draws}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-400">
                    {row.losses}
                  </td>
                  <td
                    className={`px-4 py-3 text-center ${goalDiff > 0 ? "text-green-500" : "text-slate-400"}`}
                  >
                    {goalDiff > 0 ? "+" : ""}
                    {goalDiff}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        row.team_id === highlightTeamId
                          ? "text-green-500"
                          : "text-white"
                      }
                    >
                      {row.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
