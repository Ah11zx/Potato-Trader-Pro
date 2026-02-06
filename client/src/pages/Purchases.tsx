import { usePurchases } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function PurchasesPage() {
  const { data: purchases } = usePurchases();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المشتريات</h1>
          <p className="text-muted-foreground">سجل الوارد من المزارع والتكاليف</p>
        </div>
        <Button size="lg" className="shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 ml-2" />
          شراء جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل فواتير الشراء</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>تكلفة الشراء</TableHead>
                <TableHead>النقل</TableHead>
                <TableHead>العمالة</TableHead>
                <TableHead>الإجمالي الكلي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases?.map((purchase: any) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">#{purchase.id}</TableCell>
                  <TableCell>{purchase.supplierId || "مورد عام"}</TableCell>
                  <TableCell>{format(new Date(purchase.date), "yyyy-MM-dd")}</TableCell>
                  <TableCell>{purchase.totalCost} ر.س</TableCell>
                  <TableCell>{purchase.transportCost} ر.س</TableCell>
                  <TableCell>{purchase.laborCost} ر.س</TableCell>
                  <TableCell className="font-bold">
                    {(Number(purchase.totalCost) + Number(purchase.transportCost) + Number(purchase.laborCost)).toFixed(2)} ر.س
                  </TableCell>
                </TableRow>
              ))}
              {(!purchases || purchases.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد مشتريات مسجلة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
