import {
  ApiResponse,
  User,
  Order,
  Commodity,
  ChatMessage,
  OSLOperation,
  WarehouseOperation,
  LoginRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  CreateCommodityRequest,
  UpdateCommodityRequest,
  SendMessageRequest,
  DashboardStats,
  OrderAnalytics,
  PaginatedResponse,
  QueryParams,
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper function to make API requests
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API] Error ${response.status}:`, data);
      return {
        success: false,
        error: data.error || data.message || "An error occurred",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`[API] Request failed:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Network request failed",
    };
  }
}

// Auth API
export const authAPI = {
  login: (credentials: LoginRequest) =>
    fetchAPI<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    fetchAPI<null>("/api/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: () =>
    fetchAPI<User>("/api/auth/me", {
      method: "GET",
    }),

  resetPassword: (email: string) =>
    fetchAPI<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// Orders API
export const ordersAPI = {
  list: (params?: QueryParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.sort) query.append("sort", params.sort);

    return fetchAPI<PaginatedResponse<Order>>(
      `/api/orders?${query.toString()}`,
      {
        method: "GET",
      }
    );
  },

  getById: (id: string) =>
    fetchAPI<Order>(`/api/orders/${id}`, {
      method: "GET",
    }),

  create: (data: CreateOrderRequest) =>
    fetchAPI<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateOrderRequest) =>
    fetchAPI<Order>(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<null>(`/api/orders/${id}`, {
      method: "DELETE",
    }),

  updateStatus: (id: string, status: string) =>
    fetchAPI<Order>(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  getAnalytics: () =>
    fetchAPI<OrderAnalytics>("/api/orders/analytics/overview", {
      method: "GET",
    }),
};

// Commodities API
export const commoditiesAPI = {
  list: (params?: QueryParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.sort) query.append("sort", params.sort);

    return fetchAPI<PaginatedResponse<Commodity>>(
      `/api/commodities?${query.toString()}`,
      {
        method: "GET",
      }
    );
  },

  getById: (id: string) =>
    fetchAPI<Commodity>(`/api/commodities/${id}`, {
      method: "GET",
    }),

  create: (data: CreateCommodityRequest) =>
    fetchAPI<Commodity>("/api/commodities", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCommodityRequest) =>
    fetchAPI<Commodity>(`/api/commodities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<null>(`/api/commodities/${id}`, {
      method: "DELETE",
    }),

  getLowStock: () =>
    fetchAPI<Commodity[]>("/api/commodities/low-stock", {
      method: "GET",
    }),
};

// Chat API
export const chatAPI = {
  getMessages: (orderId: string) =>
    fetchAPI<ChatMessage[]>(`/api/orders/${orderId}/chat`, {
      method: "GET",
    }),

  sendMessage: (orderId: string, data: SendMessageRequest) =>
    fetchAPI<ChatMessage>(`/api/orders/${orderId}/chat`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  attachFile: (orderId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_URL}/api/orders/${orderId}/attachments`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },
};

// OSL Operations API
export const oslAPI = {
  list: (params?: QueryParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return fetchAPI<PaginatedResponse<OSLOperation>>(
      `/api/osl?${query.toString()}`,
      {
        method: "GET",
      }
    );
  },

  getById: (id: string) =>
    fetchAPI<OSLOperation>(`/api/osl/${id}`, {
      method: "GET",
    }),

  updateStatus: (id: string, status: string) =>
    fetchAPI<OSLOperation>(`/api/osl/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  allocate: (id: string, allocations: Record<string, number>) =>
    fetchAPI<OSLOperation>(`/api/osl/${id}/allocate`, {
      method: "POST",
      body: JSON.stringify({ allocations }),
    }),
};

// Warehouse API
export const warehouseAPI = {
  list: (params?: QueryParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return fetchAPI<PaginatedResponse<WarehouseOperation>>(
      `/api/warehouse?${query.toString()}`,
      {
        method: "GET",
      }
    );
  },

  createOperation: (data: Omit<WarehouseOperation, "id" | "createdAt">) =>
    fetchAPI<WarehouseOperation>("/api/warehouse", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    fetchAPI<DashboardStats>("/api/dashboard/stats", {
      method: "GET",
    }),

  getOrderTrend: () =>
    fetchAPI<Array<{ date: string; count: number }>>(
      "/api/dashboard/orders/trend",
      {
        method: "GET",
      }
    ),

  getCommodityDistribution: () =>
    fetchAPI<Array<{ category: string; count: number }>>(
      "/api/dashboard/commodities/distribution",
      {
        method: "GET",
      }
    ),
};

// Admin API
export const adminAPI = {
  getUsers: () =>
    fetchAPI<User[]>("/api/admin/users", {
      method: "GET",
    }),

  updateUser: (id: string, data: Partial<User>) =>
    fetchAPI<User>(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    fetchAPI<null>(`/api/admin/users/${id}`, {
      method: "DELETE",
    }),

  getLogs: () =>
    fetchAPI<Array<{ id: string; action: string; timestamp: string }>>(
      "/api/admin/logs",
      {
        method: "GET",
      }
    ),
};
