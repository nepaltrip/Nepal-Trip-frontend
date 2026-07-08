import React, { useEffect, useState } from "react";
import { X, Mail, Smartphone, MapPin, Ban, CheckCircle2, Activity, Compass, TrendingUp, Edit2, ShieldAlert, Save, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UserDetailModal({ isOpen, onClose, userData, viewerRole = "admin", onSave, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        role: "User"
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                location: userData.location || "",
                role: userData.role || "User"
            });
        }
        setIsEditing(false);
        setIsDeleteDialogOpen(false);
    }, [userData, isOpen]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!userData) return null;

    const isBanned = userData.status === 'banned' || userData.crmStatus === 'banned';
    const safeViewerRole = viewerRole?.toLowerCase() || "admin";
    const isSuperAdmin = safeViewerRole === "superadmin";
    const canEdit = safeViewerRole === "admin" || isSuperAdmin;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            if (onSave) {
                onSave({ ...userData, ...formData });
            }
        }, 1200);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete(userData);
        }
        setIsDeleteDialogOpen(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                // FIX: Added a fixed full-screen flex wrapper to handle perfect centering
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        layout // Enables FLIP animation
                        // FIX: Removed translation constraints. Flexbox now handles the centering.
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        // FIX: Added 60fps smooth spring physics
                        transition={{
                            layout: { type: "spring", bounce: 0, duration: 0.4 },
                            default: { duration: 0.2 }
                        }}
                        className="relative z-10 w-full md:w-[90%] max-w-3xl max-h-[90dvh] overflow-y-auto overflow-x-hidden bg-[#FDFBF7] rounded-3xl shadow-2xl flex flex-col md:flex-row border border-border/40"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full text-foreground transition-colors z-20">
                            <X className="h-5 w-5" />
                        </button>

                        {/* Left Panel: Profile Info / Editor */}
                        <motion.div
                            layout
                            className={`w-full md:w-2/5 bg-white p-6 md:p-8 ${isEditing ? 'border-b-0' : 'border-b'} md:border-b-0 md:border-r border-border/40 flex flex-col items-center text-center relative min-h-125`}
                        >
                            <AnimatePresence>
                                {isDeleteDialogOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center md:rounded-l-3xl"
                                    >
                                        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                            <AlertTriangle className="h-7 w-7 text-red-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h3>
                                        <p className="text-sm text-slate-500 mb-6">
                                            This action is permanent and cannot be undone. All data for <strong>{userData.name}</strong> will be lost.
                                        </p>
                                        <div className="w-full flex gap-3">
                                            <button onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
                                            <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-sm">Delete</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {canEdit && !isEditing && !isDeleteDialogOpen && (
                                <motion.button layout onClick={() => setIsEditing(true)} className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted text-xs font-bold rounded-lg transition-colors border border-border/40">
                                    <Edit2 className="h-3.5 w-3.5 text-[#2A5244]" /> Edit
                                </motion.button>
                            )}

                            <motion.div layout className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-4 mt-4 md:mt-0 z-10 ${isBanned ? 'bg-red-500' : 'bg-[#2A5244]'}`}>
                                {userData.photo || formData.name.charAt(0) || "U"}
                            </motion.div>

                            <form onSubmit={handleSaveChanges} className="w-full flex flex-col items-center grow">
                                <AnimatePresence mode="wait">
                                    {isEditing ? (
                                        <motion.div key="edit-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="w-full flex flex-col grow space-y-4 text-left mt-2">
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground pl-1">Full Name</label>
                                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 bg-[#FDFBF7] border border-border/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30" required />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground pl-1">Email Address</label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 bg-[#FDFBF7] border border-border/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30" required />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground pl-1">Phone Number</label>
                                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 bg-[#FDFBF7] border border-border/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground pl-1">Location Context</label>
                                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full p-2.5 bg-[#FDFBF7] border border-border/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground pl-1 flex items-center gap-1">System Authority {!isSuperAdmin && "🔒"}</label>
                                                    {isSuperAdmin ? (
                                                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-2.5 bg-purple-50/50 border border-purple-200 text-purple-900 font-bold rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30">
                                                            <option value="User">User Privileges</option>
                                                            <option value="Admin">Admin Dashboard Access</option>
                                                            <option value="SuperAdmin">SuperAdmin God Mode</option>
                                                        </select>
                                                    ) : (
                                                        <div className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-not-allowed" title="Requires SuperAdmin clearance">
                                                            <ShieldAlert className="h-4 w-4 shrink-0 text-slate-400" /> {formData.role || "User"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-4 w-full mt-auto">
                                                <button type="button" onClick={() => { setIsEditing(false); setFormData({ name: userData.name, email: userData.email, phone: userData.phone, location: userData.location, role: userData.role }); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors border border-slate-200">Cancel</button>
                                                <button type="submit" disabled={isSaving} className="flex-1 relative overflow-hidden bg-[#2A5244] hover:bg-[#1f3f34] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm inline-flex items-center justify-center gap-1.5">
                                                    {isSaving && <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-[shimmer_1s_infinite]" />}
                                                    <Save className="h-3.5 w-3.5" /> Save
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="view-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="w-full flex flex-col items-center mt-2 grow">
                                            <h2 className="text-xl font-bold font-serif text-foreground break-all">{formData.name}</h2>
                                            <div className="flex flex-wrap gap-1.5 justify-center mt-2 mb-6">
                                                <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${userData.leadScore === 'Hot' ? 'bg-[#FA6D16]/10 text-[#FA6D16] border-[#FA6D16]/20' : userData.leadScore === 'Spam' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>{userData.leadScore || "Standard"} Lead</span>
                                                {formData.role && formData.role !== "User" && <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-purple-100 text-purple-700 border-purple-200">{formData.role}</span>}
                                            </div>
                                            <div className="w-full space-y-4 text-sm text-left border-t border-border/20 pt-6">
                                                <p className="flex items-center gap-3 text-muted-foreground font-medium"><Mail className="h-4.5 w-4.5 shrink-0 text-[#2A5244]" /> <span className="truncate">{formData.email}</span></p>
                                                {formData.phone && <p className="flex items-center gap-3 text-muted-foreground font-medium"><Smartphone className="h-4.5 w-4.5 shrink-0 text-[#2A5244]" /> {formData.phone}</p>}
                                                {formData.location && <p className="flex items-center gap-3 text-muted-foreground font-medium"><MapPin className="h-4.5 w-4.5 shrink-0 text-[#2A5244]" /> {formData.location}</p>}
                                            </div>
                                            <div className="mt-auto pt-8 w-full border-t border-border/40 space-y-3">
                                                {!isBanned ? (
                                                    <button type="button" className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-colors border border-red-200 shadow-sm active:scale-95"><Ban className="h-4 w-4" /> Ban User</button>
                                                ) : (
                                                    <button type="button" className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl transition-colors border border-emerald-200 shadow-sm active:scale-95"><CheckCircle2 className="h-4 w-4" /> Reactivate User</button>
                                                )}
                                                {canEdit && <button type="button" onClick={() => setIsDeleteDialogOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-2.5 rounded-xl transition-colors border border-slate-200 hover:border-red-200 shadow-sm active:scale-95"><Trash2 className="h-4 w-4" /> Delete Account</button>}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </motion.div>

                        {/* Right Panel: Analytics */}
                        <motion.div layout className={`w-full md:w-3/5 p-6 md:p-8 bg-[#FDFBF7] ${isEditing ? 'hidden md:block' : 'block'}`}>
                            <h3 className="text-lg font-bold font-serif text-foreground mb-6 flex items-center gap-2"><Activity className="h-5 w-5 text-[#2A5244]" /> Engagement Profile</h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-white p-4 rounded-xl border border-border/40 shadow-sm"><p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Visits</p><p className="text-2xl font-black text-[#2A5244]">{userData.totalVisits || 0}</p></div>
                                <div className="bg-white p-4 rounded-xl border border-border/40 shadow-sm"><p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Last Seen</p><p className="text-sm md:text-base font-bold text-foreground mt-1.5">{userData.lastSeen || "N/A"}</p></div>
                                <div className="col-span-2 bg-white p-4 rounded-xl border border-border/40 shadow-sm"><p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Most Viewed Package</p><p className="text-sm md:text-base font-bold text-foreground flex items-center gap-2 mt-1"><Compass className="h-4 w-4 text-[#FA6D16] shrink-0" /> <span className="truncate">{userData.mostViewed || "None"}</span></p></div>
                                <div className="col-span-2 bg-white p-4 rounded-xl border border-border/40 shadow-sm"><p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Highest Interest Vibe</p><p className="text-sm md:text-base font-bold text-foreground flex items-center gap-2 mt-1"><TrendingUp className="h-4 w-4 text-[#2A5244] shrink-0" /> {userData.topVibe || "None"}</p></div>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}