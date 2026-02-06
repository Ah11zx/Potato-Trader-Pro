import { useState } from "react";
import { useCustomers, useCreateCustomer } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema } from "@shared/schema";
import { z } from "zod";

export default function CustomersPage() {
  const { data: customers } = useCustomers();
  const [search, setSearch] = useState("");

  const filteredCustomers = customers?.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">العملاء</h1>
          <p className="text-muted-foreground">إدارة سجلات المطاعم والديون</p>
        </div>
        <NewCustomerDialog />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="بحث باسم العميل أو الجوال..." 
            className="pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers?.map((customer: any) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{customer.name}</CardTitle>
              {Number(customer.totalDebt) > Number(customer.creditLimit) && (
                <Badge variant="destructive" className="flex gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  تجاوز الحد
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الجوال:</span>
                  <span className="font-mono">{customer.phone || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">العنوان:</span>
                  <span>{customer.address || "-"}</span>
                </div>
                <div className="pt-2 border-t mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">الديون المستحقة</span>
                    <span className="text-lg font-bold text-destructive">
                      {Number(customer.totalDebt).toFixed(2)} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>حد الائتمان</span>
                    <span>{Number(customer.creditLimit).toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NewCustomerDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createCustomer, isPending } = useCreateCustomer();
  const form = useForm({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      creditLimit: 0,
    }
  });

  const onSubmit = async (data: any) => {
    // Coerce numeric types
    await createCustomer({ ...data, creditLimit: Number(data.creditLimit) });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 ml-2" />
          عميل جديد
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة عميل جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم العميل/المطعم</label>
            <Input {...form.register("name")} placeholder="مثال: مطعم البخاري" />
            {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message as string}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">رقم الجوال</label>
            <Input {...form.register("phone")} placeholder="05xxxxxxxx" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">العنوان</label>
            <Input {...form.register("address")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">حد الائتمان (ر.س)</label>
            <Input type="number" {...form.register("creditLimit", { valueAsNumber: true })} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
