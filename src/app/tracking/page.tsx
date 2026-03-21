"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Truck, Package, CheckCircle, Clock, Package as PackageIcon } from "lucide-react";
import { useStore } from "@/store";
import { ScrollReveal } from "@/hooks/useAnimations";

const trackingSteps = [
  { id: 1, label: "Order Received", icon: PackageIcon, description: "Your order has been confirmed" },
  { id: 2, label: "Truck Assigned", icon: Truck, description: "A truck has been assigned to your order" },
  { id: 3, label: "In Transit", icon: MapPin, description: "Your cargo is on its way" },
  { id: 4, label: "Delivered", icon: CheckCircle, description: "Your cargo has been delivered" },
];

export default function TrackingPage() {
  const { orders } = useStore();
  const [trackingId, setTrackingId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find((o) => o.id.includes(trackingId) || o.id.slice(0, 8).includes(trackingId));
    if (order) {
      setTrackedOrder(order);
    }
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
              Enter your order ID to track your cargo in real-time
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
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your order ID (e.g. 1a2b3c4d)"
                  className="input-field pl-12 py-4 text-lg"
                />
              </div>
              <button type="submit" className="btn-primary py-4 px-8 flex items-center justify-center space-x-2 whitespace-nowrap shadow-lg">
                <span>Track Order</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Tracking Result */}
      {trackedOrder && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="bg-primary p-6 text-white bg-gradient-to-r from-primary to-primary-700">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Order #{trackedOrder.id.slice(0, 8)}</h2>
                    <p className="text-blue-100 font-medium flex items-center">
                      <PackageIcon className="h-4 w-4 mr-2" />
                      {trackedOrder.goodsType}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-4xl font-bold bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                      {trackedOrder.status === "completed" ? "100%" : 
                       trackedOrder.status === "in_progress" ? "75%" :
                       trackedOrder.status === "assigned" ? "50%" : "25%"}
                    </div>
                    <div className="text-blue-100 font-medium text-sm mt-2 text-center">Completion</div>
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="p-8 overflow-x-auto">
                <div className="relative min-w-[600px] pb-4">
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
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center z-10 transition-colors duration-500 shadow-lg ${
                            isCompleted ? "bg-accent text-white" : isCurrent ? "bg-white text-primary border-4 border-primary animate-pulse" : "bg-white border-4 border-gray-100 text-gray-300"
                          }`}>
                            <step.icon className={`h-7 w-7 ${isCurrent ? 'text-primary' : ''}`} />
                          </div>
                          <div className="mt-4 text-center">
                            <div className={`font-bold ${isCompleted ? "text-gray-800" : isCurrent ? "text-primary" : "text-gray-400"}`}>{step.label}</div>
                            <div className="text-xs text-gray-500 mt-1.5 leading-tight">{step.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="border-t border-gray-100 bg-gray-50 p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary"><MapPin className="h-5 w-5" /></span>
                  Shipment Details
                </h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Pickup Location</div>
                    <div className="font-bold text-gray-800 text-lg">{trackedOrder.pickupLocation}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Delivery Location</div>
                    <div className="font-bold text-gray-800 text-lg">{trackedOrder.deliveryLocation}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Cargo Weight</div>
                    <div className="font-bold text-gray-800">{trackedOrder.cargoWeight || "Not specified"}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wider">Preferred Date</div>
                    <div className="font-bold text-gray-800">{trackedOrder.preferredDate}</div>
                  </div>
                  {trackedOrder.assignedTruck && (
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 md:col-span-2">
                      <div className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider flex items-center">
                        <Truck className="h-4 w-4 mr-2" />
                        Assigned Truck
                      </div>
                      <div className="font-bold text-primary-900 text-xl">{trackedOrder.assignedTruck}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Demo Orders */}
      {orders.length > 0 && !trackedOrder && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="reveal-up">
              <h2 className="text-2xl font-heading font-bold text-gray-800 mb-8 text-center">Your Recent Orders</h2>
            </ScrollReveal>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order, index) => (
                <ScrollReveal key={order.id} animation="reveal-up" delay={index * 0.1}>
                  <div
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
                    onClick={() => {
                      setTrackingId(order.id.slice(0, 8));
                      setTrackedOrder(order);
                    }}
                  >
                    <div className="flex items-center mb-4 sm:mb-0">
                      <div className="bg-gray-100 p-3 rounded-lg mr-4 group-hover:bg-primary/10 transition-colors">
                        <Package className="h-6 w-6 text-gray-500 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-lg">#{order.id.slice(0, 8)}</div>
                        <div className="text-sm font-medium text-gray-500">{order.goodsType}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:w-1/3">
                      <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                        order.status === "completed" ? "bg-green-100 text-green-800 border border-green-200" :
                        order.status === "in_progress" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                        order.status === "assigned" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                        "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}>
                        {order.status.replace("_", " ").toUpperCase()}
                      </div>
                      <div className="hidden sm:block ml-4 text-gray-300 group-hover:text-primary transition-colors">
                        →
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
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
              { icon: Package, title: "1. Find Your Order ID", description: "Your order ID was sent to your email after booking" },
              { icon: Search, title: "2. Enter Order ID", description: "Input your 8-character ID in the tracking field" },
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
