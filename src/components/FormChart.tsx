interface FormChartProps {
  form: string[];
}

export function FormChart({ form }: FormChartProps) {
  const getFormColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-600';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-slate-600';
    }
  };

  const getFormText = (result: string) => {
    switch (result) {
      case 'W': return 'Win';
      case 'D': return 'Draw';
      case 'L': return 'Loss';
      default: return 'N/A';
    }
  };

  const recentMatches = [
    { opponent: 'Brighton', result: 'W', score: '4-1', date: 'Mar 2' },
    { opponent: 'Nottingham Forest', result: 'W', score: '2-0', date: 'Feb 23' },
    { opponent: 'Chelsea', result: 'D', score: '1-1', date: 'Feb 17' },
    { opponent: 'Brentford', result: 'W', score: '3-1', date: 'Feb 5' },
    { opponent: 'Newcastle', result: 'W', score: '2-0', date: 'Jan 13' },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
      <div className="space-y-4">
        {/* Form Strip */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Last 5 Matches</div>
          <div className="flex gap-2">
            {form.map((result, index) => (
              <div
                key={index}
                className={`flex-1 ${getFormColor(result)} rounded-lg p-3 text-white text-center transition-transform hover:scale-105`}
              >
                <div className="text-xl">{result}</div>
                <div className="text-xs mt-1 opacity-90">{getFormText(result)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div>
          <div className="text-sm text-slate-400 mb-3">Recent Results</div>
          <div className="space-y-2">
            {recentMatches.map((match, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-slate-750 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs ${getFormColor(match.result)}`}>
                    {match.result}
                  </span>
                  <span className="text-white">{match.opponent}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">{match.score}</span>
                  <span className="text-xs text-slate-500">{match.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
