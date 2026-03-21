"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const openWhatsApp = () => {
    window.open("https://wa.me/15551234567", "_blank");
  };

  return (
    <button
      onClick={openWhatsApp}
      className="fixed bottom-6 right-24 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-90 transition-all duration-300"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
