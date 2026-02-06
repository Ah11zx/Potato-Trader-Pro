import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/image/client"; // Reusing the OpenAI client from image integration for now, or use the one from chat

// Import OpenAI client (Assuming it's available from the integrations)
// If not, we might need to initialize it here or import from a shared location.
// The integration setup created `server/replit_integrations/chat/routes.ts` which imports `openai` from `./storage`? No, usually `openai` instance is in a client.ts
// Let's check `server/replit_integrations/image/client.ts` - it exports `openai`. Perfect.

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === SUPPLIERS ===
  app.get(api.suppliers.list.path, async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });
  app.post(api.suppliers.create.path, async (req, res) => {
    try {
      const input = api.suppliers.create.input.parse(req.body);
      const supplier = await storage.createSupplier(input);
      res.status(201).json(supplier);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });

  // === CUSTOMERS ===
  app.get(api.customers.list.path, async (req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });
  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json(err.errors);
      else throw err;
    }
  });
  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(Number(req.params.id));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });
  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
       if (err instanceof z.ZodError) res.status(400).json(err.errors);
       else throw err;
    }
  });

  // === PURCHASES ===
  app.get(api.purchases.list.path, async (req, res) => {
    const purchases = await storage.getPurchases();
    res.json(purchases);
  });
  app.post(api.purchases.create.path, async (req, res) => {
    try {
      // Manual parsing for items logic if needed, but schema handles structure
      // We need to split items from the purchase object for the storage method
      const { items, ...purchaseData } = api.purchases.create.input.parse(req.body);
      
      // We need to cast purchaseData to InsertPurchase because Zod schema might be slightly different than pure DB schema
      const purchase = await storage.createPurchase(purchaseData as any, items);
      res.status(201).json(purchase);
    } catch (err) {
       if (err instanceof z.ZodError) res.status(400).json(err.errors);
       else throw err;
    }
  });

  // === SALES ===
  app.get(api.sales.list.path, async (req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  });
  app.post(api.sales.create.path, async (req, res) => {
    try {
      const { items, ...saleData } = api.sales.create.input.parse(req.body);
      const sale = await storage.createSale(saleData as any, items);
      res.status(201).json(sale);
    } catch (err) {
       if (err instanceof z.ZodError) res.status(400).json(err.errors);
       else throw err;
    }
  });

  // === TRANSACTIONS ===
  app.get(api.transactions.list.path, async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });
  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const transaction = await storage.createTransaction(input);
      res.status(201).json(transaction);
    } catch (err) {
       if (err instanceof z.ZodError) res.status(400).json(err.errors);
       else throw err;
    }
  });

  // === ANALYTICS ===
  app.get(api.analytics.dashboard.path, async (req, res) => {
    const totalRevenue = await storage.getTotalRevenue();
    const totalProfit = await storage.getTotalProfit();
    const totalDebt = await storage.getTotalDebt();
    const products = await storage.getProducts();
    const lowStockProducts = products.filter(p => Number(p.currentStock) <= Number(p.reorderLevel));

    res.json({
      totalRevenue,
      totalProfit,
      totalDebt,
      lowStockProducts
    });
  });

  app.get(api.analytics.aiInsights.path, async (req, res) => {
    try {
      // Gather context for AI
      const totalDebt = await storage.getTotalDebt();
      const customers = await storage.getCustomers();
      const highRiskCustomers = customers.filter(c => c.isHighRisk || Number(c.totalDebt) > Number(c.creditLimit));
      const products = await storage.getProducts();
      const lowStock = products.filter(p => Number(p.currentStock) <= Number(p.reorderLevel));

      const prompt = `
        You are an AI analyst for a potato distribution business.
        Analyze the following data and provide brief, actionable insights in Arabic (JSON format):
        
        Data:
        - Total Market Debt: ${totalDebt} SAR
        - High Risk Customers: ${highRiskCustomers.length} (Names: ${highRiskCustomers.map(c => c.name).join(', ')})
        - Low Stock Products: ${lowStock.map(p => p.name).join(', ')}
        
        Provide JSON response with keys: "riskAnalysis", "cashFlowForecast", "inventoryAdvice".
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const insights = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(insights);
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    console.log("Seeding database...");
    
    // Suppliers
    const s1 = await storage.createSupplier({ name: "مزرعة العبدالله", phone: "0501234567", address: "طريق الخرج", notes: "بطاطس سبونتا درجة أولى" });
    
    // Customers
    const c1 = await storage.createCustomer({ name: "مطعم بخاري المدينة", phone: "0559876543", address: "الرياض - الملز", creditLimit: "5000", notes: "سداد أسبوعي" });
    const c2 = await storage.createCustomer({ name: "بوفيه الأمانة", phone: "0543211234", address: "الرياض - العليا", creditLimit: "1000", notes: "عميل جديد" });

    // Products
    const p1 = await storage.createProduct({ name: "بطاطس سبونتا", unit: "كيس 25كجم", currentStock: "50", reorderLevel: "20" });
    const p2 = await storage.createProduct({ name: "بطاطس كارا (للقلي)", unit: "كيس 20كجم", currentStock: "10", reorderLevel: "15" });

    // Initial Purchase
    await storage.createPurchase({
      supplierId: s1.id,
      totalCost: "2500",
      transportCost: "200",
      laborCost: "100",
      notes: "بداية الموسم"
    }, [
      { productId: p1.id, quantity: "50", unitPrice: "40", totalPrice: "2000" },
      { productId: p2.id, quantity: "20", unitPrice: "25", totalPrice: "500" }
    ]);
  }
}
