"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useStore } from "@/store";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications } = useStore();
  const [showLatest, setShowLatest] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (!latest.read) {
        setLatestNotification(latest);
        setShowLatest(true);
        const timer = setTimeout(() => {
          setShowLatest(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case "order_received":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "truck_assigned":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "order_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "order_received":
        return "border-l-blue-500";
      case "truck_assigned":
      case "order_completed":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <>
      {children}
      
      {/* Toast Notification */}
      {showLatest && latestNotification && (
        <div
          className={`fixed top-24 right-4 z-50 bg-white rounded-lg shadow-xl p-4 max-w-sm border-l-4 ${getBorderColor(latestNotification.type)} notification-enter`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(latestNotification.type)}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{latestNotification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{latestNotification.message}</p>
            </div>
            <button
              onClick={() => setShowLatest(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
