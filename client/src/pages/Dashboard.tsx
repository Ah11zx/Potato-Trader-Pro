import { useDashboardMetrics, useAIInsights } from "@/hooks/use-data";
import { StatCard } from "@/components/StatCard";
import { 
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, 
  Package, BrainCircuit, ArrowUpRight 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: ai, isLoading: loadingAI } = useAIInsights();

  if (loadingMetrics) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة المعلومات</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء أعمالك اليوم.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/sales">
            <Button size="lg" className="shadow-lg shadow-primary/25">
              <TrendingUp className="w-4 h-4 ml-2" />
              بيع جديد
            </Button>
          </Link>
          <Link href="/purchases">
            <Button variant="outline" size="lg">
              <TrendingDown className="w-4 h-4 ml-2" />
              شراء جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي الإيرادات" 
          value={`${metrics?.totalRevenue.toLocaleString()} ر.س`}
          icon={DollarSign}
          color="primary"
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          title="صافي الربح" 
          value={`${metrics?.totalProfit.toLocaleString()} ر.س`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard 
          title="الديون المستحقة" 
          value={`${metrics?.totalDebt.toLocaleString()} ر.س`}
          icon={AlertTriangle}
          color="destructive"
          trend="عالي المخاطر"
          trendUp={false}
        />
        <StatCard 
          title="تنبيهات المخزون" 
          value={`${metrics?.lowStockProducts.length} أصناف`}
          icon={Package}
          color="orange"
        />
      </div>

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight">المساعد الذكي (AI)</CardTitle>
                <CardDescription className="text-xs font-medium">رؤى احترافية من بياناتك الحقيقية</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {loadingAI ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 shadow-inner group-hover:bg-primary/10 transition-colors duration-500">
                  <h4 className="font-bold text-primary mb-3 flex items-center text-sm uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 ml-2" />
                    توقعات التدفق النقدي
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    {ai?.cashFlowForecast || "جاري تحليل البيانات المالية..."}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 bg-destructive/5 rounded-2xl border border-destructive/10 hover:bg-destructive/10 transition-colors duration-500">
                    <h4 className="font-bold text-destructive mb-3 flex items-center text-sm uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 ml-2" />
                      تحليل المخاطر
                    </h4>
                    <p className="text-sm text-destructive/90 leading-relaxed font-medium">
                      {ai?.riskAnalysis || "لا توجد مخاطر حالية."}
                    </p>
                  </div>
                  <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 hover:bg-blue-500/10 transition-colors duration-500">
                    <h4 className="font-bold text-blue-600 mb-3 flex items-center text-sm uppercase tracking-wider">
                      <Package className="w-4 h-4 ml-2" />
                      نصائح المخزون
                    </h4>
                    <p className="text-sm text-blue-600/90 leading-relaxed font-medium">
                      {ai?.inventoryAdvice || "المخزون في حالة جيدة."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="glass-card shadow-lg border-white/40">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight">تنبيهات النواقص</CardTitle>
            <CardDescription className="text-xs">تحرك سريعاً لتجنب نفاد الكمية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.lowStockProducts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">المخزون آمن</p>
                </div>
              ) : (
                metrics?.lowStockProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-all duration-300">
                    <div>
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest mt-0.5">المتبقي: {p.currentStock} {p.unit}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-600 text-xs font-bold">
                      طلب
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-primary hover:bg-primary/5 font-bold text-sm transition-colors rounded-xl" asChild>
              <Link href="/inventory">
                عرض المخزون بالكامل
                <ArrowUpRight className="w-4 h-4 mr-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-3"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
