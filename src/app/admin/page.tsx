"use client";

import { useState, useEffect, useCallback } from "react";
import { Truck, Package, CheckCircle, Clock, Search, X, Loader2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { ScrollReveal, CountUp } from "@/hooks/useAnimations";
import { getAdminToken, isAdminAuthenticated } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  pickup_location: string;
  delivery_location: string;
  goods_type: string;
  cargo_weight?: string;
  cargo_size?: string;
  preferred_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_truck_id?: number;
}

interface TruckData {
  id: number;
  truck_number: string;
  truck_type: string;
  capacity: string;
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [assignTruckId, setAssignTruckId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const router = useRouter();

  // Load admin token and fetch data
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/tgrp");
      return;
    }
    
    const token = getAdminToken();
    if (token) {
      setAdminToken(token);
      fetchData(token);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

      const [ordersRes, trucksRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/trucks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (trucksRes.ok) {
        const trucksData = await trucksRes.json();
        setTrucks(trucksData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || !adminToken) {
      // Reset to all orders
      fetchData(adminToken!);
      return;
    }

    setIsSearching(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const response = await fetch(`${apiUrl}/api/admin/orders/search/${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, [adminToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const inProgressOrders = orders.filter((o) => o.status === "in_progress").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const availableTrucks = trucks.filter((t) => t.status === "available").length;

  const handleAssignTruck = async () => {
    if (!selectedOrder || !assignTruckId || !adminToken) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const response = await fetch(
        `${apiUrl}/api/admin/orders/${selectedOrder.id}/status?new_status=assigned&assigned_truck_id=${assignTruckId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      if (response.ok) {
        // Refresh orders
        fetchData(adminToken);
        setShowAssignModal(false);
        setAssignTruckId("");
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Failed to assign truck:", error);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    if (!adminToken) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const response = await fetch(
        `${apiUrl}/api/admin/orders/${orderId}/status?new_status=${status}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      if (response.ok) {
        // Refresh orders
        fetchData(adminToken);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Header */}
      <section className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3 drop-shadow-md">Admin Dashboard</h1>
            <p className="text-gray-200 text-lg">Manage orders, trucks, and deliveries</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Pending Orders", value: pendingOrders, color: "bg-yellow-500", icon: Clock },
              { label: "In Progress", value: inProgressOrders, color: "bg-purple-500", icon: Package },
              { label: "Completed", value: completedOrders, color: "bg-green-500", icon: CheckCircle },
              { label: "Available Trucks", value: availableTrucks, color: "bg-blue-500", icon: Truck },
            ].map((stat, index) => (
              <ScrollReveal key={stat.label} animation="reveal-up" delay={index * 0.1}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-inner`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-800 mb-1 tracking-tight">
                    <CountUp end={stat.value} duration={1000} />
                  </div>
                  <div className="text-gray-500 font-medium">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number, customer name, email, phone, or location..."
                className="input-field pl-12 py-3"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="btn-primary py-3 px-6 flex items-center space-x-2"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
          {searchQuery && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {orders.length} result{orders.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  fetchData(adminToken!);
                }}
                className="text-sm text-primary hover:text-primary-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Orders Table */}
      <section className="py-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="reveal-up" delay={0.3}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg">{orders.length} Total</div>
              </div>

              {orders.length === 0 ? (
                <div className="p-16 text-center text-gray-500">
                  <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">No orders found</p>
                  <p className="text-sm mt-2 text-gray-400">
                    {searchQuery ? "Try a different search term" : "New orders will appear here automatically."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order #</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cargo</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="font-mono text-sm font-medium text-primary">#{order.order_number}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-gray-800">{order.customer_name}</div>
                            <div className="text-sm text-gray-500 mt-1">{order.phone}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-semibold text-gray-800 max-w-[200px] truncate">{order.pickup_location}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <span className="text-gray-300 mr-1">→</span> {order.delivery_location}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-semibold text-gray-800">{order.goods_type}</div>
                            <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1.5 inline-block">{order.cargo_weight || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm border ${statusColors[order.status]}`}>
                              {statusLabels[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewDetails(order)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                title="View Details"
                              >
                                View
                              </button>
                              {order.status === "pending" && (
                                <button
                                  onClick={() => { setSelectedOrder(order); setShowAssignModal(true); }}
                                  className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors shadow flex items-center"
                                  title="Assign Truck"
                                >
                                  <Truck className="h-3.5 w-3.5 mr-1.5" /> Assign
                                </button>
                              )}
                              {order.status === "assigned" && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "in_progress")}
                                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors shadow flex items-center"
                                  title="Start Delivery"
                                >
                                  <Package className="h-3.5 w-3.5 mr-1.5" /> Start
                                </button>
                              )}
                              {order.status === "in_progress" && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "completed")}
                                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors shadow flex items-center"
                                  title="Complete"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Assign Truck Modal */}
      {selectedOrder && showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Assign Truck</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Available Truck</label>
                <select
                  value={assignTruckId}
                  onChange={(e) => setAssignTruckId(e.target.value)}
                  className="input-field border-2 focus:border-primary"
                >
                  <option value="">-- Choose a truck --</option>
                  {trucks
                    .filter((t) => t.status === "available")
                    .map((truck) => (
                      <option key={truck.id} value={truck.id}>
                        {truck.truck_number} - {truck.truck_type} ({truck.capacity})
                      </option>
                    ))}
                </select>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Order Details</h4>
                <div className="text-sm text-gray-600 space-y-2.5">
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">Order #:</span> <span className="text-gray-900 font-medium">{selectedOrder.order_number}</span></p>
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">Customer:</span> <span className="text-gray-900 font-medium">{selectedOrder.customer_name}</span></p>
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">From:</span> <span className="text-gray-900">{selectedOrder.pickup_location}</span></p>
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">To:</span> <span className="text-gray-900">{selectedOrder.delivery_location}</span></p>
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">Cargo:</span> <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-800 font-medium">{selectedOrder.goods_type}</span></p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <button onClick={() => { setSelectedOrder(null); setShowAssignModal(false); }} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAssignTruck}
                disabled={!assignTruckId}
                className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="bg-primary p-6 text-white rounded-t-2xl sticky top-0 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Order #{selectedOrder.order_number}</h2>
                <p className="text-blue-100 flex items-center mt-1">
                  <Package className="h-4 w-4 mr-2" />
                  {selectedOrder.goods_type}
                </p>
              </div>
              <button
                onClick={() => { setSelectedOrder(null); setShowDetailsModal(false); }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Status */}
              <div className="mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide shadow-sm border ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>

              {/* Route */}
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Route Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1">Pickup Location</div>
                  <div className="font-bold text-gray-800">{selectedOrder.pickup_location}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1">Delivery Location</div>
                  <div className="font-bold text-gray-800">{selectedOrder.delivery_location}</div>
                </div>
              </div>

              {/* Customer Info */}
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Customer Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1">Name</div>
                  <div className="font-bold text-gray-800">{selectedOrder.customer_name}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1 flex items-center">
                    <Mail className="h-3 w-3 mr-1" /> Email
                  </div>
                  <div className="font-bold text-gray-800">{selectedOrder.email}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                  <div className="text-sm font-semibold text-gray-400 mb-1 flex items-center">
                    <Phone className="h-3 w-3 mr-1" /> Phone
                  </div>
                  <div className="font-bold text-gray-800">{selectedOrder.phone}</div>
                </div>
              </div>

              {/* Cargo Details */}
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Cargo Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1">Goods Type</div>
                  <div className="font-bold text-gray-800">{selectedOrder.goods_type}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1">Cargo Weight</div>
                  <div className="font-bold text-gray-800">{selectedOrder.cargo_weight || "Not specified"}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> Preferred Date
                  </div>
                  <div className="font-bold text-gray-800">{formatDate(selectedOrder.preferred_date)}</div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Created: </span>
                    <span className="font-medium text-gray-700">{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated: </span>
                    <span className="font-medium text-gray-700">{formatDate(selectedOrder.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex space-x-4">
              <button
                onClick={() => { setSelectedOrder(null); setShowDetailsModal(false); }}
                className="flex-1 btn-secondary py-3"
              >
                Close
              </button>
              {selectedOrder.status === "pending" && (
                <button
                  onClick={() => { setShowDetailsModal(false); setShowAssignModal(true); }}
                  className="flex-1 btn-primary py-3 flex items-center justify-center"
                >
                  <Truck className="h-5 w-5 mr-2" />
                  Assign Truck
                </button>
              )}
              {selectedOrder.status === "assigned" && (
                <button
                  onClick={() => { handleUpdateStatus(selectedOrder.id, "in_progress"); setShowDetailsModal(false); }}
                  className="flex-1 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 py-3 px-4"
                >
                  Start Delivery
                </button>
              )}
              {selectedOrder.status === "in_progress" && (
                <button
                  onClick={() => { handleUpdateStatus(selectedOrder.id, "completed"); setShowDetailsModal(false); }}
                  className="flex-1 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 py-3 px-4 flex items-center justify-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
