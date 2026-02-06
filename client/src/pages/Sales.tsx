import { useState } from "react";
import { useProducts, useCustomers, useCreateSale, useSales } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

export default function SalesPage() {
  const { data: sales } = useSales();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المبيعات</h1>
          <p className="text-muted-foreground">إدارة فواتير البيع ونقاط البيع</p>
        </div>
        <NewSaleDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>المدفوع</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales?.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">#{sale.id}</TableCell>
                  <TableCell>{sale.customerId}</TableCell>
                  <TableCell>{format(new Date(sale.date), "yyyy-MM-dd")}</TableCell>
                  <TableCell>{sale.totalAmount} ر.س</TableCell>
                  <TableCell>{sale.paidAmount} ر.س</TableCell>
                  <TableCell>
                    <Badge variant={
                      sale.paymentStatus === 'paid' ? 'default' : 
                      sale.paymentStatus === 'credit' ? 'destructive' : 'secondary'
                    }>
                      {sale.paymentStatus === 'paid' ? 'مدفوع' : 
                       sale.paymentStatus === 'credit' ? 'آجل' : 'جزئي'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!sales || sales.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد مبيعات مسجلة حتى الآن
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

function NewSaleDialog() {
  const [open, setOpen] = useState(false);
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const { mutateAsync: createSale, isPending } = useCreateSale();
  
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");

  const addToCart = (productId: string) => {
    const product = products?.find(p => p.id.toString() === productId);
    if (!product) return;
    setCart([...cart, { ...product, quantity: 1, price: 0 }]); // Default price 0, user edits
  };

  const updateCartItem = (index: number, field: string, value: number) => {
    const newCart = [...cart];
    newCart[index][field] = value;
    setCart(newCart);
  };

  const removeCartItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleSubmit = async () => {
    if (!selectedCustomer) return;
    
    await createSale({
      customerId: parseInt(selectedCustomer),
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price
      })),
      totalAmount,
      paidAmount: paymentType === 'credit' ? 0 : parseFloat(paidAmount || totalAmount.toString()),
      paymentStatus: paymentType === 'credit' ? 'credit' : (parseFloat(paidAmount) < totalAmount ? 'partial' : 'paid'),
      date: new Date().toISOString()
    });
    setOpen(false);
    setCart([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg shadow-primary/25">
          <ShoppingCart className="w-4 h-4 ml-2" />
          فاتورة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء فاتورة بيع جديدة</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">العميل</label>
              <Select onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">إضافة صنف</label>
              <Select onValueChange={addToCart}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصنف للإضافة" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} (متوفر: {p.currentStock} {p.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>الصنف</TableHead>
                  <TableHead className="w-32">الكمية</TableHead>
                  <TableHead className="w-32">سعر الوحدة</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={e => updateCartItem(idx, 'quantity', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.price} 
                        onChange={e => updateCartItem(idx, 'price', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>{(item.quantity * item.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeCartItem(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {cart.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      السلة فارغة. أضف أصناف من القائمة أعلاه.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>الإجمالي الكلي:</span>
              <span>{totalAmount.toFixed(2)} ر.س</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">طريقة الدفع</label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي (كامل)</SelectItem>
                    <SelectItem value="partial">دفع جزئي</SelectItem>
                    <SelectItem value="credit">آجل (دين)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentType !== 'credit' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">المبلغ المدفوع</label>
                  <Input 
                    type="number" 
                    value={paidAmount} 
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder={totalAmount.toString()}
                  />
                </div>
              )}
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleSubmit} 
            disabled={isPending || cart.length === 0 || !selectedCustomer}
          >
            {isPending ? "جاري الحفظ..." : "إصدار الفاتورة"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
