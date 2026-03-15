// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User & Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  hub?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | "super_admin"
  | "country_office"
  | "laboratory_team"
  | "osl_team"
  | "warehouse_staff"
  | "guest";

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  email: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: OrderPriority;
  requesterName: string;
  requesterDepartment: string;
  requesterEmail: string;
  commodities: OrderCommodity[];
  totalQuantity: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
  notes?: string;
  attachments?: string[];
}

export type OrderStatus =
  | "pending"
  | "approved"
  | "processing"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderPriority = "low" | "normal" | "high" | "urgent";

export interface OrderCommodity {
  commodityId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface CreateOrderRequest {
  requesterName: string;
  requesterDepartment: string;
  requesterEmail: string;
  commodities: Array<{
    commodityId: string;
    quantity: number;
  }>;
  priority?: OrderPriority;
  notes?: string;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  status?: OrderStatus;
}

// Commodity Types
export interface Commodity {
  id: string;
  name: string;
  category: CommodityCategory;
  sku: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  storageLocation?: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type CommodityCategory =
  | "vaccines"
  | "test_kits"
  | "medicines"
  | "consumables"
  | "equipment"
  | "other";

export interface CreateCommodityRequest {
  name: string;
  category: CommodityCategory;
  sku: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface UpdateCommodityRequest
  extends Partial<CreateCommodityRequest> {}

// Inventory Types
export interface InventoryTransaction {
  id: string;
  commodityId: string;
  type: "inbound" | "outbound" | "adjustment";
  quantity: number;
  reference: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// Analytics Types
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalCommodities: number;
  lowStockItems: number;
  totalInventoryValue: number;
  ordersTrend: Array<{
    date: string;
    count: number;
  }>;
  commodityDistribution: Array<{
    category: string;
    count: number;
  }>;
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  averageProcessingTime: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPriority: Record<OrderPriority, number>;
  monthlyTrend: Array<{
    month: string;
    orders: number;
    value: number;
  }>;
}

// Chat Types
export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface SendMessageRequest {
  orderId: string;
  content: string;
  attachments?: string[];
}

// OSL Operations Types
export interface OSLOperation {
  id: string;
  orderNumber: string;
  status: OSLStatus;
  commodities: OrderCommodity[];
  allocatedQuantity: number;
  processedQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OSLStatus =
  | "pending"
  | "in_process"
  | "allocated"
  | "dispatched"
  | "completed";

// Warehouse Types
export interface WarehouseOperation {
  id: string;
  operationType: "receipt" | "dispatch" | "stocktake";
  commodityId: string;
  quantity: number;
  location: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// Query Params
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
