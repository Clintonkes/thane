"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Truck as TruckIcon, CheckCircle, XCircle, AlertCircle, User, MapPin, Loader2 } from "lucide-react";
import { getTrucks, Truck as TruckType } from "@/lib/api";
import { ScrollReveal, CountUp } from "@/hooks/useAnimations";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  in_use: "bg-blue-100 text-blue-800",
  maintenance: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
};

export default function FleetPage() {
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const data = await getTrucks();
        setTrucks(data);
      } catch (error) {
        console.error("Failed to fetch trucks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrucks();
  }, []);

  const availableTrucks = trucks.filter((t) => t.status === "available").length;
  const inUseTrucks = trucks.filter((t) => t.status === "in_use").length;
  const maintenanceTrucks = trucks.filter((t) => t.status === "maintenance").length;

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Our fleet"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 drop-shadow-lg">Our Fleet</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              State-of-the-art trucks and trailers ready to handle your cargo
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white shadow-xl -mt-10 relative z-10 rounded-2xl mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            <ScrollReveal animation="reveal-up">
              <div className="text-center group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">
                  <CountUp end={availableTrucks} />
                </div>
                <div className="text-gray-600 font-medium">Available</div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="reveal-up" delay={0.1}>
              <div className="text-center group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                  <CountUp end={inUseTrucks} />
                </div>
                <div className="text-gray-600 font-medium">In Use</div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="reveal-up" delay={0.2}>
              <div className="text-center group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-4xl font-bold text-red-600 mb-2 group-hover:scale-110 transition-transform">
                  <CountUp end={maintenanceTrucks} />
                </div>
                <div className="text-gray-600 font-medium">Maintenance</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trucks.length === 0 ? (
            <div className="text-center py-12">
              <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No trucks available at the moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trucks.map((truck, index) => (
                <ScrollReveal key={truck.id} animation="reveal-up" delay={(index % 3) * 0.1}>
                  <div className="card card-hover overflow-hidden group">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={truck.image_url || "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt={truck.truck_type}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4 z-10 shadow-lg rounded-full">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm backdrop-blur-md ${statusColors[truck.status]}`}>
                          {statusLabels[truck.status]}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">{truck.truck_type}</h3>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{truck.truck_number}</span>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-gray-500 block">Capacity</span>
                            <span className="font-semibold text-gray-800">{truck.capacity}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Status</span>
                            <span className="font-semibold text-gray-800">{statusLabels[truck.status]}</span>
                          </div>
                          <div className="col-span-2 mt-1 pt-2 border-t border-gray-50">
                            <span className="text-gray-500 block">Truck Number</span>
                            <div className="flex items-center text-primary font-medium">
                              <TruckIcon className="h-3 w-3 mr-1" />
                              {truck.truck_number}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm border-t border-gray-50 pt-3">
                          <span className="text-gray-500">Driver</span>
                          <span className="font-medium text-gray-800 flex items-center">
                            {truck.driver_name ? (
                              <>
                                <User className="h-4 w-4 mr-1.5 text-primary" />
                                {truck.driver_name}
                              </>
                            ) : (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Legend */}
      <section className="py-16 bg-white border-t">
        <ScrollReveal animation="reveal-fade">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-heading font-bold text-gray-800 mb-8 text-center uppercase tracking-wide">Status Legend</h3>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-gray-700 font-medium">Available - Ready for assignment</span>
              </div>
              <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700 font-medium">In Use - Currently on delivery</span>
              </div>
              <div className="flex items-center space-x-3 bg-red-50 px-4 py-2 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-gray-700 font-medium">Maintenance - Under repair</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <ScrollReveal animation="reveal-up">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-heading font-bold text-white mb-6">
              Need a Specific Truck Type?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Contact us to discuss your specific requirements.
            </p>
            <a href="/booking" className="btn-accent text-lg px-8 py-4 inline-block shadow-2xl">
              Book Now
            </a>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
