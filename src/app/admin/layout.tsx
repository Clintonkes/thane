"use client";

import { useRouter, usePathname } from "next/navigation";
import { AdminRoute } from "@/components/AdminRoute";
import { adminLogout, getCurrentAdmin, Admin } from "@/lib/api";
import { useState, useEffect, createContext, useContext } from "react";
import { 
  Truck, LogOut, Loader2, Bell, Home, Package, 
  MessageSquare, Phone, ChevronDown, Menu, X,
  AlertTriangle, Search
} from "lucide-react";

// Context for notifications
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'order' | 'message' | 'system';
  is_read: boolean;
  created_at: string;
}

interface AdminContextType {
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
  refreshNotifications: () => void;
}

const AdminContext = createContext<AdminContextType>({
  notifications: [],
  setNotifications: () => {},
  refreshNotifications: () => {},
});

export const useAdminContext = () => useContext(AdminContext);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminData = await getCurrentAdmin();
        setAdmin(adminData);
      } catch (error) {
        router.push("/tgrp");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const refreshNotifications = () => {
    // Refresh notifications - placeholder for real-time updates
    // In production, this would fetch from API
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await adminLogout();
    router.push("/tgrp");
  };

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/admin", 
      icon: Home,
      active: pathname === "/admin"
    },
    { 
      name: "Orders", 
      href: "/admin/orders", 
      icon: Package,
      active: pathname?.startsWith("/admin/orders"),
      dropdown: [
        { name: "All Orders", href: "/admin/orders" },
        { name: "Pending", href: "/admin/orders?status=pending" },
        { name: "En-route", href: "/admin/orders?status=in_progress" },
        { name: "Completed", href: "/admin/orders?status=completed" },
      ]
    },
    { 
      name: "Fleet", 
      href: "/admin/fleet", 
      icon: Truck,
      active: pathname === "/admin/fleet"
    },
    { 
      name: "Customer Service", 
      href: "/admin/messages", 
      icon: MessageSquare,
      active: pathname === "/admin/messages"
    },
    { 
      name: "Contact", 
      href: "/admin/contact", 
      icon: Phone,
      active: pathname === "/admin/contact"
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ notifications, setNotifications, refreshNotifications }}>
      <AdminRoute>
        <div className="min-h-screen bg-gray-50">
          {/* Top Navigation Bar */}
          <header className="bg-primary shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo & Brand */}
                <div className="flex items-center space-x-3">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <h1 className="text-white font-bold text-lg">Thanesgaylerental</h1>
                    <p className="text-gray-300 text-xs">Admin Dashboard</p>
                  </div>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-1">
                  {navItems.map((item) => (
                    <div key={item.name} className="relative">
                      <button
                        onClick={() => {
                          if (item.dropdown) {
                            setActiveDropdown(activeDropdown === item.name ? null : item.name);
                          } else {
                            router.push(item.href);
                            setActiveDropdown(null);
                          }
                        }}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item.active 
                            ? "bg-white/20 text-white" 
                            : "text-gray-200 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        {item.dropdown && <ChevronDown className="h-4 w-4" />}
                      </button>
                      
                      {/* Dropdown Menu */}
                      {item.dropdown && activeDropdown === item.name && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl py-2 animate-fade-in">
                          {item.dropdown.map((dropItem) => (
                            <button
                              key={dropItem.name}
                              onClick={() => {
                                router.push(dropItem.href);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                              {dropItem.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Right Side - Search & Logout */}
                <div className="flex items-center space-x-3">
                  {/* Search / Tracking Redirect */}
                  <div className="relative">
                    <button
                      onClick={() => router.push("/tracking")}
                      className="p-2 text-gray-200 hover:bg-white/10 rounded-lg transition-colors group"
                      title="Track Order"
                    >
                      <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-white font-medium text-sm">{admin?.full_name || admin?.username}</p>
                      <p className="text-gray-300 text-xs capitalize">{admin?.role}</p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-200 hover:bg-white/10 rounded-lg"
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-primary-900 border-t border-white/10">
                <div className="px-4 py-3 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.dropdown) {
                          setActiveDropdown(activeDropdown === item.name ? null : item.name);
                        } else {
                          router.push(item.href);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.active 
                          ? "bg-white/20 text-white" 
                          : "text-gray-200 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.dropdown && <ChevronDown className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="pt-16 pb-8 px-4">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          {/* Logout Confirmation Modal */}
          {showLogoutModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in overflow-hidden">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                  <p className="text-gray-500">Are you sure you want to log out of the admin dashboard?</p>
                </div>
                <div className="flex border-t border-gray-100">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-4 text-gray-600 font-semibold hover:bg-gray-50 transition-colors border-r border-gray-100"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-4 py-4 text-red-600 font-bold hover:bg-red-50 transition-colors"
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminRoute>
    </AdminContext.Provider>
  );
}
