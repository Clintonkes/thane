"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((current) => current?.id === id ? null : current);
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-24 right-4 z-[100] flex items-center p-4 transform transition-all duration-300 text-gray-700 bg-white rounded-xl shadow-2xl border-l-4" 
             style={{ borderLeftColor: toast.type === "error" ? "#ef4444" : toast.type === "success" ? "#22c55e" : "#3b82f6" }}>
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
            {toast.type === "success" && <CheckCircle className="w-6 h-6 text-green-500" />}
            {toast.type === "error" && <AlertCircle className="w-6 h-6 text-red-500" />}
            {toast.type === "info" && <Info className="w-6 h-6 text-blue-500" />}
          </div>
          <div className="ml-3 text-sm font-medium mr-6">{toast.message}</div>
          <button type="button" onClick={() => setToast(null)} className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
