import React, { useEffect, useState } from "react";
import { X, Mail, Smartphone, MapPin, Ban, CheckCircle2, Activity, Compass, TrendingUp, Edit2, ShieldAlert, Save, Trash2, AlertTriangle, Timer, MousePointerClick } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { toast } from "react-toastify";
import CustomSelect from "../ui/CustomSelect";

export function UserDetailModal({ isOpen, onClose, userData, viewerRole = "admin", onSave, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isBanning, setIsBanning] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBanDialogOpen, setIsBanDialogOpen] = useState(false); // ✨ NEW STATE
    const [displayUser, setDisplayUser] = useState(null);

    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", location: "", role: "User"
    });

    const targetUserId = userData?.userId || userData?.id || userData?._id;

    useEffect(() => {
        if (userData) setDisplayUser(userData);

        const fetchFreshProfile = async () => {
            if (isOpen && targetUserId) {
                try {
                    const { data } = await api.get(`/user/${targetUserId}`);
                    if (data && data.user) {
                        setDisplayUser(prev => ({
                            ...prev,
                            ...data.user,
                            photo: data.user.profilePic || prev?.photo,
                            mostViewed: data.user.mostViewedPackageName || prev?.mostViewed || "None",
                            topVibe: data.user.topVibe || prev?.topVibe || "None",
                            lastSeen: data.user.lastSeen
                                ? new Date(data.user.lastSeen).toLocaleString()
                                : prev?.lastSeen || "N/A",
                            isOnline: data.user.isOnline
                        }));
                        setFormData({
                            name: data.user.name || "",
                            email: data.user.email || "",
                            phone: data.user.mobile || "",
                            location: data.user.district ? `${data.user.district}, ${data.user.state}` : "",
                            role: data.user.role || "User"
                        });
                    }
                } catch (error) {
                    console.error("Failed to sync fresh user data", error);
                }
            }
        };
        fetchFreshProfile();
        setIsEditing(false);
        setIsDeleteDialogOpen(false);
        setIsBanDialogOpen(false); // ✨ Reset on open
    }, [userData, isOpen, targetUserId]);

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || userData.mobile || "",
                location: userData.location || "",
                role: userData.role || "User"
            });
        }
        setIsEditing(false);
        setIsDeleteDialogOpen(false);
        setIsBanDialogOpen(false); // ✨ Reset on open
    }, [userData, isOpen]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!displayUser) return null;

    const isBanned = displayUser.status === 'banned';
    const safeViewerRole = viewerRole?.toLowerCase() || "admin";
    const isSuperAdmin = safeViewerRole === "superadmin";
    const canEdit = safeViewerRole === "admin" || isSuperAdmin;

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data } = await api.put(`/user/${targetUserId}`, formData);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            if (onSave) onSave({ ...displayUser, ...data.user });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    // ✨ UPDATED: Now triggered from the confirmation dialog
    const handleConfirmBanToggle = async () => {
        setIsBanning(true);
        const newStatus = isBanned ? 'active' : 'banned';
        try {
            const { data } = await api.patch(`/user/${targetUserId}/ban`, { status: newStatus });
            toast.success(data.message);
            const updatedUser = { ...displayUser, status: newStatus };
            setDisplayUser(updatedUser); // Update local state instantly
            if (onSave) onSave(updatedUser); // Propagate to table
            setIsBanDialogOpen(false); // Close dialog
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change ban status.");
        } finally {
            setIsBanning(false);
        }
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/user/${targetUserId}`);
            toast.success("Account permanently deleted.");
            if (onDelete) onDelete(targetUserId);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete account.");
            setIsDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ layout: { type: "spring", bounce: 0, duration: 0.4 }, default: { duration: 0.2 } }}
                        className="relative z-10 w-full max-w-5xl max-h-[90dvh] overflow-y-auto overflow-x-hidden bg-[#FDFBF7] rounded-3xl shadow-2xl flex flex-col md:flex-row border border-border/40 transition-all duration-300 ease-in-out"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full text-foreground transition-colors z-20">
                            <X className="h-5 w-5" />
                        </button>

                        {/* ========================================== */}
                        {/* LEFT PANEL: IDENTITY & CRM CONTROL         */}
                        {/* ========================================== */}
                        <motion.div layout className={`w-full md:w-[35%] bg-white p-6 md:p-8 ${isEditing ? 'border-b-0' : 'border-b'} md:border-b-0 md:border-r border-border/40 flex flex-col items-center text-center relative min-h-125 transition-all duration-300 ease-in-out`}>

                            {/* OVERLAYS FOR CONFIRMATION ACTIONS */}
                            <AnimatePresence>
                                {/* DELETE DIALOG */}
                                {isDeleteDialogOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center md:rounded-l-3xl">
                                        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                            <AlertTriangle className="h-7 w-7 text-red-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h3>
                                        <p className="text-sm text-slate-500 mb-6">This action is permanent. All data for <strong>{displayUser.name}</strong> will be wiped.</p>
                                        <div className="w-full flex gap-3">
                                            <button onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">Cancel</button>
                                            <button onClick={handleConfirmDelete} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm transition-colors disabled:opacity-50">
                                                {isDeleting ? "Deleting..." : "Confirm"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ✨ NEW BAN/REACTIVATE DIALOG */}
                                {isBanDialogOpen && !isDeleteDialogOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center md:rounded-l-3xl">
                                        <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 ${isBanned ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                            {isBanned ? <CheckCircle2 className="h-7 w-7 text-emerald-600" /> : <Ban className="h-7 w-7 text-red-600" />}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                                            {isBanned ? 'Reactivate User?' : 'Ban User?'}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-6">
                                            Do you want to <strong>{isBanned ? 'activate' : 'ban'}</strong> the account for {displayUser.name}?
                                        </p>
                                        <div className="w-full flex gap-3">
                                            <button onClick={() => setIsBanDialogOpen(false)} disabled={isBanning} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">Cancel</button>
                                            <button onClick={handleConfirmBanToggle} disabled={isBanning} className={`flex-1 font-bold py-2.5 rounded-xl text-sm shadow-sm transition-colors disabled:opacity-50 text-white ${isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                                {isBanning ? "Processing..." : "Confirm"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {canEdit && !isEditing && !isDeleteDialogOpen && !isBanDialogOpen && (
                                <motion.button layout onClick={() => setIsEditing(true)} className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted text-xs font-bold rounded-lg border border-border/40 transition-colors">
                                    <Edit2 className="h-3.5 w-3.5 text-[#2A5244]" /> Edit
                                </motion.button>
                            )}

                            <motion.div layout className="relative mb-4 mt-4 md:mt-0 z-10">
                                <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg border-4 border-white ${isBanned ? 'bg-red-500' : 'bg-[#2A5244]'}`}>
                                    {displayUser.photo && displayUser.photo.length > 1 ? (
                                        <img src={displayUser.photo} alt={displayUser.name} className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        displayUser.photo || (formData.name ? formData.name.charAt(0).toUpperCase() : 'U')
                                    )}
                                </div>
                                {displayUser.isOnline && (
                                    <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm" />
                                )}
                            </motion.div>

                            <form onSubmit={handleSaveChanges} className="w-full flex flex-col items-center grow">
                                <AnimatePresence mode="wait">
                                    {isEditing ? (
                                        <motion.div key="edit-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col grow space-y-4 text-left mt-2">
                                            <div className="space-y-3">
                                                <div><label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 bg-[#FDFBF7] border border-border/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30" required /></div>
                                                <div><label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 bg-[#FDFBF7] border border-border/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30" required /></div>
                                                <div><label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 bg-[#FDFBF7] border border-border/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30" /></div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground pl-1 flex items-center gap-1">System Authority {!isSuperAdmin && "🔒"}</label>
                                                    {isSuperAdmin ? (
                                                        <CustomSelect
                                                            name="role"
                                                            value={formData.role}
                                                            onChange={handleInputChange}
                                                            options={[
                                                                { value: "User", label: "User" },
                                                                { value: "Admin", label: "Admin" },
                                                                { value: "SuperAdmin", label: "SuperAdmin" }
                                                            ]}
                                                            theme="orange"
                                                        />
                                                    ) : (
                                                        <div className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-not-allowed"><ShieldAlert className="h-4 w-4 text-slate-400" /> {formData.role}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-4 w-full mt-auto">
                                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors">Cancel</button>
                                                <button type="submit" disabled={isSaving} className="flex-1 relative bg-[#2A5244] hover:bg-[#1f3f34] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-70">
                                                    {isSaving ? "Saving..." : <><Save className="h-3.5 w-3.5" /> Save</>}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="view-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full flex flex-col items-center mt-2 grow">
                                            <h2 className="text-xl font-bold font-serif text-foreground break-all">{formData.name}</h2>

                                            {/* ✨ ADDED BANNED/ACTIVE TAG HERE */}
                                            <div className="flex flex-wrap gap-1.5 justify-center mt-2 mb-6">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${displayUser.status === 'banned' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                    {displayUser.status === 'banned' ? 'Banned' : 'Active'}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${displayUser.leadScore === 'Hot' ? 'bg-[#FA6D16] text-white border-[#FA6D16]' : displayUser.leadScore === 'Spam' ? 'bg-red-500 text-white border-red-600' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                    {displayUser.leadScore || "Standard"} Lead
                                                </span>
                                                {formData.role && formData.role !== "User" && <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-purple-100 text-purple-700 border-purple-200 shadow-sm">{formData.role}</span>}
                                            </div>

                                            <div className="w-full space-y-4 text-sm text-left border-t border-border/40 pt-6">
                                                <p className="flex items-center gap-3 text-muted-foreground font-medium"><Mail className="h-4.5 w-4.5 shrink-0 text-[#2A5244]" /> <span className="truncate">{formData.email}</span></p>
                                                {formData.phone && <p className="flex items-center gap-3 text-muted-foreground font-medium"><Smartphone className="h-4.5 w-4.5 shrink-0 text-[#2A5244]" /> {formData.phone}</p>}
                                                {formData.location && <p className="flex items-center gap-3 text-muted-foreground font-medium"><MapPin className="h-4.5 w-4.5 shrink-0 text-[#2A5244]" /> {formData.location}</p>}
                                            </div>

                                            <div className="mt-auto pt-8 w-full border-t border-border/40 space-y-3">
                                                {/* ✨ BUTTON NOW OPENS DIALOG INSTEAD OF FIRING INSTANTLY */}
                                                {!isBanned ? (
                                                    <button type="button" onClick={() => setIsBanDialogOpen(true)} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-colors border border-red-200 shadow-sm active:scale-95">
                                                        <Ban className="h-4 w-4" /> Ban User
                                                    </button>
                                                ) : (
                                                    <button type="button" onClick={() => setIsBanDialogOpen(true)} className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl transition-colors border border-emerald-200 shadow-sm active:scale-95">
                                                        <CheckCircle2 className="h-4 w-4" /> Reactivate User
                                                    </button>
                                                )}

                                                {canEdit && (
                                                    <button type="button" onClick={() => setIsDeleteDialogOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-2.5 rounded-xl transition-colors border border-slate-200 hover:border-red-200 shadow-sm active:scale-95">
                                                        <Trash2 className="h-4 w-4" /> Delete Account
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </motion.div>

                        {/* ========================================== */}
                        {/* RIGHT PANEL: TELEMETRY DASHBOARD           */}
                        {/* ========================================== */}
                        <motion.div layout className={`w-full md:w-[65%] p-6 md:p-8 bg-[#FDFBF7] flex flex-col gap-8 ${isEditing ? 'hidden md:flex' : 'flex'}`}>

                            {/* Section A: Global Platform Stats */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-[#2A5244]" /> Platform Behavior
                                </h3>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="col-span-2 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Last Active</p>
                                        <p className={`text-sm font-bold mt-1.5 ${displayUser.isOnline ? 'text-emerald-600' : 'text-foreground'}`}>
                                            {displayUser.isOnline ? 'Online Now' : (displayUser.lastSeen || "N/A")}
                                        </p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Most Viewed Package</p>
                                        <p className="text-sm font-bold text-foreground flex items-center gap-2 mt-1">
                                            <Compass className="h-4 w-4 text-[#FA6D16] shrink-0" /> <span className="truncate">{displayUser.mostViewed || "None"}</span>
                                        </p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Top Interest Vibe</p>
                                        <p className="text-sm font-bold text-foreground flex items-center gap-2 mt-1">
                                            <TrendingUp className="h-4 w-4 text-[#2A5244] shrink-0" /> {displayUser.topVibe || "None"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section B: Current Package Intent */}
                            {displayUser.sevenDayClicksOnThisPackage !== undefined && (
                                <div className="pt-2 border-t border-border/40">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                        <MousePointerClick className="h-4 w-4 text-[#FA6D16]" /> Package Specific Intent
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                                        <div className="bg-[#FA6D16]/5 p-4 rounded-2xl border border-[#FA6D16]/20">
                                            <p className="text-[10px] font-bold text-[#FA6D16] uppercase tracking-wider mb-1">7-Day Clicks</p>
                                            <p className="text-xl font-black text-[#FA6D16]">{displayUser.sevenDayClicksOnThisPackage || 0}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-border/40">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">All-Time Clicks</p>
                                            <p className="text-xl font-black text-slate-700">{displayUser.totalClicksOnThisPackage || 0}</p>
                                        </div>
                                    </div>

                                    {displayUser.tiers && displayUser.tiers.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                                            <div className="bg-slate-50 px-4 py-3 border-b border-border/40">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                    <Timer className="h-3.5 w-3.5" /> Exact Dwell Time (Tier Breakdown)
                                                </p>
                                            </div>
                                            <div className="divide-y divide-border/20">
                                                {displayUser.tiers.map((t, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-4">
                                                        <span className="font-black text-sm text-foreground uppercase tracking-wider">{t.tier} Tier</span>
                                                        <div className="flex gap-6 text-right">
                                                            <div className="flex flex-col border-r border-border/60 pr-6">
                                                                <p className="text-base font-black text-[#FA6D16]">{t.sevenDaySeconds}s</p>
                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">Last 7 Days</p>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-base font-black text-slate-600">{t.allTimeSeconds}s</p>
                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">All-Time Total</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}