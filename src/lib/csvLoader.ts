import Papa from "papaparse";

export type Season = {
  id: string;
  name: string;
  start_year: number;
  end_year: number;
  is_current: boolean;
};

export type League = {
  id: string;
  name: string;
  country: string;
  tier: number;
};

export type Team = {
  id: string;
  name: string;
  short_name: string;
  city: string;
};

export type Player = {
  id: string;
  name: string;
  position: string;
  nationality: string;
  date_of_birth?: string;
};

export type TeamSeason = {
  id: string;
  team_id: string;
  league_id: string;
  season_id: string;
  position: number;
  points: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  xg: number;
  xga: number;
  possession_avg: number;
  shots_total: number;
  shots_on_target: number;
  clean_sheets: number;
  recent_form: string[];
};

export type PlayerTeamSeason = {
  id: string;
  player_id: string;
  team_id: string;
  season_id: string;
  shirt_number: number;
  appearances: number;
  minutes_played: number;
  goals: number;
  assists: number;
  xg: number;
  xa: number;
  shots_total: number;
  shots_on_target: number;
  passes_attempted: number;
  passes_completed: number;
  pass_accuracy: number;
  key_passes: number;
  dribbles_attempted: number;
  dribbles_successful: number;
  tackles: number;
  interceptions: number;
  clearances: number;
  blocks: number;
  yellow_cards: number;
  red_cards: number;
  average_rating: number;
};

export type Match = {
  id: string;
  season_id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  matchday: number;
  match_date: string;
  home_score: number;
  away_score: number;
};

export type PlayerMatchStat = {
  id: string;
  player_id: string;
  match_id: string;
  team_id: string;
  minutes_played: number;
  goals: number;
  assists: number;
  rating: number;
};

// Generic CSV loader
async function loadCSV<T>(
  filepath: string,
  transform?: (row: any) => T,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(filepath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (transform) {
          resolve(results.data.map(transform));
        } else {
          resolve(results.data as T[]);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// Transform functions to handle special types
const transformTeamSeason = (row: any): TeamSeason => ({
  ...row,
  recent_form: row.recent_form ? JSON.parse(row.recent_form) : [],
});

// Data cache
let dataCache: {
  seasons?: Season[];
  leagues?: League[];
  teams?: Team[];
  players?: Player[];
  teamSeasons?: TeamSeason[];
  playerTeamSeasons?: PlayerTeamSeason[];
  matches?: Match[];
  playerMatchStats?: PlayerMatchStat[];
} = {};

// Load all data (call this once on app start)
export async function loadAllData() {
  try {
    const [
      seasons,
      leagues,
      teams,
      players,
      teamSeasons,
      playerTeamSeasons,
      matches,
      playerMatchStats,
    ] = await Promise.all([
      loadCSV<Season>("/data/seasons.csv"),
      loadCSV<League>("/data/leagues.csv"),
      loadCSV<Team>("/data/teams.csv"),
      loadCSV<Player>("/data/players.csv"),
      loadCSV<TeamSeason>("/data/team_seasons.csv", transformTeamSeason),
      loadCSV<PlayerTeamSeason>("/data/player_team_seasons.csv"),
      loadCSV<Match>("/data/matches.csv").catch(() => []), // Optional
      loadCSV<PlayerMatchStat>("/data/player_match_stats.csv").catch(() => []), // Optional
    ]);

    dataCache = {
      seasons,
      leagues,
      teams,
      players,
      teamSeasons,
      playerTeamSeasons,
      matches,
      playerMatchStats,
    };

    return dataCache;
  } catch (error) {
    console.error("Error loading CSV data:", error);
    throw error;
  }
}

// Getter functions
export function getSeasons(): Season[] {
  return dataCache.seasons || [];
}

export function getLeagues(): League[] {
  return dataCache.leagues || [];
}

export function getTeams(): Team[] {
  return dataCache.teams || [];
}

export function getPlayers(): Player[] {
  return dataCache.players || [];
}

// Get teams for a specific league and season
export function getTeamsForLeagueSeason(
  leagueId: string,
  seasonId: string,
): Team[] {
  if (!dataCache.teamSeasons || !dataCache.teams) return [];

  const teamIds = dataCache.teamSeasons
    .filter((ts) => ts.league_id === leagueId && ts.season_id === seasonId)
    .map((ts) => ts.team_id);

  return dataCache.teams.filter((team) => teamIds.includes(team.id));
}

// Get players for a specific team and season
export function getPlayersForTeamSeason(
  teamId: string,
  seasonId: string,
): Player[] {
  if (!dataCache.playerTeamSeasons || !dataCache.players) return [];

  const playerIds = dataCache.playerTeamSeasons
    .filter((pts) => pts.team_id === teamId && pts.season_id === seasonId)
    .map((pts) => pts.player_id);

  return dataCache.players.filter((player) => playerIds.includes(player.id));
}

// Get team stats
export function getTeamStats(
  teamId: string,
  seasonId: string,
): TeamSeason | null {
  if (!dataCache.teamSeasons) return null;

  return (
    dataCache.teamSeasons.find(
      (ts) => ts.team_id === teamId && ts.season_id === seasonId,
    ) || null
  );
}

// Get player stats
export function getPlayerStats(
  playerId: string,
  teamId: string,
  seasonId: string,
): PlayerTeamSeason | null {
  if (!dataCache.playerTeamSeasons) return null;

  return (
    dataCache.playerTeamSeasons.find(
      (pts) =>
        pts.player_id === playerId &&
        pts.team_id === teamId &&
        pts.season_id === seasonId,
    ) || null
  );
}

// Get league standings
export function getLeagueStandings(
  leagueId: string,
  seasonId: string,
): TeamSeason[] {
  if (!dataCache.teamSeasons) return [];

  return dataCache.teamSeasons
    .filter((ts) => ts.league_id === leagueId && ts.season_id === seasonId)
    .sort((a, b) => a.position - b.position);
}

// Get player match stats for timeline
export function getPlayerMatchStats(playerId: string, seasonId: string): any[] {
  if (!dataCache.playerMatchStats || !dataCache.matches) return [];

  const playerMatches = dataCache.playerMatchStats.filter(
    (pms) => pms.player_id === playerId,
  );

  return playerMatches
    .map((pms) => {
      const match = dataCache.matches?.find(
        (m) => m.id === pms.match_id && m.season_id === seasonId,
      );
      return match ? { ...pms, match } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a?.match?.matchday || 0) - (b?.match?.matchday || 0));
}

// Helper to get related data
export function getTeamById(teamId: string): Team | undefined {
  return dataCache.teams?.find((t) => t.id === teamId);
}

export function getPlayerById(playerId: string): Player | undefined {
  return dataCache.players?.find((p) => p.id === playerId);
}

export function getSeasonById(seasonId: string): Season | undefined {
  return dataCache.seasons?.find((s) => s.id === seasonId);
}

export function getLeagueById(leagueId: string): League | undefined {
  return dataCache.leagues?.find((l) => l.id === leagueId);
}
