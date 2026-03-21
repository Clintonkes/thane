"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How do I book a truck for my cargo?",
    answer: "You can book a truck by clicking the 'Order a Truck' button on our website or calling our hotline. Fill out the booking form with your pickup location, delivery location, cargo details, and preferred date. Our team will confirm your order within 24 hours.",
  },
  {
    question: "What types of cargo can you transport?",
    answer: "We transport a wide variety of cargo including general merchandise, bulk goods, refrigerated items, oversized loads, hazardous materials (with proper certification), and more. Contact us for specific cargo requirements.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery time depends on the distance and cargo type. For local deliveries, we typically complete within 24-48 hours. Long-distance shipments across the country usually take 3-7 business days. Express delivery options are available for urgent shipments.",
  },
  {
    question: "Is my cargo insured during transport?",
    answer: "Yes, all shipments are covered by our comprehensive cargo insurance policy. We also offer additional insurance options for high-value items. Our team will provide you with all the insurance details during the booking process.",
  },
  {
    question: "Can I track my shipment in real-time?",
    answer: "Absolutely! We provide real-time tracking for all our shipments. Once your order is confirmed, you'll receive a tracking number that you can use to monitor your cargo's location through our tracking system.",
  },
  {
    question: "What areas do you serve?",
    answer: "We provide trucking and logistics services across the entire country. Our fleet operates from coast to coast, ensuring your cargo reaches any destination. Contact us for specific route information.",
  },
  {
    question: "How are shipping costs calculated?",
    answer: "Shipping costs are calculated based on several factors: distance, cargo weight, truck type required, and any special handling needs. You can use our pricing calculator for an estimate, or request a quote for an exact price.",
  },
  {
    question: "What happens if my cargo is damaged during transport?",
    answer: "In the rare event of damage, please report it immediately upon delivery. Our claims team will investigate and process your claim according to our insurance policy. We strive to handle any issues promptly and fairly.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="section-title flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8 text-accent" />
            Frequently Asked Questions
          </h2>
          <p className="section-subtitle mx-auto">
            Find answers to common questions about our services
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-primary transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
