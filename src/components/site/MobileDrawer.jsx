import React, { useState, useEffect, useRef } from "react";
// ✨ ADDED 'Briefcase' to Lucide imports for the Services button
import { LogOut, Shield, ChevronRight, Briefcase } from "lucide-react";

export function MobileDrawer({ isOpen, onClose, user, isAuthenticated, handleLogout, exploreNav, onTriggerAction, pathname }) {
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);

    const startY = useRef(0);
    const sheetRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = "hidden";
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
                document.body.style.overflow = "";
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleTouchStart = (e) => {
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const deltaY = e.touches[0].clientY - startY.current;
        if (deltaY > 0) setCurrentY(deltaY);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (currentY > 110) onClose();
        setCurrentY(0);
    };

    const executeAction = (action, payload = null) => {
        onClose();
        setTimeout(() => {
            if (action === "logout") {
                handleLogout();
            } else {
                onTriggerAction(action, payload);
            }
        }, 300);
    };

    if (!shouldRender) return null;

    const firstName = user?.name ? user.name.split(" ")[0] : "User";
    const initial = firstName.charAt(0).toUpperCase();
    const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

    return (
        <div
            className={`fixed inset-0 z-40 bg-background/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
            onClick={onClose}
        >
            <div
                ref={sheetRef}
                className="fixed bottom-0 left-0 w-full rounded-t-3xl bg-card border-t border-border/60 pb-24 pt-3 px-5 shadow-2xl flex flex-col touch-none"
                style={{
                    transform: isDragging ? `translateY(${currentY}px)` : (isVisible ? `translateY(0)` : `translateY(100%)`),
                    transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-5" />

                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-serif text-xl font-bold">Explore Menu</h2>
                </div>

                {isAuthenticated ? (
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3.5 border border-border/40">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FA6D16] text-white font-bold text-base shadow-xs overflow-hidden">
                                {user?.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt={user.name}
                                        referrerPolicy="no-referrer"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initial
                                )}
                            </div>

                            <div className="flex flex-col">
                                <span className="text-sm font-bold leading-tight">{user?.name}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-45 mt-0.5">{user?.email}</span>
                            </div>
                        </div>
                        <button onClick={() => executeAction("logout")} className="rounded-xl p-2 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => executeAction("login")}
                        className="w-full h-11 rounded-xl border font-semibold text-sm hover:bg-muted/40 transition-all active:scale-[0.99]"
                    >
                        Log In to Account
                    </button>
                )}

                <div className="grid grid-cols-2 gap-2.5 my-5">
                    {/* ✨ ADDED: Hardcoded Services Button as the First Option */}
                    <button
                        onClick={() => executeAction("navigate", "/services")}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all active:scale-95 ${pathname === "/services"
                            ? "border-[#FA6D16] bg-[#FA6D16]/10 text-[#FA6D16]"
                            : "border-border/30 bg-muted/10 text-foreground"
                            }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <Briefcase className={`h-4 w-4 ${pathname === "/services" ? "text-[#FA6D16]" : "text-muted-foreground/80"}`} />
                            <span className="text-xs font-semibold">Services</span>
                        </div>
                        <ChevronRight className={`h-3 w-3 ${pathname === "/services" ? "text-[#FA6D16]" : "text-muted-foreground/40"}`} />
                    </button>

                    {/* Renders the rest of the explore options */}
                    {exploreNav.map(n => {
                        const isActive = pathname === n.to;
                        return (
                            <button
                                key={n.to}
                                onClick={() => executeAction("navigate", n.to)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all active:scale-95 ${isActive
                                    ? "border-[#FA6D16] bg-[#FA6D16]/10 text-[#FA6D16]"
                                    : "border-border/30 bg-muted/10 text-foreground"
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <n.icon className={`h-4 w-4 ${isActive ? "text-[#FA6D16]" : "text-muted-foreground/80"}`} />
                                    <span className="text-xs font-semibold">{n.label}</span>
                                </div>
                                <ChevronRight className={`h-3 w-3 ${isActive ? "text-[#FA6D16]" : "text-muted-foreground/40"}`} />
                            </button>
                        );
                    })}
                </div>

                {isAuthenticated && isAdmin && (
                    <button
                        onClick={() => executeAction("navigate", user.role === "SuperAdmin" ? "/superadmin" : "/admin")}
                        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-100 mb-3 transition-all active:scale-98"
                    >
                        <Shield className="h-3.5 w-3.5" /> Dashboard Hub
                    </button>
                )}

                <button
                    onClick={() => executeAction("inquiry")}
                    className="w-full h-11 rounded-xl bg-[#FA6D16] font-semibold text-sm text-white shadow-md hover:bg-[#E55B05] transition-all active:scale-98"
                >
                    Submit General Inquiry
                </button>
            </div>
        </div>
    );
}   