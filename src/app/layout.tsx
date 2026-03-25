import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ToastProvider } from "@/components/Toast";

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
          <ToastProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <ConditionalFooter />
          </ToastProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
