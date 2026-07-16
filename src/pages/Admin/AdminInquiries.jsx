import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import api from "../../api/axios";
import { Search, Mail, MailOpen, CheckCircle2, Send, MapPin, ArrowLeft, Clock, Ban, Trash2, Lock, Unlock, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserDetailModal } from "../../components/modal/UserDetailModal";

const listVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }, exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } } };
const fadeVariants = { hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } }, exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" } } };

export default function AdminInquiries() {
    const { socketInstance, refreshMetrics } = useOutletContext();
    const location = useLocation();

    const [inquiries, setInquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isStatusToggling, setIsStatusToggling] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const inquiryIdFromUrl = params.get('id');
        if (inquiryIdFromUrl && inquiries.length > 0) {
            setSelectedId(inquiryIdFromUrl);
            const inquiry = inquiries.find(i => i._id === inquiryIdFromUrl);
            if (inquiry && inquiry.status === 'unread') {
                setInquiries(prev => prev.map(inq => (inq._id === inquiryIdFromUrl ? { ...inq, status: "read" } : inq)));
                api.patch(`/inquiries/${inquiryIdFromUrl}/read`).catch(() => { });
            }
        }
    }, [location.search, inquiries.length]);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const { data } = await api.get("/inquiries");
                setInquiries(data);
            } catch (error) {
                console.error("Failed to fetch inquiries", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInquiries();
    }, []);

    useEffect(() => {
        if (!socketInstance) return;
        const handleNewInquiry = (newInquiry) => setInquiries((prev) => [newInquiry, ...prev]);
        const handleInquiryReplied = (updatedInquiry) => setInquiries((prev) => prev.map(inq => inq._id === updatedInquiry._id ? updatedInquiry : inq));
        const handleUserPresence = (payload) => {
            setInquiries((prev) => prev.map(inq => {
                if (inq.userId && inq.userId._id === payload.userId) {
                    return { ...inq, userId: { ...inq.userId, isOnline: payload.isOnline, lastSeenAt: payload.lastSeenAt } };
                }
                return inq;
            }));
        };

        socketInstance.on('new_inquiry_received', handleNewInquiry);
        socketInstance.on('inquiry_replied', handleInquiryReplied);
        socketInstance.on('user_presence_update', handleUserPresence);

        return () => {
            socketInstance.off('new_inquiry_received', handleNewInquiry);
            socketInstance.off('inquiry_replied', handleInquiryReplied);
            socketInstance.off('user_presence_update', handleUserPresence);
        };
    }, [socketInstance]);

    const selectedInquiry = inquiries.find(inq => inq._id === selectedId);

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(inq => {
            const matchesFilter = filter === "all" ? true : filter === "unread" ? inq.status === "unread" : filter === "replied" ? inq.status === "replied" : filter === "closed" ? inq.status === "closed" : true;
            const name = inq.formData?.name || inq.userId?.name || "";
            const email = inq.formData?.email || inq.userId?.email || "";
            const subject = inq.formData?.subject || inq.packageId?.name || "General Inquiry";
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || email.toLowerCase().includes(searchQuery.toLowerCase()) || subject.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [inquiries, filter, searchQuery]);

    const handleSelect = async (id) => {
        setSelectedId(id);
        setReplyText("");
        const inquiry = inquiries.find(inq => inq._id === id);
        if (inquiry && inquiry.status === "unread") {
            setInquiries(prev => prev.map(inq => (inq._id === id ? { ...inq, status: "read" } : inq)));
            try { await api.patch(`/inquiries/${id}/read`); } catch (e) { }
        }
    };

    const handleDeleteSingle = async (e, id) => {
        e.stopPropagation();
        setInquiries(prev => prev.filter(inq => inq._id !== id));
        if (selectedId === id) setSelectedId(null);
        try {
            await api.patch(`/inquiries/${id}/hide`);
            refreshMetrics();
        } catch (error) { console.error(error); }
    };

    const handleBulkDelete = async () => {
        setInquiries(prev => {
            const remaining = prev.filter(inq => {
                if (filter === "all") return false;
                if (filter === "unread") return inq.status !== "unread";
                if (filter === "replied") return inq.status !== "replied";
                if (filter === "closed") return inq.status !== "closed";
                return true;
            });
            if (selectedId && !remaining.find(inq => inq._id === selectedId)) setSelectedId(null);
            return remaining;
        });
        try {
            await api.patch('/inquiries/hide-bulk', { filterType: filter });
            refreshMetrics();
        } catch (error) { console.error(error); }
    };

    const handleToggleStatus = async (currentStatus) => {
        const newStatus = currentStatus === 'closed' ? 'read' : 'closed';
        setIsStatusToggling(true);
        try {
            setInquiries(prev => prev.map(inq => inq._id === selectedId ? { ...inq, status: newStatus } : inq));
            await api.patch(`/inquiries/${selectedId}/status`, { status: newStatus });
        } catch (error) {
            setInquiries(prev => prev.map(inq => inq._id === selectedId ? { ...inq, status: currentStatus } : inq));
        } finally {
            setIsStatusToggling(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setIsSending(true);
        try {
            await api.post(`/inquiries/${selectedId}/reply`, { replyMessage: replyText });
            // Let the socket listener handle the full updated document (including the new reply in the replies array)
            // But clear the text box immediately.
            setReplyText("");
        } catch (error) {
            console.error("Reply failed", error);
        } finally {
            setIsSending(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Recently";
        return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(dateString));
    };

    // ✨ ADDED 'replies' to getDisplayData
    const getDisplayData = (inq) => ({
        name: inq.formData?.name || inq.userId?.name || "Guest Traveler",
        email: inq.formData?.email || inq.userId?.email || "No email provided",
        subject: inq.formData?.subject || inq.packageId?.name || "Trip Inquiry",
        message: inq.formData?.message || "No message provided.",
        photo: (inq.userId?.name || inq.formData?.name || "G").charAt(0).toUpperCase(),
        profilePic: inq.userId?.profilePic || null,
        isOnline: inq.userId?.isOnline || false,
        lastSeenAt: inq.userId?.lastSeenAt,
        status: inq.status,
        isBanned: inq.userId?.status === 'banned',
        replies: inq.replies || []
    });

    if (isLoading) return <div className="h-full flex items-center justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A5244]"></div></div>;

    return (
        <div className="h-dvh md:h-[calc(100vh-8rem)] min-h-150 flex flex-col md:flex-row bg-white md:border md:border-border/40 md:rounded-2xl shadow-sm overflow-hidden font-sans relative">
            <div className={`flex flex-col w-full md:w-1/3 bg-[#FDFBF7] md:border-r border-border/40 transition-all z-10 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 md:p-6 border-b border-border/40 space-y-4 shrink-0 bg-[#FDFBF7] z-20">
                    <h2 className="text-2xl font-bold font-serif text-foreground">Inquiries</h2>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#2A5244]" />
                        <input type="text" placeholder="Search inquiries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30 focus:border-[#2A5244] shadow-sm transition-all" />
                    </div>
                    <div className="flex items-center justify-between gap-2 w-full overflow-x-auto custom-scrollbar pb-1">
                        <div className="flex gap-1 md:gap-2 flex-1 shrink-0">
                            {["all", "unread", "replied", "closed"].map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`shrink-0 px-3 py-1.5 md:px-4 text-[10px] md:text-xs font-bold rounded-full capitalize transition-all ${filter === f ? "bg-[#2A5244] text-white shadow-md shadow-[#2A5244]/20 scale-[1.02]" : "bg-white border border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95"}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        <AnimatePresence>
                            {filteredInquiries.length > 0 && (
                                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={handleBulkDelete} className="shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border border-red-100">
                                    <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Clear</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#FDFBF7]">
                    {filteredInquiries.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-muted-foreground">
                            <MailOpen className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No inquiries found.</p>
                        </motion.div>
                    ) : (
                        <motion.ul variants={listVariants} initial="hidden" animate="show" className="divide-y divide-border/20">
                            <AnimatePresence mode="popLayout">
                                {filteredInquiries.map((inq) => {
                                    const display = getDisplayData(inq);
                                    return (
                                        <motion.li key={inq._id} variants={itemVariants} layout className="relative group">
                                            <div onClick={() => handleSelect(inq._id)} className={`w-full text-left p-4 md:px-6 transition-all hover:bg-muted/40 cursor-pointer ${selectedId === inq._id ? "bg-white shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]" : ""}`}>
                                                {selectedId === inq._id && <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[#2A5244]" />}
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <div className={`relative h-7 w-7 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 overflow-hidden ${display.isBanned ? 'bg-red-500' : display.status === 'closed' ? 'bg-slate-400' : 'bg-[#2A5244]'}`}>
                                                        {display.profilePic ? <img src={display.profilePic} alt={display.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : display.photo}
                                                        {display.isOnline && <span className="absolute -bottom-0.5 -right-0.5 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#FDFBF7] z-10" />}
                                                    </div>
                                                    <span className={`text-sm font-bold truncate pr-2 flex-1 ml-2 ${display.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>{display.name}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap mt-0.5 group-hover:hidden md:group-hover:block transition-all">{formatDate(inq.createdAt)}</span>
                                                        <button onClick={(e) => handleDeleteSingle(e, inq._id)} className="p-1 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 -mr-1">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs font-semibold text-foreground mb-1 truncate pr-6">{display.subject}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{display.message}</p>
                                                <div className="mt-3 flex items-center gap-1.5">
                                                    {display.status === 'unread' && <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#FA6D16] bg-[#FA6D16]/10 px-2.5 py-0.5 rounded-full border border-[#FA6D16]/20"><Mail className="h-3 w-3" /> New</span>}
                                                    {display.status === 'replied' && <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Replied</span>}
                                                    {display.status === 'read' && <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200"><MailOpen className="h-3 w-3" /> Read</span>}
                                                    {display.status === 'closed' && <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300"><Lock className="h-3 w-3" /> Closed</span>}
                                                </div>
                                            </div>
                                        </motion.li>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.ul>
                    )}
                </div>
            </div>

            <div className={`flex flex-col w-full md:w-2/3 bg-white h-full relative ${!selectedId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                <AnimatePresence mode="wait">
                    {!selectedInquiry ? (
                        <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-muted-foreground">
                            <div className="bg-[#FDFBF7] border border-border/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Mail className="h-8 w-8 text-[#2A5244]/40" /></div>
                            <p className="font-bold text-foreground font-serif text-lg">No Inquiry Selected</p>
                            <p className="text-sm mt-1 max-w-50 mx-auto leading-relaxed">Select an inquiry from the list to read and manage.</p>
                        </motion.div>
                    ) : (
                        <motion.div key={selectedInquiry._id} variants={fadeVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col h-full w-full absolute inset-0">
                            {(() => {
                                const activeDisplay = getDisplayData(selectedInquiry);
                                return (
                                    <>
                                        <div className="p-3 md:p-6 border-b border-border/40 bg-white shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setSelectedId(null)} className="md:hidden mt-0.5 p-1.5 -ml-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
                                                    <h2 className="text-lg md:text-2xl font-bold font-serif text-foreground leading-tight line-clamp-2">{activeDisplay.subject}</h2>
                                                </div>
                                                <button onClick={() => handleToggleStatus(activeDisplay.status)} disabled={isStatusToggling} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 ${activeDisplay.status === 'closed' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'}`}>
                                                    {activeDisplay.status === 'closed' ? <><Unlock className="h-3.5 w-3.5" /> Reopen</> : <><Lock className="h-3.5 w-3.5" /> Close Ticket</>}
                                                </button>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FDFBF7] p-3 md:p-4 rounded-xl border border-border/40 shadow-sm transition-colors hover:border-[#2A5244]/30">
                                                <div className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0" onClick={() => { if (selectedInquiry.userId) setSelectedUser(selectedInquiry.userId) }}>
                                                    <div className={`relative h-9 w-9 md:h-10 md:w-10 rounded-full text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0 overflow-hidden ${activeDisplay.isBanned ? 'bg-red-500' : activeDisplay.status === 'closed' ? 'bg-slate-400' : 'bg-[#2A5244]'}`}>
                                                        {activeDisplay.profilePic ? <img src={activeDisplay.profilePic} alt={activeDisplay.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : activeDisplay.photo}
                                                        {activeDisplay.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white z-10" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-foreground group-hover:text-[#2A5244] transition-colors flex items-center gap-1.5 truncate">
                                                            {activeDisplay.name}
                                                            {activeDisplay.isBanned && <Ban className="h-3 w-3 text-red-500 shrink-0" />}
                                                        </p>
                                                        <div className="flex flex-col">
                                                            <p className="text-xs text-muted-foreground font-medium truncate">{activeDisplay.email}</p>
                                                            {!activeDisplay.isOnline && activeDisplay.lastSeenAt && <p className="text-[10px] text-muted-foreground/70 italic mt-0.5 truncate">Last seen: {formatDate(activeDisplay.lastSeenAt)}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0 mt-1 sm:mt-0">
                                                    <span className="text-[10px] md:text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatDate(selectedInquiry.createdAt)}</span>
                                                    {selectedInquiry.source && <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[#2A5244] bg-[#2A5244]/10 px-2 py-1 rounded-md flex items-center gap-1 border border-[#2A5244]/20 whitespace-nowrap"><MapPin className="h-3 w-3 shrink-0" /> <span className="truncate max-w-30 md:max-w-none">{selectedInquiry.source}</span></span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-white/50 custom-scrollbar">
                                            {/* Beautiful Message Bubble (User's Inquiry) */}
                                            <div className="flex gap-3 mb-4">
                                                <AlignLeft className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                                                <div className="bg-[#FDFBF7] border border-border/50 p-4 md:p-5 rounded-2xl rounded-tl-sm shadow-sm text-sm md:text-base text-foreground leading-relaxed whitespace-pre-wrap font-medium w-full">
                                                    {activeDisplay.message}
                                                </div>
                                            </div>

                                            {/* ✨ ADDED: Render Admin Replies History */}
                                            {activeDisplay.replies.length > 0 && (
                                                <div className="flex flex-col gap-4 mb-8 md:pl-12">
                                                    {activeDisplay.replies.map((reply, idx) => (
                                                        <div key={idx} className="flex flex-col items-end gap-1 w-full">
                                                            <span className="text-[10px] text-muted-foreground font-semibold pr-2">
                                                                {reply.repliedBy?.name || 'Admin'} replied on {formatDate(reply.repliedAt)}
                                                            </span>
                                                            <div className="bg-[#2A5244]/10 border border-[#2A5244]/20 p-4 md:p-5 rounded-2xl rounded-tr-sm shadow-sm text-sm md:text-base text-[#1b362c] leading-relaxed whitespace-pre-wrap font-medium w-[90%] md:w-[85%] self-end">
                                                                {reply.message}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {Object.keys(selectedInquiry.formData || {}).length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-xs font-bold mb-3 uppercase tracking-wider text-muted-foreground ml-1">Additional Details</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {Object.entries(selectedInquiry.formData).map(([key, value]) => {
                                                            if (['name', 'email', 'subject', 'message'].includes(key)) return null;
                                                            return (
                                                                <div key={key} className="bg-white p-3.5 rounded-xl border border-border/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-1.5 transition-shadow hover:shadow-md">
                                                                    <span className="text-[10px] uppercase font-black text-[#2A5244]/70 tracking-wide truncate">{key.replace(/_/g, ' ')}</span>
                                                                    <span className="text-sm font-semibold text-foreground truncate">{String(value)}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 md:p-6 border-t border-border/40 bg-[#FDFBF7] shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                                            {activeDisplay.status === "closed" ? (
                                                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-3 text-slate-500 shadow-inner">
                                                    <Lock className="h-5 w-5 shrink-0" />
                                                    <p className="text-sm font-bold">This inquiry has been closed. Reopen to send a reply.</p>
                                                </motion.div>
                                            ) : (
                                                <div className="flex flex-col gap-2 md:gap-3">
                                                    {activeDisplay.status === "replied" && (
                                                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold mb-1 border border-emerald-100">
                                                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                                                            You have replied to this inquiry. You can send follow-up emails below.
                                                        </div>
                                                    )}
                                                    <label htmlFor="reply" className="text-xs md:text-sm font-bold text-foreground flex items-center gap-2">
                                                        <Send className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#2A5244]" /> Draft Reply via Email
                                                    </label>
                                                    <textarea
                                                        id="reply"
                                                        placeholder="Type your response here to email the customer..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        className="w-full p-3 text-sm bg-white border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2A5244]/50 resize-none shadow-sm transition-shadow min-h-20 md:min-h-30"
                                                    />
                                                    <div className="flex justify-end mt-1 md:mt-0">
                                                        <button
                                                            onClick={handleSendReply}
                                                            disabled={!replyText.trim() || isSending}
                                                            className="relative overflow-hidden inline-flex items-center justify-center gap-2 bg-[#2A5244] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#214136] transition-all active:scale-95 disabled:opacity-70 disabled:hover:bg-[#2A5244] disabled:pointer-events-none min-w-35"
                                                        >
                                                            {isSending ? "Sending..." : <>Send Reply <Send className="h-4 w-4" /></>}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <UserDetailModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} userData={selectedUser} />
        </div>
    );
}