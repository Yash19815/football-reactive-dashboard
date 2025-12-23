# Football Analytics Dashboard - Implementation Notes

## Database Schema Implementation

### Overview
The database schema has been designed to support **season-based filtering** where teams and players are only visible for seasons in which they participated. This ensures historical accuracy and prevents showing anachronistic data (e.g., a player appearing for a team before they joined).

### Core Tables

1. **`seasons`** - All available seasons
2. **`leagues`** - Competition information  
3. **`teams`** - Team master data
4. **`players`** - Player master data
5. **`team_seasons`** - Junction table controlling which teams appear in which league-season combinations
6. **`player_team_seasons`** - Junction table controlling which players appear for which team-season combinations

### Key Features

#### Season-Based Visibility
```typescript
// When season changes, available teams update
const getAvailableTeams = (league: string, currentSeason: string) => {
  // Query: SELECT teams WHERE team_seasons.league_id = ? AND season_id = ?
}

// When season OR team changes, available players update  
const getAvailablePlayers = (team: string, currentSeason: string) => {
  // Query: SELECT players WHERE player_team_seasons.team_id = ? AND season_id = ?
}
```

#### Transfer Handling
Players who transferred between teams have separate records in `player_team_seasons`:
- Player at Team A in 2021/22 → one record
- Same player at Team B in 2022/23 → different record
- Player only appears in Team A's dropdown for 2021/22
- Player only appears in Team B's dropdown for 2022/23

#### Example Scenarios

**Scenario 1: Player Transfer**
- Cristiano Ronaldo at Manchester United (2021/22)
- Cristiano Ronaldo at Al Nassr (2022/23, 2023/24)

Result: When you select Manchester United + 2021/22, Ronaldo appears. When you select 2023/24, Ronaldo does NOT appear in Manchester United's dropdown (he's at Al Nassr).

**Scenario 2: Team Promotion/Relegation**
- Team promoted from Championship to Premier League in 2022/23
- No record in `team_seasons` for Premier League + 2021/22
- Team only appears in Premier League dropdown from 2022/23 onwards

## UI/UX Features

### Dark Theme
- **Background**: slate-900 (main), slate-800 (cards)
- **Text**: white (primary), slate-400 (secondary), slate-500 (tertiary)
- **Borders**: slate-700 (cards), slate-600 (inputs)
- **Accent**: #45914d (green) - used for highlights, active states, key metrics

### Interactive Dropdowns

1. **Season Dropdown** (Global Filter)
   - Changes all data across the dashboard
   - Updates available teams for selected league
   - Updates available players for selected team
   - Cascades changes throughout the app

2. **Mode Toggle** (Team vs Player)
   - Switches between two distinct analytics views
   - Team mode: League → Team selection
   - Player mode: Team → Player selection

3. **Nested Dropdowns**
   - **Team Mode**: League → Team (2-level hierarchy)
   - **Player Mode**: Team → Player (2-level hierarchy)
   - Each level filters the next level's options

### Responsive Design
- **Desktop**: 4-column grid for stat cards
- **Tablet**: 2-column grid
- **Mobile**: 1-column grid
- Charts adapt to container width using ResponsiveContainer

## Component Architecture

### Reusable Components

#### `StatsCard`
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  highlight?: boolean; // Uses green accent when true
}
```

#### `TeamStats`
Displays:
- Key performance indicators (position, record, goals, xG)
- Advanced statistics (possession, shots, clean sheets)
- League standings table (highlighted row for selected team)
- Recent form with W/D/L indicators
- Performance comparison bar charts
- Monthly performance stacked bar chart
- Team comparison radar chart

#### `PlayerStats`
Displays:
- Performance overview (minutes, goals, assists, contributions)
- Technical statistics (passing, dribbling, defensive actions)
- Skills radar chart (shooting, passing, dribbling, etc.)
- Passing breakdown (horizontal bar chart)
- Defensive contributions bar chart
- Positional heatmap (on football pitch)
- Performance timeline (goals/assists per matchday)
- Cumulative contributions line chart
- Match ratings over time

### Chart Styling (Dark Theme)
All recharts components use:
- **Grid**: #334155 (slate-700)
- **Axes**: #94a3b8 (slate-400)
- **Tooltips**: 
  - Background: #1e293b (slate-800)
  - Border: #334155 (slate-700)
  - Text: white
- **Primary Bar/Line**: #45914d (green)
- **Secondary Bar/Line**: #475569 (slate-600) or other context colors

## Data Flow

```
Season Change
    ↓
