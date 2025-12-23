# Football Analytics Dashboard

A modern, interactive football analytics platform built with React and Vite. This dashboard provides detailed insights into team and player performance, featuring comprehensive statistical analysis, visualizations, and comparative data.

## 🚀 Features

- **Dual Analysis Modes**:

  - **Team Analytics**: Comprehensive breakdown of team performance including league standings, match results, goal statistics, and possession metrics.
  - **Player Analytics**: In-depth player profiles with skill radars, heatmaps, and performance timelines.

- **Interactive Visualizations**:

  - Dynamic radar charts for player skill profiles
  - Bar charts for comparative analysis vs league averages
  - Trend lines for recent form and performance history
  - Positional heatmaps

- **Advanced Data Management**:

  - Real-time data loading from CSV files
  - Support for multiple seasons and leagues
  - Efficient client-side data caching and filtering

- **Modern UI/UX**:
  - Responsive dark-themed design
  - Intuitive navigation and filtering
  - Interactive tooltips and data points

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + module CSS
- **Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Parsing**: [Papa Parse](https://www.papaparse.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives

## 📦 Installation

1. **Clone the repository** (or download the source code)

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or the URL shown in your terminal).

## 📜 Available Scripts

- `npm run dev`: Starts the development server with HMR
- `npm run build`: Builds the application for production
- `npm run preview`: Preview the production build locally

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components and charts
│   ├── TeamStats.tsx   # Team analysis view
│   ├── PlayerStats.tsx # Player analysis view
│   ├── StatsCard.tsx   # Metric display card
│   └── ...
├── lib/
│   └── csvLoader.ts    # centralized CSV data fetching & type definitions
├── App.tsx             # Main application layout & state management
└── ...
public/
└── data/               # CSV data files (teams, players, matches, etc.)
```

## 📊 Data Management

The application is powered by a set of CSV files located in `public/data/`. The `csvLoader.ts` utility handles:

- Asynchronous fetching of CSV files
- Parsing using Papa Parse
- Type validation and transformation
- Relational mapping (e.g., linking players to teams and seasons)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
