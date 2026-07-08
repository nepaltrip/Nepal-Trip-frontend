import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
// ✨ FIXED: Added 'User' to the imports for the mobile login icon
import { Shield, LogOut, Bell, MapPin, ChevronDown, X, Info, Image, MessageSquare, Phone, User } from "lucide-react";

import { InquiryDialog } from "./InquiryDialog";
import { LoginModal } from "./LoginModal";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileDrawer } from "./MobileDrawer";
import { useLocationEngine } from "../../hooks/useLocationEngine";

import api from "../../api/axios";
import { logOutState } from "../../store/slices/authSlice";
import { GeoLocationModal } from "../modal/GeoLocationModal";

export function Navbar({ brand = "Nepal Trip" }) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Ref to track the profile dropdown area
    const profileRef = useRef(null);

    const [forceOpenLogin, setForceOpenLogin] = useState(false);
    const [forceOpenInquiry, setForceOpenInquiry] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const { locationData, permissionStatus, isLoading, fetchLocation } = useLocationEngine();

    const isSuperAdmin = user?.role === "SuperAdmin";
    const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";
    const firstName = user?.name ? user.name.split(" ")[0] : "User";
    const initial = firstName.charAt(0).toUpperCase();

    // Auto-prompt location on first visit with a 24-hour cooldown
    useEffect(() => {
        const timer = setTimeout(() => {
            const lastPromptTime = localStorage.getItem("locationPromptTimestamp");
            const now = Date.now();
            const ONE_DAY = 24 * 60 * 60 * 1000;

            if (permissionStatus !== "granted" && (!lastPromptTime || now - parseInt(lastPromptTime, 10) > ONE_DAY)) {
                setIsLocationModalOpen(true);
                localStorage.setItem("locationPromptTimestamp", now.toString());
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [permissionStatus]);

    // Smooth click-outside listener
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout failure:", error);
        } finally {
            dispatch(logOutState());
            toast.success("Logged out successfully");
            setIsMobileMenuOpen(false);
            setIsProfileOpen(false);
        }
    };

    const primaryNav = [
        { label: "Home", to: "/" },
        { label: "Packages", to: "/packages" },
        { label: "Discover", to: "/discover" },
    ];

    const exploreNav = [
        { label: "About Us", to: "/about", icon: Info },
        { label: "Media Gallery", to: "/gallery", icon: Image },
        { label: "Reviews", to: "/testimonials", icon: MessageSquare },
        { label: "Contact Base", to: "/contact", icon: Phone },
    ];

    const isExploreActive = exploreNav.some((n) => pathname === n.to);

    const handleDrawerAction = (action, target) => {
        setIsMobileMenuOpen(false);
        setTimeout(() => {
            if (action === "login") setForceOpenLogin(true);
            if (action === "inquiry") setForceOpenInquiry(true);
            if (action === "navigate") navigate(target);
        }, 310);
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-500 ease-out bill-changes">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90 shrink-0">
                        <img src="/logo.svg" alt={`${brand} Logo`} className="h-9 w-9 rounded-full object-cover shadow-xs bg-transparent" />
                        <span className="font-serif text-xl font-medium tracking-tight text-foreground">
                            {brand}
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex">
                        {primaryNav.map((n) => (
                            <Link
                                key={n.to}
                                to={n.to}
                                className={`relative text-sm font-medium transition-all duration-300 ease-in-out hover:text-[#FA6D16] ${pathname === n.to ? "text-[#FA6D16]" : "text-muted-foreground"}`}
                            >
                                {n.label}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#FA6D16] transition-all duration-300 ease-in-out ${pathname === n.to ? "w-full opacity-100" : "w-0 opacity-0"}`} />
                            </Link>
                        ))}

                        <div className="group relative">
                            <button className={`flex items-center gap-1 text-sm font-medium transition-all duration-300 ease-in-out hover:text-[#FA6D16] ${isExploreActive ? "text-[#FA6D16]" : "text-muted-foreground"}`}>
                                <span className="relative">
                                    Explore
                                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#FA6D16] transition-all duration-300 ease-in-out ${isExploreActive ? "w-full opacity-100" : "w-0 opacity-0"}`} />
                                </span>
                                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                            </button>

                            <div className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-popover p-1.5 shadow-xl backdrop-blur-xl">
                                    {exploreNav.map((n) => {
                                        const isActive = pathname === n.to;
                                        return (
                                            <Link
                                                key={n.to}
                                                to={n.to}
                                                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${isActive ? "bg-[#FA6D16]/10 text-[#FA6D16] font-semibold" : "text-muted-foreground hover:bg-muted/80 hover:text-[#FA6D16]"}`}
                                            >
                                                <n.icon className={`h-4 w-4 transition-colors ${isActive ? "opacity-100" : "opacity-70"}`} />
                                                {n.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </nav>

                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold tracking-tight border transition-all active:scale-95 ${permissionStatus === "denied"
                                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                : "bg-muted/60 border-border/40 text-foreground hover:bg-muted"
                                }`}
                        >
                            <MapPin className={`h-3.5 w-3.5 ${permissionStatus === "denied" ? "text-red-500 animate-pulse" : "text-[#FA6D16]"}`} />
                            <span className="max-w-22.5 sm:max-w-32.5 truncate">
                                {permissionStatus === "denied" ? "Location Off" : locationData ? locationData.district : "Locating..."}
                            </span>
                        </button>

                        {isAuthenticated && (
                            <button onClick={() => setIsNotificationOpen(true)} className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border/30 text-foreground bg-background/50 hover:bg-muted transition-all">
                                <Bell className="h-4 w-4" />
                                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                            </button>
                        )}

                        {isAuthenticated ? (
                            <div className="relative z-50 ml-1 md:ml-2 pl-1 md:pl-3 md:border-l md:border-border/40" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-background overflow-hidden hover:ring-2 hover:ring-[#FA6D16]/50 transition-all focus:outline-none"
                                >
                                    {user?.profilePic ? (
                                        <img src={user.profilePic} alt={user.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-[#FA6D16] text-white font-bold text-xs">
                                            {initial}
                                        </div>
                                    )}
                                </button>

                                <div className={`absolute right-0 top-full mt-3 w-64 z-50 rounded-2xl border border-border/50 bg-background/95 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 origin-top-right ${isProfileOpen ? "scale-100 opacity-100 visible" : "scale-95 opacity-0 invisible"}`}>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="h-16 w-16 mb-3 overflow-hidden rounded-full border-2 border-border/50 shadow-sm">
                                            {user?.profilePic ? (
                                                <img src={user.profilePic} alt={user.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-[#FA6D16] text-white font-bold text-2xl">
                                                    {initial}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-base font-bold text-foreground leading-tight">{user?.name}</p>
                                        <p className="text-xs font-medium text-muted-foreground mt-1 mb-4">{user?.email}</p>

                                        <div className="w-full h-px bg-border/60 mb-3" />

                                        {isSuperAdmin && (
                                            <Link to="/superadmin" onClick={() => setIsProfileOpen(false)} className="w-full flex h-10 items-center justify-center rounded-xl bg-purple-50 px-3 text-xs font-bold text-purple-600 hover:bg-purple-100 mb-2 transition-colors">
                                                Super Admin Dashboard
                                            </Link>
                                        )}
                                        {isAdmin && !isSuperAdmin && (
                                            <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="w-full flex h-10 items-center justify-center rounded-xl bg-red-50 px-3 text-xs font-bold text-red-600 hover:bg-red-100 mb-2 transition-colors">
                                                Admin Dashboard
                                            </Link>
                                        )}

                                        <button onClick={handleLogout} className="flex w-full h-10 items-center justify-center gap-2 rounded-xl bg-red-50/80 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors">
                                            <LogOut className="h-4 w-4" />
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* ✨ FIXED: Added Mobile Login Icon (Hidden on md and above) */}
                                <div className="flex md:hidden items-center ml-1">
                                    <LoginModal
                                        trigger={
                                            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border/30 bg-background/50 text-foreground hover:bg-muted transition-all">
                                                <User className="h-4 w-4" />
                                            </button>
                                        }
                                    />
                                </div>

                                {/* Desktop Login & Inquiry (Hidden on mobile) */}
                                <div className="hidden md:flex items-center gap-3 border-l border-border/40 pl-3 ml-1">
                                    <LoginModal trigger={<button className="inline-flex h-9 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-all">Log in</button>} />
                                    <InquiryDialog trigger={<button className="inline-flex h-9 items-center justify-center rounded-lg bg-[#FA6D16] px-4 py-2 text-sm font-medium text-white hover:bg-[#E55B05] transition-all">Inquiry</button>} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <MobileDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                user={user}
                isAuthenticated={isAuthenticated}
                handleLogout={handleLogout}
                exploreNav={exploreNav}
                primaryNav={primaryNav}
                pathname={pathname}
                onTriggerAction={handleDrawerAction}
            />

            <LoginModal open={forceOpenLogin} onOpenChange={setForceOpenLogin} trigger={<span className="hidden" />} />
            <InquiryDialog open={forceOpenInquiry} onOpenChange={setForceOpenInquiry} trigger={<span className="hidden" />} />

            <MobileBottomNav
                isDrawerOpen={isMobileMenuOpen}
                onToggleDrawer={() => setIsMobileMenuOpen(prev => !prev)}
                onCloseDrawer={() => setIsMobileMenuOpen(false)}
                pathname={pathname}
            />

            <GeoLocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                locationData={locationData}
                permissionStatus={permissionStatus}
                onLocateMe={fetchLocation}
                isLoading={isLoading}
            />

            {isAuthenticated && (
                <div className={`fixed inset-0 z-120 transition-opacity duration-300 ${isNotificationOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-xs" onClick={() => setIsNotificationOpen(false)} />
                    <div className={`fixed right-0 top-0 h-full w-full max-w-sm bg-card shadow-2xl border-l border-border/40 transition-transform duration-300 ease-in-out transform ${isNotificationOpen ? "translate-x-0" : "translate-x-full"}`}>
                        <div className="flex items-center justify-between border-b p-4">
                            <h2 className="font-serif text-base font-bold">Notifications</h2>
                            <button onClick={() => setIsNotificationOpen(false)} className="p-1 rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="flex h-3/4 flex-col items-center justify-center text-center opacity-70 p-6">
                            <Bell className="mb-4 h-9 w-9 text-muted-foreground animate-pulse" />
                            <p className="text-xs font-semibold">Inbox Up to Date</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}