import { db } from "./db";
import { 
  suppliers, customers, products, purchases, purchaseItems, sales, saleItems, transactions,
  type Supplier, type InsertSupplier,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type Purchase, type InsertPurchase, type PurchaseItem, type InsertPurchaseItem,
  type Sale, type InsertSale, type SaleItem, type InsertSaleItem,
  type Transaction, type InsertTransaction
} from "@shared/schema";
import { eq, desc, sum, sql } from "drizzle-orm";

export interface IStorage {
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomerDebt(id: number, amount: number): Promise<void>;

  // Products
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(id: number, quantityChange: number): Promise<void>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase>;

  // Sales
  getSales(): Promise<Sale[]>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<Sale>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Dashboard/Analytics Data Helpers
  getTotalRevenue(): Promise<number>;
  getTotalProfit(): Promise<number>;
  getTotalDebt(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // === SUPPLIERS ===
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }
  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(insertSupplier).returning();
    return supplier;
  }

  // === CUSTOMERS ===
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }
  async updateCustomerDebt(id: number, amount: number): Promise<void> {
    // amount can be positive (adding debt) or negative (paying debt)
    await db.update(customers)
      .set({ 
        totalDebt: sql`${customers.totalDebt} + ${amount}`,
        lastPaymentDate: amount < 0 ? new Date() : undefined
      })
      .where(eq(customers.id, id));
  }

  // === PRODUCTS ===
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
  async updateProductStock(id: number, quantityChange: number): Promise<void> {
    await db.update(products)
      .set({ currentStock: sql`${products.currentStock} + ${quantityChange}` })
      .where(eq(products.id, id));
  }

  // === PURCHASES ===
  async getPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.date));
  }
  async createPurchase(insertPurchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase> {
    return await db.transaction(async (tx) => {
      const [purchase] = await tx.insert(purchases).values(insertPurchase).returning();
      
      for (const item of items) {
        await tx.insert(purchaseItems).values({ ...item, purchaseId: purchase.id });
        // Update stock (Increase)
        await tx.update(products)
          .set({ currentStock: sql`${products.currentStock} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      // Record Transaction (Expense)
      await tx.insert(transactions).values({
        type: 'expense',
        category: 'purchase',
        amount: insertPurchase.totalCost.toString(),
        description: `Purchase #${purchase.id}`,
        relatedId: purchase.supplierId
      });

      return purchase;
    });
  }

  // === SALES ===
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.date));
  }
  async createSale(insertSale: InsertSale, items: InsertSaleItem[]): Promise<Sale> {
    return await db.transaction(async (tx) => {
      const [sale] = await tx.insert(sales).values(insertSale).returning();
      
      for (const item of items) {
        await tx.insert(saleItems).values({ ...item, saleId: sale.id });
        // Update stock (Decrease)
        await tx.update(products)
          .set({ currentStock: sql`${products.currentStock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      // Handle Payment & Debt
      const totalAmount = parseFloat(insertSale.totalAmount as string);
      const paidAmount = parseFloat(insertSale.paidAmount as string || "0");
      const remaining = totalAmount - paidAmount;

      if (remaining > 0 && insertSale.customerId) {
        // Add to customer debt
        await tx.update(customers)
           .set({ totalDebt: sql`${customers.totalDebt} + ${remaining}` })
           .where(eq(customers.id, insertSale.customerId));
      }

      // Record Transaction (Payment In) if paidAmount > 0
      if (paidAmount > 0) {
        await tx.insert(transactions).values({
          type: 'payment_in',
          category: 'sale',
          amount: paidAmount.toString(),
          description: `Sale #${sale.id}`,
          relatedId: insertSale.customerId
        });
      }

      return sale;
    });
  }

  // === TRANSACTIONS ===
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.date));
  }
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    return await db.transaction(async (tx) => {
       const [transaction] = await tx.insert(transactions).values(insertTransaction).returning();
       
       // If it's a debt payment from a customer
       if (insertTransaction.type === 'payment_in' && insertTransaction.category === 'debt_payment' && insertTransaction.relatedId) {
          const amount = parseFloat(insertTransaction.amount as string);
          await tx.update(customers)
            .set({ 
              totalDebt: sql`${customers.totalDebt} - ${amount}`,
              lastPaymentDate: new Date()
            })
            .where(eq(customers.id, insertTransaction.relatedId));
       }

       return transaction;
    });
  }

  // === ANALYTICS ===
  async getTotalRevenue(): Promise<number> {
    const result = await db.select({ value: sum(sales.totalAmount) }).from(sales);
    return Number(result[0]?.value || 0);
  }

  async getTotalProfit(): Promise<number> {
    // Simple profit = Total Sales - Total Purchases - Other Expenses
    // Ideally we track cost of goods sold (COGS), but this is a rough estimate requested
    const revenue = await this.getTotalRevenue();
    const purchaseCost = await db.select({ value: sum(purchases.totalCost) }).from(purchases);
    // TODO: Sum other expenses from transactions where type='expense' AND category != 'purchase'
    return revenue - Number(purchaseCost[0]?.value || 0);
  }

  async getTotalDebt(): Promise<number> {
    const result = await db.select({ value: sum(customers.totalDebt) }).from(customers);
    return Number(result[0]?.value || 0);
  }
}

export const storage = new DatabaseStorage();
