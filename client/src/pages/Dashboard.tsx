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
        <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-primary" />
              <CardTitle>تحليلات الذكاء الاصطناعي</CardTitle>
            </div>
            <CardDescription>رؤى ذكية لتحسين التدفق النقدي والمخزون</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingAI ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <div className="p-4 bg-white/50 rounded-xl border border-primary/10 backdrop-blur-sm">
                  <h4 className="font-semibold text-primary mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 ml-2" />
                    توقعات التدفق النقدي
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ai?.cashFlowForecast || "جاري تحليل البيانات المالية..."}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 ml-2" />
                      تحليل المخاطر
                    </h4>
                    <p className="text-sm text-orange-600/90 leading-relaxed">
                      {ai?.riskAnalysis || "لا توجد مخاطر حالية."}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                      <Package className="w-4 h-4 ml-2" />
                      نصائح المخزون
                    </h4>
                    <p className="text-sm text-blue-600/90 leading-relaxed">
                      {ai?.inventoryAdvice || "المخزون في حالة جيدة."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>تنبيهات النواقص</CardTitle>
            <CardDescription>أصناف وصلت لحد الطلب</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  جميع الأصناف متوفرة
                </div>
              ) : (
                metrics?.lowStockProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">المتبقي: {p.currentStock} {p.unit}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8">
                      طلب
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary" asChild>
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