Update Available Teams (based on league + season)
    ↓
Update Selected Team (first available)
    ↓
If Player Mode: Update Available Players (based on team + season)
    ↓
Refresh Dashboard Data
```

```
Mode Change (Team ↔ Player)
    ↓
Switch Dropdown Context
    ↓
Update Available Options
    ↓
Refresh Dashboard Data
```

## Production Database Queries

### Get Teams for Season + League
```sql
SELECT DISTINCT t.id, t.name, t.short_name
FROM teams t
JOIN team_seasons ts ON t.id = ts.team_id
WHERE ts.season_id = ? AND ts.league_id = ?
ORDER BY t.name;
```

### Get Players for Team + Season
```sql
SELECT DISTINCT p.id, p.name, p.position
FROM players p
JOIN player_team_seasons pts ON p.id = pts.player_id
WHERE pts.team_id = ? AND pts.season_id = ?
ORDER BY p.name;
```

### Get Team Stats
```sql
SELECT 
  t.name, ts.position, ts.points, ts.wins, ts.draws, ts.losses,
  ts.goals_for, ts.goals_against, ts.xg, ts.xga,
  ts.possession_avg, ts.shots_total, ts.shots_on_target,
  ts.clean_sheets, ts.recent_form
FROM team_seasons ts
JOIN teams t ON ts.team_id = t.id
WHERE ts.team_id = ? AND ts.season_id = ?;
```

### Get Player Stats
```sql
SELECT 
  p.name, p.position, pts.minutes_played, pts.goals, pts.assists,
  pts.xg, pts.xa, pts.pass_accuracy, pts.key_passes,
  pts.dribbles_successful, pts.dribbles_attempted,
  pts.tackles, pts.interceptions, pts.average_rating
FROM player_team_seasons pts
JOIN players p ON pts.player_id = p.id
WHERE pts.player_id = ? AND pts.team_id = ? AND pts.season_id = ?;
```

### Get Player Timeline (for charts)
```sql
SELECT 
  m.matchday, m.match_date, pms.goals, pms.assists, 
  pms.rating, pms.minutes_played,
  CASE 
    WHEN m.home_team_id = pms.team_id THEN away_team.name
    ELSE home_team.name
  END AS opponent
FROM player_match_stats pms
JOIN matches m ON pms.match_id = m.id
JOIN teams home_team ON m.home_team_id = home_team.id
JOIN teams away_team ON m.away_team_id = away_team.id
WHERE pms.player_id = ? AND m.season_id = ?
ORDER BY m.matchday;
```

## Mock Data Implementation

Current implementation uses mock data with simulated season filtering:
- Older seasons (2020/21, 2021/22) show fewer players to simulate transfers
- All teams available across all seasons (simplified for demo)
- In production, replace with actual database queries

## Future Enhancements

1. **Match-by-Match Data**: Integrate detailed match stats for granular analysis
2. **Player Comparison**: Side-by-side comparison like team comparison
3. **Export Functionality**: Download charts as images or data as CSV
4. **Filters**: Additional filters for position, age, nationality
5. **Search**: Quick search for teams/players instead of dropdown scrolling
6. **Favorites**: Save favorite teams/players for quick access
7. **Historical Trends**: Multi-season trend analysis
8. **Real-time Data**: Live match updates during games
