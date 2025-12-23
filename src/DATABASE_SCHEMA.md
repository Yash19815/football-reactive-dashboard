# Football Analytics Dashboard - Database Schema

## Overview
This schema supports season-based filtering where teams and players are only visible for seasons in which they actually participated. It tracks historical data across multiple seasons, leagues, and player transfers.

---

## Core Tables

### 1. `seasons`
Stores all available seasons in the system.

```sql
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(10) NOT NULL UNIQUE,  -- e.g., "2023/24"
  start_year INTEGER NOT NULL,        -- e.g., 2023
  end_year INTEGER NOT NULL,          -- e.g., 2024
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example data:
-- ('2023/24', 2023, 2024, true)
-- ('2022/23', 2022, 2023, false)
```

---

### 2. `leagues`
Stores league/competition information.

```sql
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,         -- e.g., "Premier League"
  country VARCHAR(100) NOT NULL,      -- e.g., "England"
  tier INTEGER DEFAULT 1,             -- League tier (1 = top division)
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3. `teams`
Stores team information (independent of seasons).

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(50),             -- e.g., "Man City"
  founded_year INTEGER,
  stadium VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Relationship Tables

### 4. `team_seasons`
Junction table linking teams to specific league-season combinations.
**Key purpose**: Determines which teams appear in dropdowns for each season.

```sql
CREATE TABLE team_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  
  -- League standings data
  position INTEGER,
  points INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  
  -- Advanced team statistics
  xg DECIMAL(5,2) DEFAULT 0,          -- Expected goals
  xga DECIMAL(5,2) DEFAULT 0,         -- Expected goals against
  possession_avg DECIMAL(4,2),        -- Average possession %
  shots_total INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  pass_accuracy DECIMAL(4,2),
  clean_sheets INTEGER DEFAULT 0,
  
  -- Form (last 5 matches as JSON array)
  recent_form JSONB,                  -- e.g., ['W', 'W', 'D', 'L', 'W']
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, league_id, season_id)
);

-- Indexes for fast filtering
CREATE INDEX idx_team_seasons_season ON team_seasons(season_id);
CREATE INDEX idx_team_seasons_league ON team_seasons(league_id);
CREATE INDEX idx_team_seasons_team ON team_seasons(team_id);
```

---

### 5. `players`
Stores player information (independent of teams/seasons).

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  nationality VARCHAR(100),
  position VARCHAR(50),               -- e.g., "Forward", "Midfielder"
  preferred_foot VARCHAR(10),         -- "Left", "Right", "Both"
  height_cm INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 6. `player_team_seasons`
Junction table linking players to specific team-season combinations.
**Key purpose**: Determines which players appear in dropdowns for each team-season pair.

```sql
CREATE TABLE player_team_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  
  -- Contract information
  shirt_number INTEGER,
  transfer_fee_millions DECIMAL(10,2),
  contract_start DATE,
  contract_end DATE,
  
  -- Basic statistics
  appearances INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  
  -- Advanced offensive statistics
  xg DECIMAL(5,2) DEFAULT 0,          -- Expected goals
  xa DECIMAL(5,2) DEFAULT 0,          -- Expected assists
  shots_total INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  shot_accuracy DECIMAL(4,2),
  
  -- Passing statistics
  passes_attempted INTEGER DEFAULT 0,
  passes_completed INTEGER DEFAULT 0,
  pass_accuracy DECIMAL(4,2),
  key_passes INTEGER DEFAULT 0,
  through_balls INTEGER DEFAULT 0,
  
  -- Dribbling statistics
  dribbles_attempted INTEGER DEFAULT 0,
  dribbles_successful INTEGER DEFAULT 0,
  dribble_success_rate DECIMAL(4,2),
  
  -- Defensive statistics
  tackles INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  clearances INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  duels_won INTEGER DEFAULT 0,
  duels_total INTEGER DEFAULT 0,
  
  -- Discipline
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  
  -- Performance ratings
  average_rating DECIMAL(3,2),        -- e.g., 7.85
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(player_id, team_id, season_id)
);

-- Indexes for fast filtering
CREATE INDEX idx_player_team_seasons_player ON player_team_seasons(player_id);
CREATE INDEX idx_player_team_seasons_team ON player_team_seasons(team_id);
CREATE INDEX idx_player_team_seasons_season ON player_team_seasons(season_id);
CREATE INDEX idx_player_team_seasons_team_season ON player_team_seasons(team_id, season_id);
```

---

## Detailed Match Data (Optional but Recommended)

### 7. `matches`
Stores individual match information.

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  matchday INTEGER NOT NULL,          -- Matchday number in season
  match_date DATE NOT NULL,
  kickoff_time TIME,
  venue VARCHAR(100),
  
  -- Scores
  home_score INTEGER,
  away_score INTEGER,
  
  -- Match statistics
  home_possession DECIMAL(4,2),
  away_possession DECIMAL(4,2),
  home_shots INTEGER,
  away_shots INTEGER,
  home_shots_on_target INTEGER,
  away_shots_on_target INTEGER,
  home_xg DECIMAL(4,2),
  away_xg DECIMAL(4,2),
  
  -- Match status
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'live', 'finished'
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(season_id, home_team_id, away_team_id, matchday)
);

CREATE INDEX idx_matches_season ON matches(season_id);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_matches_date ON matches(match_date);
```

---

### 8. `player_match_stats`
Stores per-match player statistics for timeline charts.

