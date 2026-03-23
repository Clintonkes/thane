"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, MapPin, Truck, Package, CheckCircle, Clock, X, Loader2, Mail, Phone, Calendar } from "lucide-react";
import { ScrollReveal } from "@/hooks/useAnimations";

interface TrackedOrder {
  id: number;
  order_number: string;
  status: string;
  pickup_location: string;
  delivery_location: string;
  goods_type: string;
  cargo_weight?: string;
  cargo_size?: string;
  preferred_date?: string;
  customer_name: string;
  email: string;
  phone: string;
  additional_notes?: string;
  created_at: string;
  updated_at: string;
}

const trackingSteps = [
  { id: 1, label: "Order Received", icon: Package, description: "Your order has been confirmed" },
  { id: 2, label: "Truck Assigned", icon: Truck, description: "A truck has been assigned to your order" },
  { id: 3, label: "In Transit", icon: MapPin, description: "Your cargo is on its way" },
  { id: 4, label: "Delivered", icon: CheckCircle, description: "Your cargo has been delivered" },
];

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

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentOrderSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveRecentSearch = (orderNumber: string) => {
    const updated = [orderNumber, ...recentSearches.filter(s => s !== orderNumber)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentOrderSearches", JSON.stringify(updated));
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setTrackedOrder(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const response = await fetch(`${apiUrl}/api/orders/track/${trackingId.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found. Please check your order number and try again.");
        }
        throw new Error("Failed to track order. Please try again later.");
      }
      
      const data = await response.json();
      setTrackedOrder(data);
      saveRecentSearch(data.order_number);
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while tracking your order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (orderNumber: string) => {
    setTrackingId(orderNumber);
    // Trigger search
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    // We need to manually call the tracking logic
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
        const response = await fetch(`${apiUrl}/api/orders/track/${orderNumber}`);
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        setTrackedOrder(data);
        setShowModal(true);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const getCurrentStep = (status: string) => {
    switch (status) {
      case "pending": return 1;
      case "assigned": return 2;
      case "in_progress": return 3;
      case "completed": return 4;
      default: return 0;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Tracking"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 drop-shadow-lg">Track Your Shipment</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Enter your order number to track your cargo in real-time
            </p>
          </div>
        </div>
      </section>

      {/* Tracking Form */}
      <section className="py-12 -mt-10 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-500">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="Enter order number (e.g., TG-123456)"
                  className="input-field pl-12 py-4 text-lg"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading || !trackingId.trim()}
                className="btn-primary py-4 px-8 flex items-center justify-center space-x-2 whitespace-nowrap shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </form>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            
            {/* Recent Searches */}
            {recentSearches.length > 0 && !trackedOrder && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleViewOrder(search)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary rounded-full transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Order Details Modal */}
      {trackedOrder && showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal Header */}
            <div className="bg-primary p-6 text-white rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Order #{trackedOrder.order_number}</h2>
                  <p className="text-blue-100 font-medium flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    {trackedOrder.goods_type}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="p-6 border-b border-gray-100">
              <div className="relative min-w-[500px] pb-4">
                <div className="absolute top-8 left-12 right-12 h-1.5 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(getCurrentStep(trackedOrder.status) - 1) * 33.33}%` }}
                  />
                </div>
                <div className="relative flex justify-between">
                  {trackingSteps.map((step) => {
                    const currentStep = getCurrentStep(trackedOrder.status);
                    const isCompleted = step.id <= currentStep;
                    const isCurrent = step.id === currentStep;
                    return (
                      <div key={step.id} className="flex flex-col items-center w-24">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 transition-colors duration-500 shadow-lg ${
                          isCompleted ? "bg-accent text-white" : isCurrent ? "bg-white text-primary border-4 border-primary animate-pulse" : "bg-white border-4 border-gray-100 text-gray-300"
                        }`}>
                          <step.icon className={`h-6 w-6 ${isCurrent ? 'text-primary' : ''}`} />
                        </div>
                        <div className="mt-3 text-center">
                          <div className={`text-sm font-bold ${isCompleted ? "text-gray-800" : isCurrent ? "text-primary" : "text-gray-400"}`}>{step.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mt-4 text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold tracking-wide shadow-sm border ${statusColors[trackedOrder.status]}`}>
                  {statusLabels[trackedOrder.status] || trackedOrder.status}
                </span>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary"><MapPin className="h-5 w-5" /></span>
                Shipment Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Pickup Location</div>
                  <div className="font-bold text-gray-800">{trackedOrder.pickup_location}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Delivery Location</div>
                  <div className="font-bold text-gray-800">{trackedOrder.delivery_location}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Cargo Weight</div>
                  <div className="font-bold text-gray-800">{trackedOrder.cargo_weight || "Not specified"}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Preferred Date</div>
                  <div className="font-bold text-gray-800">{formatDate(trackedOrder.preferred_date)}</div>
                </div>
              </div>

              {/* Customer Info */}
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary"><Mail className="h-5 w-5" /></span>
                Customer Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Name</div>
                  <div className="font-bold text-gray-800">{trackedOrder.customer_name}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider flex items-center">
                    <Mail className="h-3 w-3 mr-1" /> Email
                  </div>
                  <div className="font-bold text-gray-800">{trackedOrder.email}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                  <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider flex items-center">
                    <Phone className="h-3 w-3 mr-1" /> Phone
                  </div>
                  <div className="font-bold text-gray-800">{trackedOrder.phone}</div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Created: </span>
                    <span className="font-medium text-gray-700">{formatDate(trackedOrder.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated: </span>
                    <span className="font-medium text-gray-700">{formatDate(trackedOrder.updated_at)}</span>
                  </div>
                </div>
              </div>

              {trackedOrder.additional_notes && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="text-sm font-semibold text-yellow-800 mb-1">Additional Notes</div>
                  <div className="text-yellow-700">{trackedOrder.additional_notes}</div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="w-full btn-primary py-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How to Track */}
      <section className="py-24 bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="reveal-fade">
            <h2 className="text-3xl font-heading font-bold text-gray-800 mb-12 text-center">How to Track Your Shipment</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-0.5 bg-gray-100 -z-10" />
            
            {[
              { icon: Package, title: "1. Find Your Order Number", description: "Your order number was sent to your email after booking (e.g., TG-123456)" },
              { icon: Search, title: "2. Enter Order Number", description: "Input your order number in the tracking field above" },
              { icon: MapPin, title: "3. View Live Status", description: "See real-time progress and status of your shipment" },
            ].map((step, index) => (
              <ScrollReveal key={step.title} animation="reveal-up" delay={index * 0.15}>
                <div className="text-center group bg-white">
                  <div className="bg-gray-50 border-4 border-white shadow-lg w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <step.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
