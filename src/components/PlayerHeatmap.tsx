interface PlayerHeatmapProps {
  position: string;
}

export function PlayerHeatmap({ position }: PlayerHeatmapProps) {
  // Generate heatmap data based on position
  const generateHeatmapData = () => {
    const data: { x: number; y: number; intensity: number }[] = [];
    
    // Forward - concentrate in attacking third
    if (position === 'Forward') {
      for (let i = 0; i < 50; i++) {
        data.push({
          x: Math.random() * 100,
          y: 20 + Math.random() * 40,
          intensity: Math.random() * 0.6 + 0.4
        });
      }
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
      <div className="relative bg-gradient-to-b from-green-700 to-green-800 rounded-lg overflow-hidden" style={{ aspectRatio: '105/68' }}>
        {/* Football pitch markings */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 105 68">
          {/* Outline */}
          <rect x="2" y="2" width="101" height="64" fill="none" stroke="white" strokeWidth="0.3" />
          
          {/* Center line */}
          <line x1="52.5" y1="2" x2="52.5" y2="66" stroke="white" strokeWidth="0.3" />
          
          {/* Center circle */}
          <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="white" strokeWidth="0.3" />
          <circle cx="52.5" cy="34" r="0.5" fill="white" />
          
          {/* Penalty areas */}
          <rect x="2" y="13.84" width="16.5" height="40.32" fill="none" stroke="white" strokeWidth="0.3" />
          <rect x="86.5" y="13.84" width="16.5" height="40.32" fill="none" stroke="white" strokeWidth="0.3" />
          
          {/* Goal areas */}
          <rect x="2" y="24.84" width="5.5" height="18.32" fill="none" stroke="white" strokeWidth="0.3" />
          <rect x="97.5" y="24.84" width="5.5" height="18.32" fill="none" stroke="white" strokeWidth="0.3" />
          
          {/* Penalty arcs */}
          <path d="M 18.5 23.16 A 9.15 9.15 0 0 1 18.5 44.84" fill="none" stroke="white" strokeWidth="0.3" />
          <path d="M 86.5 23.16 A 9.15 9.15 0 0 0 86.5 44.84" fill="none" stroke="white" strokeWidth="0.3" />
          
          {/* Penalty spots */}
          <circle cx="13.5" cy="34" r="0.5" fill="white" />
          <circle cx="91.5" cy="34" r="0.5" fill="white" />
        </svg>

        {/* Heatmap overlay */}
        <div className="absolute inset-0">
          {heatmapData.map((point, index) => (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: '60px',
                height: '60px',
                background: `radial-gradient(circle, rgba(239, 68, 68, ${point.intensity}) 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Activity Intensity</div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-3 rounded" style={{ 
              background: 'linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 1))' 
            }} />
            <span className="text-xs text-slate-300">High</span>
          </div>
        </div>

        {/* Position label */}
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700">
          <div className="text-xs text-slate-400">Position</div>
          <div className="text-white">{position}</div>
        </div>
      </div>

      {/* Stats below heatmap */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-3 bg-slate-750 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-xs mb-1">Touches</div>
          <div className="text-xl text-white">1,847</div>
        </div>
        <div className="text-center p-3 bg-slate-750 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-xs mb-1">Attacking Third</div>
          <div className="text-xl text-white">68%</div>
        </div>
        <div className="text-center p-3 bg-slate-750 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-xs mb-1">Box Touches</div>
          <div className="text-xl text-white">342</div>
        </div>
      </div>
    </div>
  );
}
