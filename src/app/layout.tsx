import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { NotificationProvider } from "@/components/NotificationProvider";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Thanesgaylerental Properties LLC | Professional Trucking & Logistics",
  description: "Trusted, family-owned trucking and logistics company specializing in transporting goods and cargo across land. Reliable, efficient, and timely services.",
  keywords: "trucking, logistics, cargo transport, freight, shipping, delivery service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <NotificationProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ChatWidget />
          <WhatsAppButton />
        </NotificationProvider>
      </body>
    </html>
  );
}
