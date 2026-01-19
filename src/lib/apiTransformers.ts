import {
  Season,
  League,
  Team,
  Player,
  TeamSeason,
  PlayerTeamSeason,
  Match,
} from "./csvLoader";
import {
  APILeague,
  APITeam,
  APIStanding,
  APIPlayer,
  APITeamStatistics,
  APIFixture,
} from "../services/apiFootball";

/**
 * Transform API-Football league data to our League type
 */
export function transformLeague(apiLeague: APILeague): League {
  return {
    id: apiLeague.league.id.toString(),
    name: apiLeague.league.name,
    country: apiLeague.league.country,
    tier: 1, // API doesn't provide tier, default to 1
  };
}

/**
 * Transform API-Football team data to our Team type
 */
export function transformTeam(apiTeam: APITeam): Team {
  return {
    id: apiTeam.team.id.toString(),
    name: apiTeam.team.name,
    short_name:
      apiTeam.team.code || apiTeam.team.name.substring(0, 3).toUpperCase(),
    city: apiTeam.team.country, // API doesn't provide city, using country
  };
}

/**
 * Transform API-Football standing data to our TeamSeason type
 */
export function transformStanding(
  apiStanding: APIStanding,
  leagueId: string,
  seasonId: string,
): TeamSeason {
  // Parse form string (e.g., "WWDLW") into array
  const formArray = apiStanding.form ? apiStanding.form.split("") : [];

  return {
    id: `${apiStanding.team.id}_${leagueId}_${seasonId}`,
    team_id: apiStanding.team.id.toString(),
    league_id: leagueId,
    season_id: seasonId,
    position: apiStanding.rank,
    points: apiStanding.points,
    matches_played: apiStanding.all.played,
    wins: apiStanding.all.win,
    draws: apiStanding.all.draw,
    losses: apiStanding.all.lose,
    goals_for: apiStanding.all.goals.for,
    goals_against: apiStanding.all.goals.against,
    xg: 0, // API-Football doesn't provide xG in free tier
    xga: 0, // API-Football doesn't provide xGA in free tier
    possession_avg: 50, // Default value, not available in standings endpoint
    shots_total: 0, // Not available in standings endpoint
    shots_on_target: 0, // Not available in standings endpoint
    clean_sheets: 0, // Will be updated from team statistics if available
    recent_form: formArray,
  };
}

/**
 * Transform API-Football team statistics to enhance TeamSeason data
 */
export function enhanceTeamSeasonWithStats(
  teamSeason: TeamSeason,
  apiStats: APITeamStatistics,
): TeamSeason {
  return {
    ...teamSeason,
    clean_sheets: apiStats.clean_sheet.total,
    // Note: shots and possession not available in API-Football free tier
    // These would need to be fetched from fixture statistics
  };
}

/**
 * Transform API-Football player data to our Player type
 */
export function transformPlayer(apiPlayer: APIPlayer): Player {
  const playerData = apiPlayer.player;
  return {
    id: playerData.id.toString(),
    name: playerData.name,
    position: apiPlayer.statistics?.[0]?.games?.position || "Unknown",
    nationality: playerData.nationality,
    date_of_birth: playerData.birth?.date,
  };
}

/**
 * Transform API-Football player statistics to our PlayerTeamSeason type
 */
export function transformPlayerStatistics(
  apiPlayer: APIPlayer,
  teamId: string,
  seasonId: string,
): PlayerTeamSeason | null {
  const playerData = apiPlayer.player;
  const stats = apiPlayer.statistics?.[0];

  if (!stats) return null;

  const passAccuracy = stats.passes.accuracy || 0;

  return {
    id: `${playerData.id}_${teamId}_${seasonId}`,
    player_id: playerData.id.toString(),
    team_id: teamId,
    season_id: seasonId,
    shirt_number: stats.games.number || 0,
    appearances: stats.games.appearences || 0,
    minutes_played: stats.games.minutes || 0,
    goals: stats.goals.total || 0,
    assists: stats.goals.assists || 0,
    xg: 0, // Not available in API-Football free tier
    xa: 0, // Not available in API-Football free tier
    shots_total: stats.shots.total || 0,
    shots_on_target: stats.shots.on || 0,
    passes_attempted: stats.passes.total || 0,
    passes_completed: Math.round(
      (stats.passes.total || 0) * (passAccuracy / 100),
    ),
    pass_accuracy: passAccuracy,
    key_passes: stats.passes.key || 0,
    dribbles_attempted: stats.dribbles.attempts || 0,
    dribbles_successful: stats.dribbles.success || 0,
    tackles: stats.tackles.total || 0,
    interceptions: stats.tackles.interceptions || 0,
    clearances: 0, // Not directly available
    blocks: stats.tackles.blocks || 0,
    yellow_cards: stats.cards.yellow || 0,
    red_cards: stats.cards.red || 0,
    average_rating: parseFloat(stats.games.rating || "0"),
  };
}

/**
 * Transform API-Football fixture data to our Match type
 */
export function transformFixture(
  apiFixture: APIFixture,
  seasonId: string,
): Match {
  return {
    id: apiFixture.fixture.id.toString(),
    season_id: seasonId,
    league_id: apiFixture.league.id.toString(),
    home_team_id: apiFixture.teams.home.id.toString(),
    away_team_id: apiFixture.teams.away.id.toString(),
    matchday: parseInt(apiFixture.league.round.match(/\d+/)?.[0] || "0"),
    match_date: apiFixture.fixture.date,
    home_score: apiFixture.goals.home || 0,
    away_score: apiFixture.goals.away || 0,
  };
}

/**
 * Create Season objects for the specified years
 */
export function createSeasons(startYear: number, count: number): Season[] {
  const seasons: Season[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    const year = startYear - i;
    const endYear = year + 1;
    const isCurrent =
      year === currentYear ||
      (year === currentYear - 1 && new Date().getMonth() < 7);

    seasons.push({
      id: year.toString(),
      name: `${year}/${endYear.toString().substring(2)}`,
      start_year: year,
      end_year: endYear,
      is_current: isCurrent,
    });
  }

  return seasons;
}

/**
 * Map league names to API-Football league IDs
 * Premier League: 39
 * La Liga: 140
 * Champions League: 2
 */
export const LEAGUE_MAP: Record<
  string,
  { id: number; name: string; country: string }
> = {
  "premier-league": { id: 39, name: "Premier League", country: "England" },
  "la-liga": { id: 140, name: "La Liga", country: "Spain" },
  "champions-league": {
    id: 2,
    name: "UEFA Champions League",
    country: "World",
  },
};

/**
 * Get league ID from league name
 */
export function getLeagueId(leagueName: string): number | null {
  const normalized = leagueName.toLowerCase().replace(/\s+/g, "-");
  return LEAGUE_MAP[normalized]?.id || null;
}
