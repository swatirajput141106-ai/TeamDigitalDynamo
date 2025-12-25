import { Sparkles } from "lucide-react";

interface PredictionBadgeProps {
  rushLevel: "low" | "medium" | "high";
  waitMinutes: number;
  className?: string;
}

export function PredictionBadge({ rushLevel, waitMinutes, className = "" }: PredictionBadgeProps) {
  const colors = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const labels = {
    low: "Quiet",
    medium: "Moderate",
    high: "Busy",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
        ${colors[rushLevel]}
      `}>
        <span className="relative flex h-2 w-2 mr-1">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
             rushLevel === 'low' ? 'bg-emerald-400' : rushLevel === 'medium' ? 'bg-amber-400' : 'bg-rose-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
             rushLevel === 'low' ? 'bg-emerald-500' : rushLevel === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
          }`}></span>
        </span>
        {labels[rushLevel]} Rush
      </div>
      
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-primary/5 px-3 py-1 rounded-full">
        <Sparkles className="w-3 h-3 text-primary" />
        AI Estimate: ~{waitMinutes} min
      </div>
    </div>
  );
}
