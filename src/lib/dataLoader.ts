// Type exports (keep all existing types from csvLoader.ts)
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

// Import API service and transformers
import { apiFootballService } from "../services/apiFootball";
import {
  transformStanding,
  transformPlayer,
  transformPlayerStatistics,
  transformFixture,
  enhanceTeamSeasonWithStats,
  createSeasons,
  LEAGUE_MAP,
} from "./apiTransformers";

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

// Loading state
let isLoading = false;
let loadError: string | null = null;

/**
 * Load all data from API-Football
 * This replaces the CSV loading functionality
 */
export async function loadAllData(): Promise<typeof dataCache> {
  if (isLoading) {
    throw new Error("Data is already being loaded");
  }

  isLoading = true;
  loadError = null;

  try {
    // Create seasons for the last 5 years starting from 2024
    const seasons = createSeasons(2025, 5);

    // Create leagues from our predefined map
    const leagues: League[] = Object.values(LEAGUE_MAP).map((league) => ({
      id: league.id.toString(),
      name: league.name,
      country: league.country,
      tier: 1,
    }));

    // Initialize arrays
    const teams: Team[] = [];
    const teamSeasons: TeamSeason[] = [];
    const players: Player[] = [];
    const playerTeamSeasons: PlayerTeamSeason[] = [];
    const matches: Match[] = [];

    // For the free tier (100 requests/day), we'll load only the current season initially
    // Users can load more data as needed
    const currentSeason = seasons.find((s) => s.is_current) || seasons[0];

    console.log(`Loading data for season ${currentSeason.name}...`);

    // Load data for each league in the current season
    for (const league of leagues) {
      try {
        console.log(`Loading ${league.name} data...`);

        // Fetch standings (this gives us teams and their stats)
        const standings = await apiFootballService.getStandings(
          parseInt(league.id),
          parseInt(currentSeason.id),
        );

        if (standings && standings.length > 0) {
          // Process each team in the standings
          for (const standing of standings) {
            const teamId = standing.team.id.toString();

            // Add team if not already added
            if (!teams.find((t) => t.id === teamId)) {
              teams.push({
                id: teamId,
                name: standing.team.name,
                short_name: standing.team.name.substring(0, 3).toUpperCase(),
                city: league.country,
              });
            }

            // Add team season stats
            const teamSeason = transformStanding(
              standing,
              league.id,
              currentSeason.id,
            );

            // Try to enhance with detailed statistics (optional, costs extra API call)
            try {
              const detailedStats = await apiFootballService.getTeamStatistics(
                standing.team.id,
                parseInt(league.id),
                parseInt(currentSeason.id),
              );
              if (detailedStats) {
                teamSeasons.push(
                  enhanceTeamSeasonWithStats(teamSeason, detailedStats),
                );
              } else {
                teamSeasons.push(teamSeason);
              }
            } catch (error) {
              // If detailed stats fail, just use standing data
              teamSeasons.push(teamSeason);
            }
          }

          // Fetch fixtures for this league (optional, can be loaded on demand)
          try {
            const fixtures = await apiFootballService.getFixtures(
              parseInt(league.id),
              parseInt(currentSeason.id),
            );
            fixtures.forEach((fixture) => {
              matches.push(transformFixture(fixture, currentSeason.id));
            });
          } catch (error) {
            console.warn(`Failed to load fixtures for ${league.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Failed to load data for ${league.name}:`, error);
        // Continue with other leagues
      }
    }

    // Store in cache
    dataCache = {
      seasons,
      leagues,
      teams,
      players,
      teamSeasons,
      playerTeamSeasons,
      matches,
      playerMatchStats: [], // Will be loaded on demand
    };

    console.log("Data loaded successfully:", {
      leagues: leagues.length,
      teams: teams.length,
      teamSeasons: teamSeasons.length,
      matches: matches.length,
    });

    isLoading = false;
    return dataCache;
  } catch (error) {
    isLoading = false;
    loadError = error instanceof Error ? error.message : "Unknown error";
    console.error("Error loading data from API:", error);
    throw error;
  }
}

/**
 * Load data for a specific season
 * Call this when user changes season
 */
export async function loadDataForSeason(seasonId: string): Promise<void> {
  if (!dataCache.leagues || !dataCache.seasons) {
    throw new Error("Initial data not loaded. Call loadAllData() first.");
  }

  console.log(`Loading data for season ${seasonId}...`);

  const leagues = dataCache.leagues;

  // Load data for each league in the specified season
  for (const league of leagues) {
    try {
      console.log(`Loading ${league.name} data for season ${seasonId}...`);

      // Fetch standings
      const standings = await apiFootballService.getStandings(
        parseInt(league.id),
        parseInt(seasonId),
      );

      if (standings && standings.length > 0) {
        // Process each team in the standings
        for (const standing of standings) {
          const teamId = standing.team.id.toString();

          // Add team if not already in cache
          if (!dataCache.teams?.find((t) => t.id === teamId)) {
            dataCache.teams = [
              ...(dataCache.teams || []),
              {
                id: teamId,
                name: standing.team.name,
                short_name: standing.team.name.substring(0, 3).toUpperCase(),
                city: league.country,
              },
            ];
          }

          // Add team season stats
          const teamSeason = transformStanding(standing, league.id, seasonId);

          // Check if already exists
          const existingIndex = dataCache.teamSeasons?.findIndex(
            (ts) =>
              ts.team_id === teamId &&
              ts.season_id === seasonId &&
              ts.league_id === league.id,
          );

          if (existingIndex !== undefined && existingIndex >= 0) {
            // Update existing
            dataCache.teamSeasons![existingIndex] = teamSeason;
          } else {
            // Add new
            dataCache.teamSeasons = [
              ...(dataCache.teamSeasons || []),
              teamSeason,
            ];
          }
        }

        // Optionally load fixtures
        try {
          const fixtures = await apiFootballService.getFixtures(
            parseInt(league.id),
            parseInt(seasonId),
          );

          // Add new fixtures
          const newFixtures = fixtures
            .filter(
              (f) =>
                !dataCache.matches?.find(
                  (m) => m.id === f.fixture.id.toString(),
                ),
            )
            .map((f) => transformFixture(f, seasonId));

          dataCache.matches = [...(dataCache.matches || []), ...newFixtures];
        } catch (error) {
          console.warn(`Failed to load fixtures for ${league.name}:`, error);
        }
      }
    } catch (error) {
      console.error(
        `Failed to load data for ${league.name}, season ${seasonId}:`,
        error,
      );
    }
  }

  console.log(`Season ${seasonId} data loaded successfully`);
}

/**
 * Load players for a specific team and season
 * This is done on-demand to save API requests
 */
export async function loadPlayersForTeamSeason(
  teamId: string,
  seasonId: string,
): Promise<Player[]> {
  try {
    // Check if already loaded
    const existingPlayers = dataCache.players?.filter((p) =>
      dataCache.playerTeamSeasons?.some(
        (pts) =>
          pts.player_id === p.id &&
          pts.team_id === teamId &&
          pts.season_id === seasonId,
      ),
    );

    if (existingPlayers && existingPlayers.length > 0) {
      return existingPlayers;
    }

    // Fetch from API
    const squad = await apiFootballService.getTeamSquad(parseInt(teamId));

    const newPlayers: Player[] = [];
    const newPlayerTeamSeasons: PlayerTeamSeason[] = [];

    for (const apiPlayer of squad) {
      // Get detailed player statistics
      try {
        const playerStats = await apiFootballService.getPlayerStatistics(
          apiPlayer.player.id,
          parseInt(seasonId),
        );

        if (playerStats) {
          const player = transformPlayer(playerStats);
          newPlayers.push(player);

          const playerTeamSeason = transformPlayerStatistics(
            playerStats,
            teamId,
            seasonId,
          );
          if (playerTeamSeason) {
            newPlayerTeamSeasons.push(playerTeamSeason);
          }
        }
      } catch (error) {
        // If we can't get stats, just add basic player info
        newPlayers.push({
          id: apiPlayer.player.id.toString(),
          name: apiPlayer.player.name,
          position: "Unknown",
          nationality: apiPlayer.player.nationality || "Unknown",
        });
      }
    }

    // Update cache
    dataCache.players = [...(dataCache.players || []), ...newPlayers];
    dataCache.playerTeamSeasons = [
      ...(dataCache.playerTeamSeasons || []),
      ...newPlayerTeamSeasons,
    ];

    return newPlayers;
  } catch (error) {
    console.error("Failed to load players for team:", error);
    return [];
  }
}

// Getter functions (keep all existing signatures)
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

export function getLeagueStandings(
  leagueId: string,
  seasonId: string,
): TeamSeason[] {
  if (!dataCache.teamSeasons) return [];

  return dataCache.teamSeasons
    .filter((ts) => ts.league_id === leagueId && ts.season_id === seasonId)
    .sort((a, b) => a.position - b.position);
}

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

// Helper functions
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

// Export loading state
export function getLoadingState() {
  return { isLoading, loadError };
}
