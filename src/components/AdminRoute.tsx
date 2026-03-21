"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/api";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/tgrp");
    }
  }, [router]);

  // Show nothing while checking (or could show a loading spinner)
  if (typeof window !== "undefined" && !isAdminAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
