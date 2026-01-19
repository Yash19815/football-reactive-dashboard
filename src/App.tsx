import { useState, useEffect, ChangeEvent } from "react";
import { Trophy, Users, User } from "lucide-react";
import { TeamStats } from "./components/TeamStats";
import { PlayerStats } from "./components/PlayerStats";
import {
  loadAllData,
  loadDataForSeason,
  getSeasons,
  getLeagues,
  getTeamsForLeagueSeason,
  getPlayersForTeamSeason,
  loadPlayersForTeamSeason,
  Season,
  League,
  Team,
  Player,
} from "./lib/dataLoader";

export default function App() {
  // Loading state
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Data state
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  // Selection state
  const [seasonId, setSeasonId] = useState<string>("");
  const [mode, setMode] = useState<"team" | "player">("team");
  const [leagueId, setLeagueId] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");

  // Load CSV data on mount
  useEffect(() => {
    async function loadData() {
      try {
        await loadAllData();
        const loadedSeasons = getSeasons();
        const loadedLeagues = getLeagues();

        setSeasons(loadedSeasons);
        setLeagues(loadedLeagues);

        // Set initial selections
        if (loadedSeasons.length > 0) {
          const currentSeason =
            loadedSeasons.find((s) => s.is_current) || loadedSeasons[0];
          setSeasonId(currentSeason.id);
        }

        if (loadedLeagues.length > 0) {
          setLeagueId(loadedLeagues[0].id);
        }

        setDataLoaded(true);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoadError(
          "Failed to load data from API-Football. Please check:\n" +
            "1. Your API key is set in the .env file\n" +
            "2. You have available API requests (100/day for free tier)\n" +
            "3. Your internet connection is working",
        );
      }
    }

    loadData();
  }, []);

  // Update available teams when league or season changes
  useEffect(() => {
    if (!dataLoaded || !leagueId || !seasonId) return;

    const teams = getTeamsForLeagueSeason(leagueId, seasonId);
    setAvailableTeams(teams);

    // Set first team as selected
    if (teams.length > 0) {
      setTeamId(teams[0].id);
    } else {
      setTeamId("");
    }
  }, [leagueId, seasonId, dataLoaded]);

  // Update available players when team or season changes
  useEffect(() => {
    if (!dataLoaded || !teamId || !seasonId) {
      console.log("Player loading skipped:", { dataLoaded, teamId, seasonId });
      return;
    }

    async function loadPlayers() {
      try {
        console.log(
          `Loading players for team ${teamId} in season ${seasonId}...`,
        );
        // Load players on-demand to save API requests
        await loadPlayersForTeamSeason(teamId, seasonId);
        const players = getPlayersForTeamSeason(teamId, seasonId);
        console.log(`Loaded ${players.length} players for team ${teamId}`);
        setAvailablePlayers(players);

        // Set first player as selected
        if (players.length > 0) {
          setPlayerId(players[0].id);
          console.log(`Selected player: ${players[0].name}`);
        } else {
          setPlayerId("");
          console.warn("No players available for this team/season");
        }
      } catch (error) {
        console.error("Failed to load players:", error);
        setAvailablePlayers([]);
      }
    }

    loadPlayers();
  }, [teamId, seasonId, dataLoaded]);

  // Handle season change
  const handleSeasonChange = async (newSeasonId: string) => {
    setSeasonId(newSeasonId);

    // Load data for the new season
    try {
      await loadDataForSeason(newSeasonId);
    } catch (error) {
      console.error("Failed to load data for season:", error);
    }
  };

  // Handle league change
  const handleLeagueChange = (newLeagueId: string) => {
    setLeagueId(newLeagueId);
  };

  // Handle team change
  const handleTeamChange = (newTeamId: string) => {
    setTeamId(newTeamId);
  };

  // Get display names
  const selectedSeason = seasons.find((s) => s.id === seasonId);
  const selectedTeam = availableTeams.find((t) => t.id === teamId);
  const selectedPlayer = availablePlayers.find((p) => p.id === playerId);

  // Loading state
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-white text-xl mb-4">
            Loading football data from API-Football...
          </div>
          <div className="text-slate-400 text-sm mb-4">
            This may take a moment as we fetch data from the API
          </div>
          {loadError && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200 text-sm whitespace-pre-line">
              {loadError}
            </div>
          )}
          {!loadError && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-8 shadow-lg border-b border-slate-700">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl">Football Analytics Dashboard</h1>
          </div>

          {/* Global Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Season Filter */}
            <div>
              <label className="block text-sm mb-2 text-slate-300">
                Season
              </label>
              <select
                value={seasonId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleSeasonChange(e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {seasons.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className="text-white bg-slate-800"
                  >
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Toggle */}
            <div>
              <label className="block text-sm mb-2 text-slate-300">
                View Mode
              </label>
              <select
                value={mode}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setMode(e.target.value as "team" | "player")
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="team" className="text-white bg-slate-800">
                  Team Stats
                </option>
                <option value="player" className="text-white bg-slate-800">
                  Player Stats
                </option>
              </select>
            </div>

            {/* League/Team Dropdown */}
            <div>
              <label className="block text-sm mb-2 text-slate-300">
                {mode === "team" ? "League" : "Team"}
              </label>
              {mode === "team" ? (
                <select
                  value={leagueId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    handleLeagueChange(e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {leagues.map((league) => (
                    <option
                      key={league.id}
                      value={league.id}
                      className="text-white bg-slate-800"
                    >
                      {league.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={teamId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    handleTeamChange(e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {availableTeams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                      className="text-white bg-slate-800"
                    >
                      {team.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Team/Player Dropdown */}
            <div>
              <label className="block text-sm mb-2 text-slate-300">
                {mode === "team" ? "Team" : "Player"}
              </label>
              {mode === "team" ? (
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {availableTeams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                      className="text-white bg-slate-800"
                    >
                      {team.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={availablePlayers.length === 0}
                >
                  {availablePlayers.length === 0 ? (
                    <option>No players available</option>
                  ) : (
                    availablePlayers.map((player) => (
                      <option
                        key={player.id}
                        value={player.id}
                        className="text-white bg-slate-800"
                      >
                        {player.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Mode Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {mode === "team" ? (
            <>
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-slate-400">Team Analytics</span>
            </>
          ) : (
            <>
              <User className="w-5 h-5 text-green-500" />
              <span className="text-slate-400">Player Analytics</span>
            </>
          )}
          <span className="text-slate-600">•</span>
          <span className="text-white">
            {mode === "team" ? selectedTeam?.name : selectedPlayer?.name}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500">{selectedSeason?.name}</span>
        </div>

        {/* Stats Sections */}
        {mode === "team" && teamId && seasonId ? (
          <TeamStats teamId={teamId} leagueId={leagueId} seasonId={seasonId} />
        ) : mode === "player" && playerId && teamId && seasonId ? (
          <PlayerStats
            playerId={playerId}
            teamId={teamId}
            seasonId={seasonId}
          />
        ) : (
          <div className="text-white">No data available for this selection</div>
        )}
      </div>
    </div>
  );
}
