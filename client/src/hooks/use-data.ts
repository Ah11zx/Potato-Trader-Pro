import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { 
  InsertCustomer, InsertSupplier, InsertProduct, 
  InsertTransaction, InsertPurchase, InsertSale 
} from "@shared/schema";

// Helper to handle API requests
async function fetcher<T>(url: string, options?: RequestInit) {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }
  return res.json() as Promise<T>;
}

// === CUSTOMERS ===
export function useCustomers() {
  return useQuery({
    queryKey: [api.customers.list.path],
    queryFn: () => fetcher(api.customers.list.path),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: [api.customers.get.path, id],
    queryFn: () => fetcher(buildUrl(api.customers.get.path, { id })),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertCustomer) => fetcher(api.customers.create.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
      toast({ title: "تمت العملية بنجاح", description: "تم إضافة العميل الجديد" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
}

// === SUPPLIERS ===
export function useSuppliers() {
  return useQuery({
    queryKey: [api.suppliers.list.path],
    queryFn: () => fetcher(api.suppliers.list.path),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertSupplier) => fetcher(api.suppliers.create.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.suppliers.list.path] });
      toast({ title: "تمت العملية بنجاح", description: "تم إضافة المورد الجديد" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
}

// === PRODUCTS ===
export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: () => fetcher(api.products.list.path),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertProduct) => fetcher(api.products.create.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "تمت العملية بنجاح", description: "تم إضافة الصنف الجديد" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
}

// === TRANSACTIONS ===
export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: () => fetcher(api.transactions.list.path),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertTransaction) => fetcher(api.transactions.create.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.dashboard.path] }); // Update dashboard
      toast({ title: "تمت العملية بنجاح", description: "تم تسجيل المعاملة المالية" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
}

// === PURCHASES ===
export function usePurchases() {
  return useQuery({
    queryKey: [api.purchases.list.path],
    queryFn: () => fetcher(api.purchases.list.path),
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: any) => fetcher(api.purchases.create.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.purchases.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "تم الشراء بنجاح", description: "تم تسجيل فاتورة الشراء وتحديث المخزون" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
}

// === SALES ===
export function useSales() {
  return useQuery({
    queryKey: [api.sales.list.path],
    queryFn: () => fetcher(api.sales.list.path),
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: any) => fetcher(api.sales.create.path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sales.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
      toast({ title: "تم البيع بنجاح", description: "تم تسجيل فاتورة البيع" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
}

// === ANALYTICS ===
export function useDashboardMetrics() {
  return useQuery({
    queryKey: [api.analytics.dashboard.path],
    queryFn: () => fetcher(api.analytics.dashboard.path),
  });
}

export function useAIInsights() {
  return useQuery({
    queryKey: [api.analytics.aiInsights.path],
    queryFn: () => fetcher(api.analytics.aiInsights.path),
  });
}
