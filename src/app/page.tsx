"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Package, Clock, Shield, Star, ChevronDown, MapPin, Phone, Mail, Calculator, Route } from "lucide-react";
import { useStore } from "@/store";
import { PricingCalculator } from "@/components/PricingCalculator";
import { FAQSection } from "@/components/FAQSection";
import { ScrollReveal, CountUp } from "@/hooks/useAnimations";

const stats = [
  { label: "Years of Experience", value: 15, suffix: "+" },
  { label: "Trucks in Fleet", value: 50, suffix: "+" },
  { label: "Happy Clients", value: 1000, suffix: "+" },
  { label: "Miles Delivered", value: 2, suffix: "M+" },
];

const services = [
  {
    icon: Truck,
    title: "Cargo Transportation",
    description: "Safe and secure transportation of all types of cargo across the country.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Package,
    title: "Bulk Goods Delivery",
    description: "Efficient delivery of bulk goods with optimized load capacities.",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Route,
    title: "Long-Distance Trucking",
    description: "Cross-country trucking services with real-time tracking.",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Clock,
    title: "Express Delivery",
    description: "Urgent delivery services when time is critical.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Rigorous safety protocols and regular vehicle maintenance ensure your cargo is always protected.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "We understand the importance of deadlines and strive to deliver every shipment on time.",
  },
  {
    icon: Star,
    title: "Experienced Team",
    description: "Our drivers and logistics experts have years of experience in the transportation industry.",
  },
];

export default function Home() {
  const { reviews } = useStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center hero-bg">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-primary/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight drop-shadow-lg">
              Reliable Cargo Transport<br />
              <span className="text-accent drop-shadow-md">Across Every Mile</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto drop-shadow-sm">
              Trusted, family-owned trucking and logistics company delivering excellence across land. 
              Your cargo is safe with our experienced team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking" className="btn-accent text-lg px-8 py-4 shadow-2xl">
                Request a Truck
              </Link>
              <Link href="/contact" className="bg-white/15 backdrop-blur-md border-2 border-white/80 text-white hover:bg-white hover:text-primary font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <div className="text-white/80">
            <ChevronDown className="h-8 w-8" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <ScrollReveal key={stat.label} animation="reveal-up" delay={index * 0.1}>
                <div className="text-center stat-card p-6 rounded-xl cursor-default">
                  <div className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                    <CountUp end={stat.value} suffix={stat.suffix} duration={2200} className="stat-glow" />
                  </div>
                  <div className="text-gray-300 text-sm md:text-base uppercase tracking-wider">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-gray-50 animated-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="reveal-up">
            <div className="text-center mb-16">
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle mx-auto">
                Comprehensive trucking and logistics solutions tailored to your needs
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <ScrollReveal key={service.title} animation="reveal-up" delay={index * 0.12}>
                <div className="card card-hover group overflow-hidden cursor-pointer">
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                      <service.icon className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors duration-300">{service.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="reveal-fade" delay={0.3}>
            <div className="text-center mt-14">
              <Link href="/services" className="btn-outline inline-flex items-center space-x-2 group">
                <span>View All Services</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal animation="reveal-left">
              <div>
                <h2 className="section-title">Why Choose Thanesgaylerental?</h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  We combine decades of experience with modern technology to provide 
                  logistics solutions that exceed expectations.
                </p>
                <div className="space-y-6">
                  {whyChooseUs.map((item, index) => (
                    <ScrollReveal key={item.title} animation="reveal-up" delay={index * 0.15}>
                      <div className="flex items-start space-x-4 group cursor-default p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                        <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0">
                          <item.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="reveal-right">
              <div className="relative">
                <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Truck fleet"
                    fill
                    className="object-cover parallax-img"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-accent p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="text-white text-center">
                    <div className="text-3xl font-bold">98%</div>
                    <div className="text-sm font-medium">On-Time Delivery</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-primary p-4 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <div className="text-white text-center">
                    <div className="text-xl font-bold">24/7</div>
                    <div className="text-xs">Support</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="reveal-up">
            <div className="text-center mb-16">
              <h2 className="section-title">What Our Clients Say</h2>
              <p className="section-subtitle mx-auto">
                Trusted by businesses across the country
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reviews.slice(0, 4).map((review, index) => (
              <ScrollReveal key={review.id} animation="reveal-scale" delay={index * 0.1}>
                <div className="card card-hover p-6 h-full">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? "text-accent fill-accent" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="font-semibold text-gray-800">{review.customerName}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Calculator */}
      <PricingCalculator />

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal animation="reveal-up">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Ship Your Goods?
            </h2>
            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
              Get a free quote today and experience the Thanesgaylerental difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking" className="btn-accent text-lg px-10 py-4 shadow-2xl">
                Order a Truck Now
              </Link>
              <div className="flex items-center justify-center space-x-2 text-white bg-white/10 backdrop-blur-sm px-6 py-4 rounded-lg">
                <Phone className="h-5 w-5" />
                <span className="font-medium">+1 (555) 123-4567</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Info Bar */}
      <section className="py-14 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: "Visit Us", text: "123 Logistics Way, Transport City" },
              { icon: Phone, title: "Call Us", text: "+1 (555) 123-4567" },
              { icon: Mail, title: "Email Us", text: "info@thanesgaylerental.com" },
            ].map((item, index) => (
              <ScrollReveal key={item.title} animation="reveal-up" delay={index * 0.1}>
                <div className="flex items-center space-x-4 group cursor-default p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                  <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary transition-all duration-300 flex-shrink-0">
                    <item.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <p className="text-gray-600">{item.text}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
