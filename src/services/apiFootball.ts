import axios, { AxiosInstance, AxiosResponse } from "axios";

// API Response Types
export interface APILeague {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
}

export interface APITeam {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    logo: string;
  };
}

export interface APIStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export interface APIPlayer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
      date: string;
      place: string;
      country: string;
    };
    nationality: string;
    height: string;
    weight: string;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      number: number;
      position: string;
      rating: string;
      captain: boolean;
    };
    substitutes: {
      in: number;
      out: number;
      bench: number;
    };
    shots: {
      total: number;
      on: number;
    };
    goals: {
      total: number;
      conceded: number;
      assists: number;
      saves: number;
    };
    passes: {
      total: number;
      key: number;
      accuracy: number;
    };
    tackles: {
      total: number;
      blocks: number;
      interceptions: number;
    };
    duels: {
      total: number;
      won: number;
    };
    dribbles: {
      attempts: number;
      success: number;
      past: number;
    };
    fouls: {
      drawn: number;
      committed: number;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
    penalty: {
      won: number;
      commited: number;
      scored: number;
      missed: number;
      saved: number;
    };
  }>;
}

// Simpler type for squad endpoint which returns basic player info
export interface APISquadPlayer {
  id: number;
  name: string;
  age: number;
  number: number;
  position: string;
  photo: string;
}

export interface APITeamStatistics {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  form: string;
  fixtures: {
    played: {
      home: number;
      away: number;
      total: number;
    };
    wins: {
      home: number;
      away: number;
      total: number;
    };
    draws: {
      home: number;
      away: number;
      total: number;
    };
    loses: {
      home: number;
      away: number;
      total: number;
    };
  };
  goals: {
    for: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
    against: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
  };
  clean_sheet: {
    home: number;
    away: number;
    total: number;
  };
}

export interface APIFixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class APIFootballService {
  private client: AxiosInstance;
  private cache: Map<string, CacheEntry<any>>;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor() {
    const apiKey = import.meta.env.VITE_API_FOOTBALL_KEY;
    const baseURL = import.meta.env.VITE_API_FOOTBALL_BASE_URL;

    if (!apiKey || apiKey === "your_api_key_here") {
      console.warn(
        "API-Football key not configured. Please add your API key to .env file",
      );
    }

    this.client = axios.create({
      baseURL,
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
      timeout: 10000,
    });

    // Initialize cache from localStorage
    this.cache = new Map();
    this.loadCacheFromStorage();

    // Add response interceptor for debugging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Request: ${response.config.url}`, {
          remaining: response.headers["x-ratelimit-requests-remaining"],
          limit: response.headers["x-ratelimit-requests-limit"],
        });
        return response;
      },
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      },
    );
  }

  // Cache management
  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem("api_football_cache");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error("Failed to load cache from storage:", error);
    }
  }

  private saveCacheToStorage(): void {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem("api_football_cache", JSON.stringify(cacheObject));
    } catch (error) {
      console.error("Failed to save cache to storage:", error);
    }
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      this.saveCacheToStorage();
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(
    key: string,
    data: T,
    expiresIn: number = this.CACHE_DURATION,
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
    this.saveCacheToStorage();
  }

  // API Methods
  async getLeagues(country?: string): Promise<APILeague[]> {
    const cacheKey = this.getCacheKey("leagues", { country });
    const cached = this.getFromCache<APILeague[]>(cacheKey);
    if (cached) return cached;

    try {
      const params: any = {};
      if (country) params.country = country;

      const response: AxiosResponse = await this.client.get("/leagues", {
        params,
      });
      const leagues = response.data.response || [];
      this.setCache(cacheKey, leagues);
      return leagues;
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
      throw error;
    }
  }

  async getStandings(leagueId: number, season: number): Promise<APIStanding[]> {
    const cacheKey = this.getCacheKey("standings", { leagueId, season });
    const cached = this.getFromCache<APIStanding[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.client.get("/standings", {
        params: { league: leagueId, season },
      });
      const standings =
        response.data.response?.[0]?.league?.standings?.[0] || [];
      this.setCache(cacheKey, standings);
      return standings;
    } catch (error) {
      console.error("Failed to fetch standings:", error);
      throw error;
    }
  }

  async getTeamStatistics(
    teamId: number,
    leagueId: number,
    season: number,
  ): Promise<APITeamStatistics | null> {
    const cacheKey = this.getCacheKey("team_statistics", {
      teamId,
      leagueId,
      season,
    });
    const cached = this.getFromCache<APITeamStatistics>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.client.get(
        "/teams/statistics",
        {
          params: { team: teamId, league: leagueId, season },
        },
      );
      const stats = response.data.response || null;
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error("Failed to fetch team statistics:", error);
      throw error;
    }
  }

  async getTeamSquad(teamId: number): Promise<APISquadPlayer[]> {
    const cacheKey = this.getCacheKey("team_squad", { teamId });
    const cached = this.getFromCache<APISquadPlayer[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.client.get("/players/squads", {
        params: { team: teamId },
      });
      const squad = response.data.response?.[0]?.players || [];
      this.setCache(cacheKey, squad);
      return squad;
    } catch (error) {
      console.error("Failed to fetch team squad:", error);
      throw error;
    }
  }

  async getPlayerStatistics(
    playerId: number,
    season: number,
  ): Promise<APIPlayer | null> {
    const cacheKey = this.getCacheKey("player_statistics", {
      playerId,
      season,
    });
    const cached = this.getFromCache<APIPlayer>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.client.get("/players", {
        params: { id: playerId, season },
      });
      const player = response.data.response?.[0] || null;
      this.setCache(cacheKey, player);
      return player;
    } catch (error) {
      console.error("Failed to fetch player statistics:", error);
      throw error;
    }
  }

  async getFixtures(
    leagueId: number,
    season: number,
    teamId?: number,
  ): Promise<APIFixture[]> {
    const cacheKey = this.getCacheKey("fixtures", { leagueId, season, teamId });
    const cached = this.getFromCache<APIFixture[]>(cacheKey);
    if (cached) return cached;

    try {
      const params: any = { league: leagueId, season };
      if (teamId) params.team = teamId;

      const response: AxiosResponse = await this.client.get("/fixtures", {
        params,
      });
      const fixtures = response.data.response || [];
      this.setCache(cacheKey, fixtures);
      return fixtures;
    } catch (error) {
      console.error("Failed to fetch fixtures:", error);
      throw error;
    }
  }

  async getTeams(leagueId: number, season: number): Promise<APITeam[]> {
    const cacheKey = this.getCacheKey("teams", { leagueId, season });
    const cached = this.getFromCache<APITeam[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.client.get("/teams", {
        params: { league: leagueId, season },
      });
      const teams = response.data.response || [];
      this.setCache(cacheKey, teams);
      return teams;
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      throw error;
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem("api_football_cache");
  }
}

// Export singleton instance
export const apiFootballService = new APIFootballService();
