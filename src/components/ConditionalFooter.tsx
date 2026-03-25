"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { ChatWidget } from "./ChatWidget";
import { WhatsAppButton } from "./WhatsAppButton";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </>
  );
}
