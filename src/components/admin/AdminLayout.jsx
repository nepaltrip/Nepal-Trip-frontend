import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Settings,
    Shield,
    Compass,
    Users
} from "lucide-react";

export function AdminLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const location = useLocation();
    const pathname = location.pathname;

    // Simulate profile data fetching with a Shimmer UI
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsProfileLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const adminLinks = [
        { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
        { label: "Inquiries", to: "/admin/inquiries", icon: MessageSquare },
        { label: "Users", to: "/admin/users", icon: Users },
        { label: "Settings", to: "/admin/settings", icon: Settings },
    ];

    const SidebarContent = () => (
        <div className="flex h-full flex-col justify-between">
            <div>
                {/* Brand Header */}
                <div className="flex h-16 items-center gap-3 px-6 border-b border-border/40">
                    <Shield className="h-6 w-6 text-red-600 shrink-0" />
                    <span className="font-serif text-xl font-bold tracking-tight text-foreground truncate">
                        Admin Portal
                    </span>
                    {/* Mobile Close Button (Only visible in mobile drawer) */}
                    <button
                        className="ml-auto md:hidden p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User Profile Section with Shimmer UI */}
                <div className="px-6 py-5 border-b border-border/40 bg-[#FDFBF7]/50">
                    {isProfileLoading ? (
                        // Shimmer Loading State
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-muted relative overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent skew-x-12"></div>
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="h-3 w-24 bg-muted rounded-full relative overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent skew-x-12"></div>
                                </div>
                                <div className="h-2 w-32 bg-muted rounded-full relative overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent skew-x-12"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Loaded Profile State
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-[#2A5244] to-[#1a332a] flex items-center justify-center text-white font-serif font-bold shadow-md border-2 border-white">
                                A
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-foreground leading-tight truncate">Ankit Pandey</span>
                                <span className="text-[11px] font-medium text-muted-foreground truncate">Admin</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="mt-6 flex flex-col space-y-1 px-3">
                    {adminLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${isActive
                                    ? "bg-[#2A5244] text-white shadow-md"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Footer Actions */}
            <div className="border-t border-border/40 p-4 space-y-2">
                <Link
                    to="/"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-[#FA6D16]/10 hover:text-[#FA6D16]"
                >
                    <Compass className="h-5 w-5 shrink-0" />
                    Return to site
                </Link>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 hover:text-red-700">
                    <LogOut className="h-5 w-5 shrink-0" />
                    Log out
                </button>
            </div>
        </div>
    );

    return (
        // CHANGED: From "min-h-screen" to "h-screen overflow-hidden" to lock the sidebar height and let only the main tag scroll.
        <div className="flex h-screen overflow-hidden w-full bg-[#F5F5F5] text-foreground font-sans">
            {/* Custom Tailwind Shimmer Keyframes */}
            <style>
                {`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                `}
            </style>

            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-border/40 bg-card md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                <SidebarContent />
            </aside>

            {/* Mobile Off-Canvas Menu */}
            <div className={`fixed inset-0 z-50 transition-opacity md:hidden ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <aside className={`absolute top-0 left-0 h-full w-72 bg-card shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <SidebarContent />
                </aside>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden relative">

                {/* Mobile Top Header */}
                <header className="flex h-16 shrink-0 items-center border-b border-border/40 bg-white px-4 md:hidden shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-md p-2 -ml-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center gap-2 border-l border-border/60 pl-3">
                            <Shield className="h-5 w-5 text-red-600" />
                            <span className="font-serif text-lg font-bold">Admin Portal</span>
                        </div>
                    </div>
                </header>

                {/* Main Viewport for Admin Pages with Framer Motion Route Transitions */}
                <main className="flex-1 overflow-y-auto bg-[#FDFBF7]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="p-4 md:p-8 min-h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}