"use client";

import Image from "next/image";
import { Truck, Users, Award, Clock, Shield, Heart } from "lucide-react";
import { ScrollReveal } from "@/hooks/useAnimations";

const values = [
  {
    icon: Heart,
    title: "Family Values",
    description: "As a family-owned business, we treat every customer like family with personalized service and attention.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Your cargo's safety is our top priority with rigorous safety protocols and regular vehicle maintenance.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "We understand deadlines matter. Our commitment to punctuality ensures your goods arrive when promised.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Every decision we make is guided by what's best for our customers and their logistics needs.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Truck fleet"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 drop-shadow-lg">About Thanesgaylerental</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Building trust through reliable transportation services since 2009
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal animation="reveal-left">
              <div>
                <h2 className="section-title">Our Story</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Founded in 2009, Thanesgaylerental Properties LLC began as a small family-owned trucking operation with just two trucks. Through dedication to customer satisfaction and unwavering commitment to quality service, we have grown into one of the most trusted logistics companies in the region.
                  </p>
                  <p>
                    Our journey started with a simple mission: to provide businesses and individuals with reliable, efficient, and affordable trucking services. Today, we operate a fleet of over 50 trucks and have served thousands of satisfied customers across the country.
                  </p>
                  <p>
                    What sets us apart is our family values. Every member of our team, from drivers to dispatchers, is committed to treating each shipment with the same care and attention we would give to our own family&apos;s goods.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="reveal-right">
              <div className="relative">
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Our fleet"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-accent p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <div className="text-white text-center">
                    <div className="text-4xl font-bold">15+</div>
                    <div className="text-sm font-medium">Years of Excellence</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal animation="reveal-up">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To deliver exceptional transportation and logistics solutions that empower businesses to thrive, while maintaining the highest standards of safety, reliability, and customer service that have been the foundation of our family legacy.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="reveal-up" delay={0.15}>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Truck className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-800 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To be the most trusted name in trucking and logistics, recognized for our commitment to excellence, innovation in service delivery, and the personal relationships we build with every customer we serve.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="reveal-up">
            <div className="text-center mb-16">
              <h2 className="section-title">Our Core Values</h2>
              <p className="section-subtitle mx-auto">
                The principles that guide everything we do
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <ScrollReveal key={value.title} animation="reveal-scale" delay={index * 0.1}>
                <div className="text-center p-6 rounded-xl hover:bg-gray-50 hover:shadow-lg hover:-translate-y-2 transition-all duration-500 cursor-default group">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
                    <value.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
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
              Ready to Work With Us?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Let us handle your logistics needs with the care and professionalism you deserve.
            </p>
            <a
              href="/booking"
              className="btn-accent text-lg px-8 py-4 inline-block shadow-2xl"
            >
              Get a Quote
            </a>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
