import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, ShoppingCart, Truck, 
  Package, Receipt, FileBarChart, Menu, LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "الرئيسية", icon: LayoutDashboard, href: "/" },
  { label: "المبيعات", icon: ShoppingCart, href: "/sales" },
  { label: "المشتريات", icon: Truck, href: "/purchases" },
  { label: "العملاء", icon: Users, href: "/customers" },
  { label: "الموردين", icon: Users, href: "/suppliers" },
  { label: "المخزون", icon: Package, href: "/inventory" },
  { label: "المصروفات", icon: Receipt, href: "/expenses" },
  { label: "التقارير", icon: FileBarChart, href: "/reports" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full sidebar-gradient">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20">
          <Package className="text-[#064e3b] w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-white">توزيع بطاطس</h1>
          <p className="text-xs text-emerald-100/70">نظام إدارة التوزيع</p>
        </div>
      </div>
      
      <div className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive 
                ? "bg-white/15 text-white shadow-sm backdrop-blur-sm -translate-x-1" 
                : "hover:bg-white/10 text-emerald-100/80 hover:text-white hover:-translate-x-1"
              }
            `}>
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-white/20 text-white">
                {user?.firstName?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.firstName || "المستخدم"}</p>
              <p className="text-xs text-emerald-100/60 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-emerald-100 hover:text-white hover:bg-white/10"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل خروج
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-background border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg">توزيع بطاطس</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 border-l">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 h-screen sticky top-0 border-l bg-card shadow-sm z-40">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
