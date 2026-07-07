import React, { useEffect } from "react";
import { X, Mail, Smartphone, MapPin, Ban, CheckCircle2, Activity, Compass, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UserDetailModal({ isOpen, onClose, userData }) {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!userData) return null;

    // Normalize status fields from different parts of the app
    const isBanned = userData.status === 'banned' || userData.crmStatus === 'banned';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-[90%] max-w-3xl max-h-[90dvh] overflow-y-auto bg-[#FDFBF7] rounded-3xl shadow-2xl z-70 flex flex-col md:flex-row border border-border/40"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full text-foreground transition-colors z-20">
                            <X className="h-5 w-5" />
                        </button>

                        {/* Left Panel: Profile */}
                        <div className="w-full md:w-2/5 bg-white p-6 md:p-8 border-b md:border-b-0 md:border-r border-border/40 flex flex-col items-center text-center">
                            <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-4 ${isBanned ? 'bg-red-500' : 'bg-[#2A5244]'}`}>
                                {userData.photo || userData.name?.charAt(0) || "U"}
                            </div>
                            <h2 className="text-xl font-bold font-serif text-foreground">{userData.name}</h2>
                            <span className={`mt-2 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${userData.leadScore === 'Hot' ? 'bg-[#FA6D16]/10 text-[#FA6D16] border-[#FA6D16]/20' :
                                    userData.leadScore === 'Spam' ? 'bg-red-100 text-red-600 border-red-200' :
                                        'bg-blue-100 text-blue-600 border-blue-200'
                                }`}>
                                {userData.leadScore || "Standard"} Lead
                            </span>

                            <div className="mt-6 w-full space-y-3 text-sm text-left">
                                <p className="flex items-center gap-2 text-muted-foreground font-medium">
                                    <Mail className="h-4 w-4 shrink-0 text-[#2A5244]" /> <span className="truncate">{userData.email}</span>
                                </p>
                                {userData.phone && (
                                    <p className="flex items-center gap-2 text-muted-foreground font-medium">
                                        <Smartphone className="h-4 w-4 shrink-0 text-[#2A5244]" /> {userData.phone}
                                    </p>
                                )}
                                {userData.location && (
                                    <p className="flex items-center gap-2 text-muted-foreground font-medium">
                                        <MapPin className="h-4 w-4 shrink-0 text-[#2A5244]" /> {userData.location}
                                    </p>
                                )}
                            </div>

                            <div className="mt-8 pt-6 w-full border-t border-border/40 md:mt-auto md:pt-8">
                                {!isBanned ? (
                                    <button className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-colors border border-red-200 shadow-sm active:scale-95">
                                        <Ban className="h-4 w-4" /> Ban User
                                    </button>
                                ) : (
                                    <button className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl transition-colors border border-emerald-200 shadow-sm active:scale-95">
                                        <CheckCircle2 className="h-4 w-4" /> Reactivate User
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Analytics */}
                        <div className="w-full md:w-3/5 p-6 md:p-8 bg-[#FDFBF7]">
                            <h3 className="text-lg font-bold font-serif text-foreground mb-6 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-[#2A5244]" /> Engagement Profile
                            </h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-white p-4 rounded-xl border border-border/40 shadow-sm">
                                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Visits</p>
                                    <p className="text-2xl font-black text-[#2A5244]">{userData.totalVisits || 0}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-border/40 shadow-sm">
                                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Last Seen</p>
                                    <p className="text-sm md:text-base font-bold text-foreground mt-1.5">{userData.lastSeen || "N/A"}</p>
                                </div>
                                <div className="col-span-2 bg-white p-4 rounded-xl border border-border/40 shadow-sm">
                                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Most Viewed Package</p>
                                    <p className="text-sm md:text-base font-bold text-foreground flex items-center gap-2 mt-1">
                                        <Compass className="h-4 w-4 text-[#FA6D16] shrink-0" /> <span className="truncate">{userData.mostViewed || "None"}</span>
                                    </p>
                                </div>
                                <div className="col-span-2 bg-white p-4 rounded-xl border border-border/40 shadow-sm">
                                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Highest Interest Vibe</p>
                                    <p className="text-sm md:text-base font-bold text-foreground flex items-center gap-2 mt-1">
                                        <TrendingUp className="h-4 w-4 text-[#2A5244] shrink-0" /> {userData.topVibe || "None"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}