import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Menu, X, Shield, LogOut } from "lucide-react";
import { InquiryDialog } from "./InquiryDialog";
import { LoginModal } from "./LoginModal";

import api from "../../api/axios";
import { logOutState } from "../../store/slices/authSlice";

export function Navbar({ brand = "Nepal Trip" }) {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;

    // Pull Auth State from Redux
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";
    const isSuperAdmin = user?.role === "SuperAdmin";

    // Helper to get first name and initial
    const firstName = user?.name ? user.name.split(" ")[0] : "User";
    const initial = firstName.charAt(0).toUpperCase();

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            dispatch(logOutState());
            toast.success("Logged out successfully");
            setOpen(false); // Close mobile menu if open
        }
    };

    const nav = [
        { label: "Home", to: "/" },
        { label: "Packages", to: "/packages" },
        { label: "Discover", to: "/discover" },
        { label: "About", to: "/about" },
        { label: "Gallery", to: "/gallery" },
        { label: "Testimonials", to: "/testimonials" },
        { label: "Contact", to: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90" onClick={() => setOpen(false)}>
                    <img src="/logo.svg" alt={`${brand} Logo`} className="h-10 w-10 rounded-full object-cover shadow-sm bg-transparent" />
                    <span className="font-serif text-2xl font-medium tracking-tight text-foreground">
                        {brand}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-6 md:flex">
                    {nav.map((n) => (
                        <Link key={n.to} to={n.to} className={`relative text-sm font-medium transition-all duration-300 ease-in-out hover:text-foreground ${pathname === n.to ? "text-foreground" : "text-muted-foreground"}`}>
                            {n.label}
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-foreground transition-all duration-300 ease-in-out ${pathname === n.to ? "w-full opacity-100" : "w-0 opacity-0"}`} />
                        </Link>
                    ))}

                    <div className="ml-2 flex items-center gap-3 border-l border-border/40 pl-6">
                        {/* Dynamic User & Auth Controls */}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                {/* Role Shields */}
                                {isSuperAdmin ? (
                                    <Link to="/superadmin" title="Super Admin Dashboard" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-purple-50 px-3 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100">
                                        <Shield className="h-4 w-4" />
                                        <span className="hidden lg:inline">Super Admin</span>
                                    </Link>
                                ) : isAdmin ? (
                                    <Link to="/admin" title="Admin Dashboard" className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-red-50 px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
                                        <Shield className="h-4 w-4" />
                                        <span className="hidden lg:inline">Admin</span>
                                    </Link>
                                ) : null}

                                {/* User Profile UI */}
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FA6D16] text-white font-bold text-sm shadow-sm">
                                        {initial}
                                    </div>
                                    <span className="text-sm font-semibold text-foreground hidden xl:block">
                                        {firstName}
                                    </span>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    title="Log out"
                                    className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 focus-visible:outline-none"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <LoginModal
                                trigger={
                                    <button className="inline-flex h-9 items-center justify-center rounded-md border border-foreground bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-300 hover:bg-muted hover:scale-105 active:scale-95">
                                        Log in
                                    </button>
                                }
                            />
                        )}

                        <InquiryDialog
                            trigger={
                                <button className="inline-flex h-9 items-center justify-center rounded-md bg-[#FA6D16] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 ease-in-out hover:bg-[#E55B05] hover:scale-105 active:scale-95">
                                    Inquiry
                                </button>
                            }
                        />
                    </div>
                </nav>

                {/* Mobile Right-side Controls */}
                <div className="flex items-center gap-4 md:hidden">
                    {isAuthenticated && isSuperAdmin && (
                        <Link to="/superadmin" className="text-purple-600 transition-transform active:scale-95" onClick={() => setOpen(false)}>
                            <Shield className="h-6 w-6" fill="currentColor" fillOpacity={0.1} />
                        </Link>
                    )}
                    {isAuthenticated && isAdmin && !isSuperAdmin && (
                        <Link to="/admin" className="text-red-600 transition-transform active:scale-95" onClick={() => setOpen(false)}>
                            <Shield className="h-6 w-6" fill="currentColor" fillOpacity={0.1} />
                        </Link>
                    )}
                    <button className="text-foreground transition-transform duration-300 ease-in-out active:scale-90" onClick={() => setOpen(!open)}>
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            <div className={`md:hidden grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr] border-b border-border/40" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <nav className="flex flex-col space-y-2 px-4 py-4 bg-background">
                        {/* Mobile User Profile if Logged In */}
                        {isAuthenticated && (
                            <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/30 p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FA6D16] text-white font-bold">
                                        {initial}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{user?.name}</span>
                                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="rounded-md p-2 text-red-600 hover:bg-red-50">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {nav.map((n) => (
                            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out ${pathname === n.to ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
                                {n.label}
                            </Link>
                        ))}

                        <div className="mt-2 flex flex-col gap-3 border-t border-border/40 pt-4 pb-2">
                            <InquiryDialog trigger={<button className="inline-flex w-full h-10 items-center justify-center rounded-md bg-[#FA6D16] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 ease-in-out hover:bg-[#E55B05] active:scale-95">Inquiry</button>} />

                            {!isAuthenticated && (
                                <LoginModal trigger={<button className="inline-flex w-full h-10 items-center justify-center rounded-md border border-foreground bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-300 hover:bg-muted active:scale-95">Log in</button>} />
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}