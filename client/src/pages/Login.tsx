import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Login() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-background flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl text-center space-y-8">
        <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3">
          <Package className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">توزيع بطاطس</h1>
          <p className="text-muted-foreground">نظام إدارة التوزيع المتقدم</p>
        </div>

        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full h-12 text-lg font-semibold shadow-xl shadow-primary/20"
            onClick={() => window.location.href = "/api/login"}
          >
            تسجيل الدخول
          </Button>
          <p className="text-xs text-muted-foreground">
            يلزم تسجيل الدخول للوصول إلى النظام
          </p>
        </div>
      </div>
    </div>
  );
}
