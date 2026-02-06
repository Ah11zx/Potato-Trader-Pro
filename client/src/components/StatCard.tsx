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
      "bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 group",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-xl transition-colors", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            trendUp ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
          )}>
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1 tracking-tight text-foreground group-hover:text-primary transition-colors">
          {value}
        </h3>
      </div>
    </div>
  );
}
