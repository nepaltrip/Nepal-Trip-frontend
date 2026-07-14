import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Megaphone, Send, Radio, AlertCircle, MapPin,
    UserSquare2, Type, Users, ShieldAlert, UserCheck,
    History, Clock, Target, Globe, Search, CheckCircle2, Filter
} from "lucide-react";
import { toast } from "react-toastify";
import { State, City } from "country-state-city";
import api from "../../api/axios";
import CustomSelect from "../../components/ui/CustomSelect";

export function SuperAdminBroadcast() {
    const { socketInstance } = useOutletContext();

    // --- STATE MANAGEMENT ---
    const [usersList, setUsersList] = useState([]);
    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [broadcastHistory, setBroadcastHistory] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStateCode, setSelectedStateCode] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        type: "system",
        audience: "users", // default: users
        specificUserId: "",
        state: "",
        district: ""
    });

    // --- DATA FETCHING ---
    const fetchDropdownData = useCallback(async () => {
        try {
            const { data } = await api.get('/superadmin/users-list');
            setUsersList(data.users || []);
            setStatesList(State.getStatesOfCountry("IN"));
        } catch (error) {
            console.error("Failed to load users:", error);
            toast.error("Failed to load user directory.");
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            setIsLoadingHistory(true);
            const { data } = await api.get('/superadmin/broadcast-history');
            if (data.success) {
                setBroadcastHistory(data.data);
            }
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        fetchDropdownData();
        fetchHistory();
    }, [fetchDropdownData, fetchHistory]);

    // --- SOCKET LISTENERS ---
    useEffect(() => {
        if (!socketInstance) return;

        const handlePresenceUpdate = (data) => {
            setUsersList(prevUsers => prevUsers.map(u =>
                u._id === data.userId ? { ...u, isOnline: data.isOnline } : u
            ));
        };

        const handleNewBroadcast = () => {
            fetchHistory();
        };

        socketInstance.on('user_presence_update', handlePresenceUpdate);
        socketInstance.on('trigger_broadcast', handleNewBroadcast);

        return () => {
            socketInstance.off('user_presence_update', handlePresenceUpdate);
            socketInstance.off('trigger_broadcast', handleNewBroadcast);
        };
    }, [socketInstance, fetchHistory]);

    // --- HANDLERS ---
    const liveUsersCount = usersList.filter(u => u.isOnline).length;

    const handleAudienceChange = (audienceValue) => {
        setFormData(prev => ({
            ...prev,
            audience: audienceValue,
            specificUserId: audienceValue === 'specific' ? prev.specificUserId : "",
            // Reset location if they switch to specific person, otherwise retain it
            state: audienceValue === 'specific' ? "" : prev.state,
            district: audienceValue === 'specific' ? "" : prev.district
        }));
        if (audienceValue === 'specific') setSelectedStateCode("");
    };

    const handleStateChange = (e) => {
        const value = e.target.value;
        setSelectedStateCode(value);
        if (value) {
            const stateObj = statesList.find(s => s.isoCode === value);
            setFormData(prev => ({ ...prev, state: stateObj.name, district: "" }));
            setDistrictsList(City.getCitiesOfState("IN", value));
        } else {
            setFormData(prev => ({ ...prev, state: "", district: "" }));
            setDistrictsList([]);
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            return toast.error("Title and message are required");
        }
        if (formData.audience === 'specific' && !formData.specificUserId) {
            return toast.error("Please select a specific person");
        }

        setIsSending(true);
        try {
            const { data } = await api.post("/superadmin/broadcast", formData);

            if (socketInstance) {
                socketInstance.emit("trigger_broadcast", {
                    ...formData,
                    timestamp: new Date()
                });
            }

            toast.success(`Broadcast deployed to ${data.recipientCount} target(s)!`);
            setFormData(prev => ({ ...prev, title: "", message: "" }));
            fetchHistory();
        } catch (error) {
            console.error("Broadcast failed:", error);
            toast.error(error.response?.data?.message || "Failed to send broadcast.");
        } finally {
            setIsSending(false);
        }
    };

    // --- HELPER FORMATTING ---
    const getTimeAgo = (dateString) => {
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    // ✨ UI UPDATE: Removed 'zone' as a standalone target option
    const targetOptions = [
        { id: "all", label: "All Accounts", icon: Globe },
        { id: "users", label: "Standard Users", icon: Users },
        { id: "admins", label: "Administrators", icon: ShieldAlert },
        { id: "specific", label: "Specific Person", icon: UserCheck }
    ];

    const typeOptions = [
        { label: "System Alert", value: "system" },
        { label: "Marketing / Promo", value: "marketing" },
        { label: "Urgent Warning", value: "urgent" }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-100 flex items-center justify-center border border-purple-200 shadow-sm">
                        <Megaphone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-serif text-foreground uppercase tracking-tight">
                            Targeted Broadcast
                        </h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            Deploy Instant Notifications & Emails
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-200 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    {liveUsersCount} Verified Users Online
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* --- MAIN CREATOR (LEFT) --- */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white rounded-[2rem] border border-border/40 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col"
                >
                    <div className="h-1 w-full bg-linear-to-r from-purple-300 via-purple-600 to-purple-300" />

                    <div className="p-6 md:p-8 space-y-8">
                        {/* STEP 1: TARGETING */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-purple-600 ml-1">
                                1. Select Audience
                            </label>
                            {/* ✨ UI UPDATE: Switched to grid-cols-2 md:grid-cols-4 since there are 4 options now */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {targetOptions.map((opt) => {
                                    const isSel = formData.audience === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleAudienceChange(opt.id)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 group min-h-20
                                                ${isSel ? "bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]"
                                                    : "bg-purple-50/50 text-muted-foreground border-border/50 hover:border-purple-300 hover:bg-purple-50"}`}
                                        >
                                            <opt.icon className={`w-5 h-5 shrink-0 ${isSel ? "text-white" : "group-hover:text-purple-600"}`} />
                                            <span className="font-bold text-[10px] uppercase tracking-wide text-center">{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ✨ UI UPDATE: Location Targeting is now an Optional Filter for mass-audiences */}
                            <AnimatePresence mode="popLayout">
                                {formData.audience !== 'specific' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-2"
                                    >
                                        <div className="bg-purple-50/40 rounded-xl border border-purple-100 p-4 space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-purple-500 flex items-center gap-1.5">
                                                <Filter className="w-3.5 h-3.5" /> Optional Location Filter
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <CustomSelect
                                                        name="stateCode"
                                                        value={selectedStateCode}
                                                        options={[{ label: "Pan India (All States)", value: "" }, ...statesList.map(s => ({ label: s.name, value: s.isoCode }))]}
                                                        onChange={handleStateChange}
                                                        theme="purple"
                                                    />
                                                </div>
                                                <div className={!selectedStateCode ? "opacity-50 pointer-events-none" : ""}>
                                                    <CustomSelect
                                                        name="district"
                                                        value={formData.district}
                                                        options={[{ label: "All Districts in State", value: "" }, ...districtsList.map(d => ({ label: d.name, value: d.name }))]}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                                        theme="purple"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* CONDITIONAL: Specific User */}
                            <AnimatePresence mode="popLayout">
                                {formData.audience === 'specific' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-2"
                                    >
                                        <div className="relative mb-2">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                            <input
                                                type="text"
                                                placeholder="Search user by name or email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 h-11 rounded-xl bg-muted/20 border border-border/50 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                            {usersList.filter(emp =>
                                                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                emp.email.toLowerCase().includes(searchQuery.toLowerCase())
                                            ).map((emp) => {
                                                const isSelected = formData.specificUserId === emp._id;
                                                return (
                                                    <div
                                                        key={emp._id}
                                                        onClick={() => setFormData(prev => ({ ...prev, specificUserId: emp._id }))}
                                                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors
                                                            ${isSelected ? "bg-purple-50 border-purple-300" : "bg-white border-border/40 hover:bg-muted/20"}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0
                                                                ${isSelected ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"}`}>
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`font-bold text-xs ${isSelected ? "text-purple-700" : "text-foreground"}`}>{emp.name}</span>
                                                                <span className="text-[10px] text-muted-foreground">{emp.email} • {emp.role}</span>
                                                            </div>
                                                        </div>
                                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* STEP 2: MESSAGE */}
                        <div className="space-y-4 pt-4 border-t border-border/40">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-purple-600 ml-1">
                                2. Compose Message
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        maxLength={50}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Broadcast Title (e.g., Scheduled Maintenance)"
                                        className="w-full h-12 rounded-xl border border-border/50 bg-muted/10 px-4 text-sm font-bold outline-none focus:border-purple-500 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        name="type"
                                        value={formData.type}
                                        options={typeOptions}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        theme="purple"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    rows={4}
                                    maxLength={200}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Write your announcement here..."
                                    className="w-full rounded-xl border border-border/50 bg-muted/10 p-4 text-sm font-medium outline-none focus:border-purple-500 focus:bg-white transition-all resize-none shadow-sm"
                                />
                                <div className="absolute bottom-3 right-4 text-xs text-muted-foreground font-bold">
                                    {formData.message.length} / 200
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-muted/10 border-t border-border/40">
                        <button
                            onClick={handleSendBroadcast}
                            disabled={isSending || !formData.title || !formData.message}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 h-14 px-8 text-sm font-black text-white uppercase tracking-widest transition-all hover:bg-purple-700 active:scale-[0.98] shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:pointer-events-none disabled:scale-100"
                        >
                            {isSending ? (
                                <>
                                    <Radio className="h-5 w-5 animate-pulse" /> Deploying...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" /> Launch Broadcast Now
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* --- SIDEBAR (RIGHT) --- */}
                <aside className="space-y-6 lg:sticky lg:top-6 w-full">

                    {/* LIVE PREVIEW */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2rem] border border-border/40 shadow-xl shadow-slate-200/40 p-6"
                    >
                        <h3 className="text-[10px] font-black text-purple-600 flex items-center gap-2 mb-4 uppercase tracking-[0.2em]">
                            <Radio className="h-3.5 w-3.5" /> Push Preview
                        </h3>

                        <div className={`relative p-4 rounded-xl border shadow-sm transition-colors duration-300 ${formData.type === 'urgent' ? 'bg-red-50/50 border-red-200' : formData.type === 'marketing' ? 'bg-orange-50/50 border-orange-200' : 'bg-purple-50/50 border-purple-200'}`}>
                            <span className={`absolute top-4 left-3 h-2 w-2 rounded-full ${formData.type === 'urgent' ? 'bg-red-500' : formData.type === 'marketing' ? 'bg-orange-500' : 'bg-purple-600'}`} />
                            <div className="pl-4 pr-1">
                                <h4 className="text-sm font-black text-foreground mb-1 line-clamp-1">
                                    {formData.title || "Notification Title"}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed wrap-break-word font-medium">
                                    {formData.message || "Your message will appear here. It looks best when kept under 100 words."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-2 bg-muted/20 p-3 rounded-lg border border-border/40">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground font-bold leading-relaxed uppercase tracking-wider">
                                Targets will receive this instantly inside the app, and via Web Push & Email if offline.
                            </p>
                        </div>
                    </motion.div>

                    {/* HISTORY MODULE */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2rem] border border-border/40 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-100"
                    >
                        <div className="p-5 border-b border-border/40 bg-muted/5 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-purple-600 flex items-center gap-2 uppercase tracking-[0.2em]">
                                <History className="h-3.5 w-3.5" /> Audit Log
                            </h3>
                            <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">Recent</span>
                        </div>

                        <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar bg-muted/10 h-full">
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-10 opacity-50">
                                    <Radio className="w-6 h-6 animate-spin text-purple-600" />
                                </div>
                            ) : broadcastHistory.length > 0 ? (
                                broadcastHistory.map((b) => (
                                    <div key={b._id} className="p-4 bg-white border border-border/50 rounded-2xl hover:border-purple-300 transition-all relative overflow-hidden group shadow-sm">
                                        <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${b.alertType === 'urgent' ? 'bg-red-500' : b.alertType === 'marketing' ? 'bg-orange-500' : 'bg-purple-600'}`} />

                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-xs text-foreground truncate pr-2">{b.title}</h4>
                                            <span className="text-[9px] font-black uppercase text-muted-foreground shrink-0 whitespace-nowrap bg-muted/50 px-1.5 py-0.5 rounded">{b.senderName.split(' ')[0]}</span>
                                        </div>

                                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed mb-3 line-clamp-2">"{b.message}"</p>

                                        <div className="flex items-center justify-between pt-3 border-t border-border/30">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black uppercase">{getTimeAgo(b.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                                <Target className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                                <span className="text-[9px] font-black text-purple-700">{b.recipientCount} reached</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                                    <History className="w-10 h-10 mb-3 text-muted-foreground" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No broadcast history yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </aside>

            </div>
        </div>
    );
}