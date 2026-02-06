import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "primary" | "blue" | "orange" | "destructive";
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className, color = "primary" }: StatCardProps) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    blue: "text-blue-600 bg-blue-100",
    orange: "text-orange-600 bg-orange-100",
    destructive: "text-destructive bg-destructive/10",
  };

  return (
    <div className={cn(
      "glass-card rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden",
      className
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-primary/10" />
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("p-4 rounded-2xl transition-all duration-500 shadow-sm group-hover:scale-110", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm animate-in fade-in zoom-in duration-700",
            trendUp ? "text-green-700 bg-green-100/80" : "text-red-700 bg-red-100/80"
          )}>
            {trend}
          </div>
        )}
      </div>
      <div className="mt-6 relative z-10">
        <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300">
          {value}
        </h3>
      </div>
    </div>
  );
}
