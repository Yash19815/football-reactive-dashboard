# API-Football Integration Setup

## ⚠️ Important: API Key Configuration Required

Before running the application, you need to add your API-Football API key to the `.env` file.

### Steps to Configure:

1. **Open the `.env` file** in the project root directory
2. **Replace `your_api_key_here`** with your actual API-Football API key:

   ```
   VITE_API_FOOTBALL_KEY=your_actual_api_key_here
   VITE_API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
   ```

3. **Save the file** and restart the development server if it's already running

### Getting Your API Key:

If you don't have an API key yet:

1. Visit [API-Football](https://www.api-football.com/)
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Paste it into the `.env` file as described above

## API Usage & Caching

### Free Tier Limits:

- **100 requests per day**
- Data is automatically cached in your browser's localStorage
- Cache persists for 24 hours to minimize API requests

### Configured Leagues:

- **Premier League** (ID: 39)
- **La Liga** (ID: 140)
- **UEFA Champions League** (ID: 2)

### Configured Seasons:

- Last 5 seasons from current year
- Currently loading data for the current season only to save API requests

## Features:

✅ **Automatic Caching**: API responses are cached locally for 24 hours
✅ **Rate Limit Monitoring**: Console logs show remaining API requests
✅ **On-Demand Loading**: Player data is loaded only when needed
✅ **Error Handling**: Graceful fallbacks when API limits are reached

## Running the Application:

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

## Troubleshooting:

### "Failed to load data from API-Football" Error:

Check the following:

1. ✓ Your API key is correctly set in `.env`
2. ✓ You haven't exceeded your daily API limit (100 requests)
3. ✓ Your internet connection is working
4. ✓ The `.env` file is in the project root directory

### Clear Cache:

If you need to refresh the data:

1. Open browser developer tools (F12)
2. Go to Console tab
3. Type: `localStorage.removeItem('api_football_cache')`
4. Press Enter and refresh the page

## Data Limitations (Free Tier):

⚠️ Some advanced metrics may not be available:

- **xG (Expected Goals)**: Not available in free tier
- **xGA (Expected Goals Against)**: Not available in free tier
- **Possession statistics**: Limited availability
- **Shot statistics**: Available for some leagues only

These fields will show default/zero values in the dashboard.

## Migration Notes:

- ✅ All CSV files have been replaced with API calls
- ✅ All existing components work without changes
- ✅ Type definitions remain unchanged
- ✅ UI/UX remains the same

The old CSV files in `/public/data/` can be safely deleted if desired.
