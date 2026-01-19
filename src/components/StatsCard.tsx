import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  highlight?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  highlight,
}: StatsCardProps) {
  return (
    <div
      className={`bg-slate-800 rounded-xl p-6 shadow-lg border ${highlight ? "border-green-500 ring-2 ring-green-500/20" : "border-slate-700"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-slate-400">{title}</span>
        {Icon && (
          <div
            className={`p-2 rounded-lg ${highlight ? "bg-green-500/20" : "bg-slate-700"}`}
          >
            <Icon
              className={`w-4 h-4 ${highlight ? "text-green-500" : "text-slate-400"}`}
            />
          </div>
        )}
      </div>
      <div
        className={`text-3xl mb-1 ${highlight ? "text-green-500" : "text-white"}`}
      >
        {value}
      </div>
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2">
          {subtitle && (
            <span className="text-sm text-slate-500">{subtitle}</span>
          )}
          {trendValue && (
            <span
              className={`text-sm ${
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-slate-500"
              }`}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"} {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
