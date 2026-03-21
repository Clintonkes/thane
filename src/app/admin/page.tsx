"use client";

import { useState } from "react";
import { Truck, Package, CheckCircle, Clock } from "lucide-react";
import { useStore } from "@/store";
import { ScrollReveal, CountUp } from "@/hooks/useAnimations";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function AdminPage() {
  const { orders, trucks, updateOrderStatus } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTruckId, setAssignTruckId] = useState("");

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const inProgressOrders = orders.filter((o) => o.status === "in_progress").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const availableTrucks = trucks.filter((t) => t.status === "available").length;

  const handleAssignTruck = (orderId: string) => {
    const truck = trucks.find((t) => t.id === assignTruckId);
    if (truck) {
      updateOrderStatus(orderId, "assigned", truck.truckNumber);
      setShowAssignModal(false);
      setAssignTruckId("");
    }
  };

  const handleUpdateStatus = (orderId: string, status: any) => {
    updateOrderStatus(orderId, status);
  };

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
                    {/* Only CountUp initially to avoid hydration issues, or just display value */}
                    <CountUp end={stat.value} duration={1000} />
                  </div>
                  <div className="text-gray-500 font-medium">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
                  <p className="text-lg font-medium">No orders yet</p>
                  <p className="text-sm mt-2 text-gray-400">New orders will appear here automatically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cargo</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Truck</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="font-mono text-sm font-medium text-primary">#{order.id.slice(0, 8)}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-gray-800">{order.customerName}</div>
                            <div className="text-sm text-gray-500 mt-1">{order.phone}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-semibold text-gray-800">{order.pickupLocation}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <span className="text-gray-300 mr-1">→</span> {order.deliveryLocation}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-semibold text-gray-800">{order.goodsType}</div>
                            <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1.5 inline-block">{order.cargoWeight}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm border ${
                              order.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
                              order.status === "in_progress" ? "bg-purple-100 text-purple-800 border-purple-200" :
                              order.status === "assigned" ? "bg-blue-100 text-blue-800 border-blue-200" :
                              "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }`}>
                              {statusLabels[order.status]}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            {order.assignedTruck ? (
                              <span className="text-sm font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">{order.assignedTruck}</span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
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
                        {truck.truckNumber} - {truck.type} ({truck.capacity})
                      </option>
                    ))}
                </select>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Order Details</h4>
                <div className="text-sm text-gray-600 space-y-2.5">
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">Customer:</span> <span className="text-gray-900 font-medium">{selectedOrder.customerName}</span></p>
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">From:</span> <span className="text-gray-900">{selectedOrder.pickupLocation}</span></p>
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">To:</span> <span className="text-gray-900">{selectedOrder.deliveryLocation}</span></p>
                  <p><span className="font-semibold text-gray-500 w-20 inline-block">Cargo:</span> <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-800 font-medium">{selectedOrder.goodsType}</span></p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <button onClick={() => { setSelectedOrder(null); setShowAssignModal(false); }} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleAssignTruck(selectedOrder.id)}
                disabled={!assignTruckId}
                className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