```sql
CREATE TABLE player_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Participation
  minutes_played INTEGER DEFAULT 0,
  started BOOLEAN DEFAULT FALSE,
  substituted_on_minute INTEGER,
  substituted_off_minute INTEGER,
  
  -- Performance
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  rating DECIMAL(3,2),                -- Match rating (e.g., 8.5)
  
  -- Detailed stats
  shots INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  passes_attempted INTEGER DEFAULT 0,
  passes_completed INTEGER DEFAULT 0,
  key_passes INTEGER DEFAULT 0,
  dribbles_attempted INTEGER DEFAULT 0,
  dribbles_successful INTEGER DEFAULT 0,
  tackles INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  
  -- Positional data (for heatmaps)
  touches_attacking_third INTEGER DEFAULT 0,
  touches_defensive_third INTEGER DEFAULT 0,
  touches_middle_third INTEGER DEFAULT 0,
  touches_in_box INTEGER DEFAULT 0,
  
  -- Heatmap coordinates (JSON array of {x, y, intensity})
  heatmap_data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(player_id, match_id)
);

CREATE INDEX idx_player_match_stats_player ON player_match_stats(player_id);
CREATE INDEX idx_player_match_stats_match ON player_match_stats(match_id);
```

---

## Query Examples

### Get teams available for a specific season and league

```sql
SELECT DISTINCT t.id, t.name, t.short_name
FROM teams t
JOIN team_seasons ts ON t.id = ts.team_id
WHERE ts.season_id = '...' 
  AND ts.league_id = '...'
ORDER BY t.name;
```

### Get players available for a specific team and season

```sql
SELECT DISTINCT p.id, p.name, p.position
FROM players p
JOIN player_team_seasons pts ON p.id = pts.player_id
WHERE pts.team_id = '...' 
  AND pts.season_id = '...'
ORDER BY p.name;
```

### Get team statistics for dashboard

```sql
SELECT 
  t.name AS team_name,
  ts.position,
  ts.points,
  ts.wins,
  ts.draws,
  ts.losses,
  ts.goals_for,
  ts.goals_against,
  ts.goal_difference,
  ts.xg,
  ts.xga,
  ts.possession_avg,
  ts.shots_total,
  ts.shots_on_target,
  ts.clean_sheets,
  ts.recent_form
FROM team_seasons ts
JOIN teams t ON ts.team_id = t.id
WHERE ts.team_id = '...' 
  AND ts.season_id = '...';
```

### Get player statistics for dashboard

```sql
SELECT 
  p.name,
  p.position,
  pts.minutes_played,
  pts.goals,
  pts.assists,
  pts.xg,
  pts.xa,
  pts.pass_accuracy,
  pts.key_passes,
  pts.dribbles_successful,
  pts.dribbles_attempted,
  pts.tackles,
  pts.interceptions,
  pts.average_rating
FROM player_team_seasons pts
JOIN players p ON pts.player_id = p.id
WHERE pts.player_id = '...' 
  AND pts.team_id = '...'
  AND pts.season_id = '...';
```

### Get player timeline data (goals/assists per matchday)

```sql
SELECT 
  m.matchday,
  m.match_date,
  pms.goals,
  pms.assists,
  pms.rating,
  pms.minutes_played,
  CASE 
    WHEN m.home_team_id = pms.team_id THEN away_team.name
    ELSE home_team.name
  END AS opponent
FROM player_match_stats pms
JOIN matches m ON pms.match_id = m.id
JOIN teams home_team ON m.home_team_id = home_team.id
JOIN teams away_team ON m.away_team_id = away_team.id
WHERE pms.player_id = '...'
  AND m.season_id = '...'
ORDER BY m.matchday;
```

### Get league standings for a season

```sql
SELECT 
  ts.position,
  t.name AS team_name,
  ts.matches_played,
  ts.wins,
  ts.draws,
  ts.losses,
  ts.goals_for,
  ts.goals_against,
  ts.goal_difference,
  ts.points,
  ts.recent_form
FROM team_seasons ts
JOIN teams t ON ts.team_id = t.id
WHERE ts.league_id = '...' 
  AND ts.season_id = '...'
ORDER BY ts.position;
```

---

## Key Design Decisions

1. **Separation of Concerns**: Teams and players exist independently of seasons, allowing for historical tracking across transfers and promotions/relegations.

2. **Junction Tables**: `team_seasons` and `player_team_seasons` are the core tables that control visibility in dropdowns based on season selection.

3. **Player Transfers**: When a player moves teams, they get separate records in `player_team_seasons` for each team-season combination.

4. **Historical Data**: All statistics are season-specific, preserving historical performance across years.

5. **Flexible Queries**: The schema supports efficient filtering by season, league, team, or player using indexed foreign keys.

6. **Extensibility**: Match-level data allows for detailed timeline charts and heatmaps while maintaining aggregate season stats for quick dashboard loading.

---

## Sample Data Scenario

**Example**: Cristiano Ronaldo at Manchester United (2021/22), then Al Nassr (2022/23, 2023/24)

```sql
-- Player record (one record)
INSERT INTO players (name, position) VALUES ('Cristiano Ronaldo', 'Forward');

-- Player-team-season records (one per team-season)
INSERT INTO player_team_seasons (player_id, team_id, season_id, goals, assists, ...)
VALUES 
  ('ronaldo_id', 'man_utd_id', '2021_22_id', 18, 3, ...),
  ('ronaldo_id', 'al_nassr_id', '2022_23_id', 14, 2, ...),
  ('ronaldo_id', 'al_nassr_id', '2023_24_id', 35, 11, ...);
```

**Result**: Ronaldo only appears in Man United's dropdown for 2021/22, and Al Nassr's dropdown for 2022/23 and 2023/24.
