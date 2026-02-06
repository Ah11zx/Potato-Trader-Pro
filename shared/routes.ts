import { z } from 'zod';
import { 
  insertSupplierSchema, suppliers,
  insertCustomerSchema, customers,
  insertProductSchema, products,
  insertPurchaseSchema, purchases,
  insertSaleSchema, sales,
  insertTransactionSchema, transactions
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Extended schemas for API inputs (e.g., nested items)
export const createPurchaseInput = insertPurchaseSchema.extend({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    unitPrice: z.number(),
  }))
});

export const createSaleInput = insertSaleSchema.extend({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    unitPrice: z.number(),
  }))
});

export const api = {
  suppliers: {
    list: {
      method: 'GET' as const,
      path: '/api/suppliers',
      responses: {
        200: z.array(z.custom<typeof suppliers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/suppliers',
      input: insertSupplierSchema,
      responses: {
        201: z.custom<typeof suppliers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/suppliers/:id',
      responses: {
        200: z.custom<typeof suppliers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers',
      responses: {
        200: z.array(z.custom<typeof customers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers',
      input: insertCustomerSchema,
      responses: {
        201: z.custom<typeof customers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/customers/:id',
      responses: {
        200: z.custom<typeof customers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  purchases: {
    create: {
      method: 'POST' as const,
      path: '/api/purchases',
      input: createPurchaseInput,
      responses: {
        201: z.custom<typeof purchases.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/purchases',
      responses: {
        200: z.array(z.custom<typeof purchases.$inferSelect>()),
      },
    },
  },
  sales: {
    create: {
      method: 'POST' as const,
      path: '/api/sales',
      input: createSaleInput,
      responses: {
        201: z.custom<typeof sales.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/sales',
      responses: {
        200: z.array(z.custom<typeof sales.$inferSelect>()),
      },
    },
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions',
      input: insertTransactionSchema,
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  analytics: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/analytics/dashboard',
      responses: {
        200: z.object({
          totalRevenue: z.number(),
          totalProfit: z.number(),
          totalDebt: z.number(),
          lowStockProducts: z.array(z.custom<typeof products.$inferSelect>()),
        }),
      },
    },
    aiInsights: {
      method: 'GET' as const,
      path: '/api/analytics/ai-insights',
      responses: {
        200: z.object({
          riskAnalysis: z.string(),
          cashFlowForecast: z.string(),
          inventoryAdvice: z.string(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
