"use client";

import { useState } from "react";
import Image from "next/image";
import { Truck, Send, CheckCircle, MapPin, Package, Calendar, Phone, Mail, User, Loader2 } from "lucide-react";
import { createOrder } from "@/lib/api";
import { ScrollReveal } from "@/hooks/useAnimations";
import { useToast } from "@/components/Toast";

export default function BookingPage() {
  const { showToast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    pickupLocation: "",
    deliveryLocation: "",
    goodsType: "",
    cargoWeight: "",
    cargoSize: "",
    preferredDate: "",
    additionalNotes: "",
  });

  const goodsTypes = [
    "General Merchandise", "Raw Materials", "Perishable Goods", "Electronics",
    "Furniture", "Automotive Parts", "Construction Materials", "Chemicals", "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Convert camelCase to snake_case for API
      const orderData = {
        customer_name: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        pickup_location: formData.pickupLocation,
        delivery_location: formData.deliveryLocation,
        goods_type: formData.goodsType,
        cargo_weight: formData.cargoWeight || null,
        cargo_size: formData.cargoSize || null,
        preferred_date: formData.preferredDate,
        additional_notes: formData.additionalNotes || null,
      };
      
      const response = await createOrder(orderData);
      setOrderNumber(response.order_number);
      setIsSubmitted(true);
      showToast("Order submitted successfully!", "success");
    } catch (error: any) {
      console.error("Error creating order:", error);
      showToast(error.message || "Failed to submit order. Please check your connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-fade-in">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-800 mb-4">Order Submitted Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for choosing Thanesgaylerental Properties LLC. We have received your order and will contact you shortly to confirm the details.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Order Summary:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Order #:</span> {orderNumber}</p>
                <p><span className="font-medium">From:</span> {formData.pickupLocation}</p>
                <p><span className="font-medium">To:</span> {formData.deliveryLocation}</p>
                <p><span className="font-medium">Cargo:</span> {formData.goodsType}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/" className="btn-primary">Back to Home</a>
              <a href="/tracking" className="btn-outline">Track Order</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-16 bg-primary">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Booking"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 drop-shadow-lg">Order a Truck</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Fill out the form below and we&apos;ll get back to you within 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="reveal-up">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-500">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="bg-primary/10 p-2 rounded-lg mr-3"><User className="h-5 w-5 text-primary" /></div>
                    Contact Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="input-field" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field" placeholder="+1 (555) 123-4567" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="john@example.com" />
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="bg-primary/10 p-2 rounded-lg mr-3"><MapPin className="h-5 w-5 text-primary" /></div>
                    Route Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location *</label>
                      <input type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required className="input-field" placeholder="City, State or Address" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location *</label>
                      <input type="text" name="deliveryLocation" value={formData.deliveryLocation} onChange={handleChange} required className="input-field" placeholder="City, State or Address" />
                    </div>
                  </div>
                </div>

                {/* Cargo Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <div className="bg-primary/10 p-2 rounded-lg mr-3"><Package className="h-5 w-5 text-primary" /></div>
                    Cargo Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type of Goods *</label>
                      <select name="goodsType" value={formData.goodsType} onChange={handleChange} required className="input-field">
                        <option value="">Select goods type</option>
                        {goodsTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cargo Weight (lbs)</label>
                      <input type="text" name="cargoWeight" value={formData.cargoWeight} onChange={handleChange} className="input-field" placeholder="e.g., 5000 lbs" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cargo Size / Dimensions</label>
                      <input type="text" name="cargoSize" value={formData.cargoSize} onChange={handleChange} className="input-field" placeholder="e.g., 20ft x 8ft x 8ft" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                      <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required className="input-field" />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes / Special Instructions</label>
                  <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} rows={4} className="input-field" placeholder="Any special requirements, handling instructions, etc." />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn-accent text-lg px-12 py-4 flex items-center space-x-2 group shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        <span>Submit Order</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Phone, title: "Phone", text: "+1 (917)547-8788" },
              { icon: Mail, title: "Email", text: "gayleobrien@gmail.com" },
              { icon: Truck, title: "Response Time", text: "Within 24 hours" },
            ].map((item, index) => (
              <ScrollReveal key={item.title} animation="reveal-up" delay={index * 0.1}>
                <div className="flex flex-col items-center group cursor-default p-6 rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all duration-500">
                  <div className="bg-primary/10 p-3 rounded-full mb-3 group-hover:bg-primary transition-colors duration-300">
                    <item.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-gray-600">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
