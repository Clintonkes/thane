"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Truck, Package, CheckCircle, Clock, ArrowRight, 
  Search, Loader2, AlertCircle, MessageSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAdminToken, getDashboardStats, getAllOrdersAdmin } from "@/lib/api";

interface DashboardStats {
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
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  pickup_location: string;
  delivery_location: string;
  goods_type: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  assigned: { label: "Assigned", color: "text-blue-700", bgColor: "bg-blue-100" },
  in_progress: { label: "En-route", color: "text-purple-700", bgColor: "bg-purple-100" },
  completed: { label: "Completed", color: "text-green-700", bgColor: "bg-green-100" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, ordersData] = await Promise.all([
        getDashboardStats(),
        getAllOrdersAdmin()
      ]);
      
      // API returns nested format: { orders: { total, pending, ... }, customers: { unique }, messages: { unread, total } }
      setStats(statsData);
      setRecentOrders(ordersData.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      fetchData();
    }
  }, [fetchData]);

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Data</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-blue-100">Here's what's happening with your logistics today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => router.push("/admin/orders?status=pending")}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats?.orders.pending || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Pending Orders</h3>
          <p className="text-sm text-gray-500 mt-1 group-hover:text-primary transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </p>
        </div>

        <div 
          onClick={() => router.push("/admin/orders?status=in_progress")}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats?.orders.in_progress || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900">En-route Orders</h3>
          <p className="text-sm text-gray-500 mt-1 group-hover:text-primary transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </p>
        </div>

        <div 
          onClick={() => router.push("/admin/orders?status=completed")}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats?.orders.completed || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Completed Orders</h3>
          <p className="text-sm text-gray-500 mt-1 group-hover:text-primary transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </p>
        </div>

        <div 
          onClick={() => router.push("/admin/messages")}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats?.messages?.unread || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Unread Messages</h3>
          <p className="text-sm text-gray-500 mt-1 group-hover:text-primary transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </p>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/admin/orders")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900">View All Orders</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </button>
            
            <button
              onClick={() => router.push("/admin/messages")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900">Customer Messages</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </button>
            
            <button
              onClick={() => router.push("/admin/contact")}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900">Manage Contact</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => router.push("/admin/orders")}
              className="text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => router.push(`/admin/orders?status=${order.status}`)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg border border-gray-100">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-primary">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[order.status]?.bgColor} ${statusConfig[order.status]?.color}`}>
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.orders.total || 0}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.customers?.unique || 0}</p>
          <p className="text-sm text-gray-500">Unique Customers</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.messages?.total || 0}</p>
          <p className="text-sm text-gray-500">Total Messages</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.orders.cancelled || 0}</p>
          <p className="text-sm text-gray-500">Cancelled</p>
        </div>
      </div>
    </div>
  );
}
