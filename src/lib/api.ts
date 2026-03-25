/**
 * Central API Service
 * This file contains all API calls to the backend
 * Use this for all database operations from the frontend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types
export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  pickup_location: string;
  delivery_location: string;
  goods_type: string;
  cargo_weight?: string;
  cargo_size?: string;
  preferred_date: string;
  additional_notes?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_truck_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Truck {
  id: number;
  truck_number: string;
  truck_type: string;
  capacity: string;
  image_url?: string;
  status: 'available' | 'in_use' | 'maintenance';
  driver_name?: string;
  driver_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read?: boolean;
  is_replied?: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment: string;
  created_at: string;
  is_published: boolean;
}

export interface Admin {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: string;
}

export interface AdminToken {
  access_token: string;
  token_type: string;
  admin: Admin;
}

// API Helper
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
}

// ==================== PUBLIC API ====================

// Orders
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  return fetchAPI<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const getOrders = async (status?: string): Promise<Order[]> => {
  const params = status ? `?status=${status}` : '';
  return fetchAPI<Order[]>(`/api/orders${params}`);
};

export const getOrder = async (id: number): Promise<Order> => {
  return fetchAPI<Order>(`/api/orders/${id}`);
};

export const trackOrder = async (orderNumber: string) => {
  return fetchAPI<{ order_number: string; status: string; pickup_location: string; delivery_location: string; goods_type: string; created_at: string }>(
    `/api/orders/track/${orderNumber}`
  );
};

// Trucks
export const getTrucks = async (status?: string): Promise<Truck[]> => {
  const params = status ? `?status=${status}` : '';
  return fetchAPI<Truck[]>(`/api/trucks${params}`);
};

// Contact Messages
export const getContactMessages = async (): Promise<ContactMessage[]> => {
  return fetchAPI<ContactMessage[]>('/api/contact');
};

export const submitContactMessage = async (messageData: Partial<ContactMessage>) => {
  return fetchAPI<{ message: string; id: number }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
};

// Reviews
export const getReviews = async (): Promise<Review[]> => {
  return fetchAPI<Review[]>('/api/reviews');
};

export const submitReview = async (reviewData: Partial<Review>) => {
  return fetchAPI<{ message: string; id: number }>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
};

// ==================== ADMIN API ====================

// Get stored admin token
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tgrp_admin_token');
}

// Set admin token
export function setAdminToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tgrp_admin_token', token);
  }
}

// Remove admin token
export function removeAdminToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tgrp_admin_token');
  }
}

// Admin Login
export const adminLogin = async (username: string, password: string): Promise<AdminToken> => {
  const response = await fetchAPI<AdminToken>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  
  // Store token
  setAdminToken(response.access_token);
  
  return response;
};

// Admin Logout
export const adminLogout = async (): Promise<void> => {
  const token = getAdminToken();
  if (token) {
    try {
      await fetchAPI('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  removeAdminToken();
};

// Get current admin info
export const getCurrentAdmin = async (): Promise<Admin> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  return fetchAPI<Admin>('/api/admin/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Check if admin is logged in
export const isAdminAuthenticated = (): boolean => {
  return !!getAdminToken();
};

// Admin Orders (Protected)
export const getAllOrdersAdmin = async (status?: string): Promise<Order[]> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  const params = status ? `?status=${status}` : '';
  return fetchAPI<Order[]>(`/api/admin/orders${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getOrderAdmin = async (id: number): Promise<Order> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  return fetchAPI<Order>(`/api/admin/orders/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const updateOrderStatus = async (
  id: number,
  status: string,
  assignedTruckId?: number
): Promise<{ message: string; order: Order }> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  // Build query params
  const params = new URLSearchParams({
    new_status: status,
  });
  if (assignedTruckId) {
    params.append('assigned_truck_id', assignedTruckId.toString());
  }
  
  return fetchAPI<{ message: string; order: Order }>(`/api/admin/orders/${id}/status?${params}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Register Admin (use with caution - only for first admin)
export const registerAdmin = async (
  username: string,
  password: string,
  email: string,
  fullName?: string
): Promise<{ message: string; id: number }> => {
  return fetchAPI<{ message: string; id: number }>('/api/admin/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, email, full_name: fullName }),
  });
};

// ==================== ADMIN DASHBOARD API ====================

// Dashboard Stats - matches actual API response
export interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  customers: {
    unique: number;
  };
  messages: {
    unread: number;
    total: number;
  };
  security?: {
    failed_logins_today: number;
    blocked_ips: number;
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  return fetchAPI<DashboardStats>('/api/admin/dashboard/stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Customers (unique from orders)
export interface Customer {
  customer_name: string;
  email: string;
  phone: string;
  total_orders: number;
  last_order_date: string;
}

export const getCustomers = async (): Promise<Customer[]> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  return fetchAPI<Customer[]>('/api/admin/customers', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Messages
export const getMessagesAdmin = async (unreadOnly?: boolean): Promise<ContactMessage[]> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  const params = unreadOnly ? '?unread=true' : '';
  return fetchAPI<ContactMessage[]>(`/api/admin/messages${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const markMessageAsRead = async (id: number): Promise<void> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  return fetchAPI(`/api/admin/messages/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Security - Login Attempts
export interface LoginAttempt {
  id: number;
  ip_address: string;
  username_attempted: string;
  success: boolean;
  blocked: boolean;
  created_at: string;
}

export const getLoginAttempts = async (): Promise<LoginAttempt[]> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  return fetchAPI<LoginAttempt[]>('/api/admin/security/login-attempts', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const unblockIP = async (ip: string): Promise<{ message: string }> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  return fetchAPI<{ message: string }>(`/api/admin/security/unblock/${ip}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Get all orders with truck details
export const getAllOrdersWithTrucks = async (): Promise<Order[]> => {
  const token = getAdminToken();
  if (!token) throw new Error('Not authenticated');
  
  return fetchAPI<Order[]>('/api/admin/orders?include_truck=true', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};
