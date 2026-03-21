"use client";

import Image from "next/image";
import Link from "next/link";
import { Truck, Package, Clock, Shield, Route, Warehouse, ArrowRight, Box, RefreshCw } from "lucide-react";
import { ScrollReveal } from "@/hooks/useAnimations";

const services = [
    {
        icon: Truck,
        title: "Cargo Transportation",
        description: "Comprehensive cargo transportation services for businesses of all sizes. We handle everything from small parcels to large freight shipments.",
        features: ["Full truckload (FTL)", "Less than truckload (LTL)", "Intermodal transport", "Cross-border shipping"],
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
        icon: Package,
        title: "Bulk Goods Delivery",
        description: "Efficient bulk goods delivery with optimized load capacities. Perfect for manufacturing and retail businesses.",
        features: ["Container shipping", "Bulk commodity transport", "Palletized freight", "Specialized loading equipment"],
        image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
        icon: Route,
        title: "Long-Distance Trucking",
        description: "Cross-country trucking services with real-time tracking. We deliver your goods safely to any destination.",
        features: ["Nationwide coverage", "Real-time GPS tracking", "Experienced drivers", "Scheduled deliveries"],
        image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
        icon: Clock,
        title: "Express Delivery",
        description: "Urgent delivery services when time is critical. Same-day and next-day delivery options available.",
        features: ["Same-day delivery", "Next-day delivery", "Time-critical shipments", "Expedited service"],
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
        icon: Warehouse,
        title: "Contract Logistics",
        description: "End-to-end logistics solutions tailored to your business needs. From warehousing to final delivery.",
        features: ["Warehousing", "Inventory management", "Distribution services", "Supply chain optimization"],
        image: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
        icon: RefreshCw,
        title: "Refrigerated Transport",
        description: "Temperature-controlled transportation for perishable goods. Maintain product freshness from pickup to delivery.",
        features: ["Temperature monitoring", "Multi-temperature zones", "FDA compliant", "Fresh and frozen options"],
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="relative py-20 bg-primary">
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Logistics operations"
                        fill
                        className="object-cover opacity-20"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 drop-shadow-lg">Our Services</h1>
                        <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                            Comprehensive trucking and logistics solutions designed to meet your unique transportation needs
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-20">
                        {services.map((service, index) => (
                            <ScrollReveal key={service.title} animation={index % 2 === 0 ? "reveal-left" : "reveal-right"}>
                                <div className={`grid lg:grid-cols-2 gap-12 items-center`}>
                                    {/* Image */}
                                    <div className={`relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl group ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                                        <Image
                                            src={service.image}
                                            alt={service.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                            <service.icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800 mb-4">
                                            {service.title}
                                        </h2>
                                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">{service.description}</p>
                                        <ul className="space-y-3 mb-8">
                                            {service.features.map((feature) => (
                                                <li key={feature} className="flex items-center space-x-3 group/item">
                                                    <Box className="h-5 w-5 text-accent group-hover/item:scale-110 transition-transform" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href="/booking" className="btn-primary inline-flex items-center space-x-2 group/btn">
                                            <span>Book This Service</span>
                                            <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal animation="reveal-up">
                        <div className="text-center mb-16">
                            <h2 className="section-title">Why Choose Our Services</h2>
                            <p className="section-subtitle mx-auto">
                                We go above and beyond to deliver exceptional logistics solutions
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: "Secure & Insured", description: "All shipments are fully insured and protected with our comprehensive coverage options." },
                            { icon: Clock, title: "On-Time Guarantee", description: "We commit to on-time delivery with our performance guarantees and dedicated fleet." },
                            { icon: Route, title: "Real-Time Tracking", description: "Monitor your shipment's progress 24/7 with our advanced tracking technology." },
                        ].map((feature, index) => (
                            <ScrollReveal key={feature.title} animation="reveal-scale" delay={index * 0.12}>
                                <div className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-default">
                                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
                                        <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <ScrollReveal animation="reveal-up">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                            Need a Custom Logistics Solution?
                        </h2>
                        <p className="text-xl text-gray-200 mb-8">
                            Contact our team to discuss your specific transportation needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/booking" className="btn-accent text-lg px-8 py-4 shadow-2xl">Get a Quote</Link>
                            <Link href="/contact" className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-4 px-8 rounded-lg transition-all duration-300">Contact Us</Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
}
