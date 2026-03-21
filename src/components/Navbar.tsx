"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Truck, Bell } from "lucide-react";
import { useStore } from "@/store";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Fleet", href: "/fleet" },
    { name: "Order Truck", href: "/booking" },
    { name: "Contact", href: "/contact" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { notifications, markNotificationRead } = useStore();
    const unreadCount = notifications.filter((n) => !n.read).length;
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white shadow-lg py-2"
                    : "bg-primary/95 backdrop-blur-sm py-4"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className={`rounded-lg p-2 ${isScrolled ? "bg-primary" : "bg-white/10"}`}>
                            <Truck className="h-8 w-8 text-white" />
                        </div>
                        <div className={`${isScrolled ? "text-primary" : "text-white"}`}>
                            <span className="font-heading font-bold text-xl block">Thanesgaylerental</span>
                            <span className="text-xs uppercase tracking-wider">Properties LLC</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isScrolled
                                        ? "text-gray-700 hover:text-primary hover:bg-primary/10"
                                        : "text-white/90 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Notification Bell & Mobile Menu */}
                    <div className="flex items-center space-x-3">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2 rounded-lg transition-all duration-300 relative ${isScrolled
                                        ? "text-gray-700 hover:bg-gray-100"
                                        : "text-white hover:bg-white/10"
                                    }`}
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden animate-slide-down">
                                    <div className="p-3 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="p-4 text-gray-500 text-center text-sm">
                                                No notifications yet
                                            </p>
                                        ) : (
                                            notifications.slice(0, 5).map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => markNotificationRead(notif.id)}
                                                    className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!notif.read ? "bg-blue-50" : ""
                                                        }`}
                                                >
                                                    <p className="font-medium text-sm text-gray-800">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CTA Button */}
                        <Link
                            href="/booking"
                            className="hidden sm:block btn-accent text-sm py-2 px-4"
                        >
                            Get Quote
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`lg:hidden p-2 rounded-lg ${isScrolled
                                    ? "text-gray-700 hover:bg-gray-100"
                                    : "text-white hover:bg-white/10"
                                }`}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mt-4 bg-white rounded-xl shadow-lg overflow-hidden animate-slide-down">
                        <div className="py-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-700 hover:bg-primary/10 hover:text-primary font-medium transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="px-4 pt-2 pb-4">
                                <Link
                                    href="/booking"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="btn-accent w-full text-center block"
                                >
                                    Get Quote
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
