import React, { useState, useMemo } from "react";
import {
    Search,
    Mail,
    MailOpen,
    CheckCircle2,
    Send,
    MapPin,
    ArrowLeft,
    Clock,
    X,
    Activity,
    Compass,
    TrendingUp,
    Smartphone,
    Ban,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserDetailModal } from "../../components/Modal/UserDetailModal";

// ==========================================
// DUMMY DATA (Expanded with CRM Fields)
// ==========================================
const initialInquiries = [
    {
        id: "inq-1",
        name: "Rahul Sharma",
        email: "rahul.s@example.com",
        phone: "+91 98765 43210",
        subject: "Availability for Everest Base Camp",
        message: "Hi team, I am looking to book the Everest Base Camp trek for a group of 4 people in mid-October. Can you confirm if you have availability and if we can get a group discount? We are all physically fit and have done high-altitude treks before.",
        packageOfInterest: "Everest Base Camp Trek",
        date: "2026-07-06T10:30:00",
        status: "unread",
        photo: "R",
        crmStatus: "active",
        location: "Sultanpur, India",
        totalVisits: 14,
        lastSeen: "2 hours ago",
        mostViewed: "Everest Base Camp Trek",
        topVibe: "High Altitude Trekking",
        leadScore: "Hot"
    },
    {
        id: "inq-2",
        name: "Priya Patel",
        email: "priya.patel99@example.com",
        phone: "+91 87654 32109",
        subject: "Custom Honeymoon Package",
        message: "Hello, my fiancé and I are getting married next month and we want to visit Pokhara and Chitwan. We want a luxury experience (5-star hotels only). Can you create a custom 7-day itinerary for us?",
        packageOfInterest: "Pokhara Lakeside / Custom",
        date: "2026-07-05T14:45:00",
        status: "read",
        photo: "P",
        crmStatus: "active",
        location: "Mumbai, India",
        totalVisits: 5,
        lastSeen: "1 day ago",
        mostViewed: "Pokhara Lakeside",
        topVibe: "Honeymoon",
        leadScore: "Warm"
    },
    {
        id: "inq-3",
        name: "Amit Kumar",
        email: "amit.k@example.com",
        phone: "+91 76543 21098",
        subject: "Question about Kathmandu Heritage Tour",
        message: "Is the entry fee to the monuments included in the package price, or do we have to pay that separately upon arrival?",
        packageOfInterest: "Kathmandu Heritage Tour",
        date: "2026-07-04T09:15:00",
        status: "replied",
        photo: "A",
        crmStatus: "banned",
        location: "New Delhi, India",
        totalVisits: 42,
        lastSeen: "3 days ago",
        mostViewed: "Kathmandu Heritage Tour",
        topVibe: "Culture & City",
        leadScore: "Spam"
    }
];

// Framer Motion Variants
const listVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const fadeVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" } }
};

export default function InquiryDesk() {
    const [inquiries, setInquiries] = useState(initialInquiries);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const selectedInquiry = inquiries.find(inq => inq.id === selectedId);

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(inq => {
            const matchesFilter =
                filter === "all" ? true :
                    filter === "unread" ? inq.status === "unread" :
                        inq.status === "replied";

            const matchesSearch =
                inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inq.subject.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [inquiries, filter, searchQuery]);

    const handleSelect = (id) => {
        setSelectedId(id);
        setReplyText("");
        setInquiries(prev => prev.map(inq =>
            (inq.id === id && inq.status === "unread") ? { ...inq, status: "read" } : inq
        ));
    };

    // --- DELETION LOGIC ---
    const handleDeleteSingle = (e, id) => {
        e.stopPropagation();
        setInquiries(prev => prev.filter(inq => inq.id !== id));
        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    const handleBulkDelete = () => {
        setInquiries(prev => {
            const remaining = prev.filter(inq => {
                if (filter === "all") return false;
                if (filter === "unread") return inq.status !== "unread";
                if (filter === "replied") return inq.status !== "replied";
                return true;
            });

            if (selectedId && !remaining.find(inq => inq.id === selectedId)) {
                setSelectedId(null);
            }

            return remaining;
        });
    };
    // ----------------------

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        setIsSending(true);
        setTimeout(() => {
            setInquiries(prev => prev.map(inq =>
                inq.id === selectedId ? { ...inq, status: "replied" } : inq
            ));
            setIsSending(false);
            setReplyText("");
        }, 1500);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="h-dvh md:h-[calc(100vh-8rem)] min-h-150 flex flex-col md:flex-row bg-white md:border md:border-border/40 md:rounded-2xl shadow-sm overflow-hidden font-sans relative">

            {/* ==================== LEFT PANEL: INBOX LIST ==================== */}
            <div className={`flex flex-col w-full md:w-1/3 bg-[#FDFBF7] md:border-r border-border/40 transition-all z-10 ${selectedId ? 'hidden md:flex' : 'flex'}`}>

                {/* Header & Search */}
                <div className="p-4 md:p-6 border-b border-border/40 space-y-4 shrink-0 bg-[#FDFBF7] z-20">
                    <h2 className="text-2xl font-bold font-serif text-foreground">Inquiries</h2>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#2A5244]" />
                        <input
                            type="text"
                            placeholder="Search inquiries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30 focus:border-[#2A5244] shadow-sm transition-all"
                        />
                    </div>

                    {/* Filter Pills & Bulk Delete */}
                    <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex gap-1 md:gap-2 flex-1">
                            {["all", "unread", "replied"].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`flex-1 md:flex-none px-2 py-1.5 md:px-4 text-[10px] md:text-xs font-bold rounded-full capitalize transition-all ${filter === f
                                        ? "bg-[#2A5244] text-white shadow-md shadow-[#2A5244]/20 scale-[1.02] md:scale-105"
                                        : "bg-white border border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Bulk Delete Button */}
                        <AnimatePresence>
                            {filteredInquiries.length > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={handleBulkDelete}
                                    className="shrink-0 flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border border-red-100"
                                    title={`Delete all ${filter === 'all' ? '' : filter} inquiries`}
                                >
                                    <Trash2 className="h-3.5 w-3.5 md:h-3 md:w-3" /> <span className="hidden sm:inline">Clear</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* List Area */}
                <div className="flex-1 overflow-y-auto bg-[#FDFBF7]">
                    {filteredInquiries.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-muted-foreground">
                            <MailOpen className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No inquiries found.</p>
                        </motion.div>
                    ) : (
                        <motion.ul
                            variants={listVariants}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-border/20"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredInquiries.map((inq) => (
                                    <motion.li
                                        key={inq.id}
                                        variants={itemVariants}
                                        layout
                                        className="relative group"
                                    >
                                        <div
                                            onClick={() => handleSelect(inq.id)}
                                            className={`w-full text-left p-4 md:px-6 transition-all hover:bg-muted/40 cursor-pointer ${selectedId === inq.id ? "bg-white shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]" : ""}`}
                                        >
                                            {selectedId === inq.id && (
                                                <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-[#2A5244]" />
                                            )}

                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className={`text-sm font-bold truncate pr-2 ${inq.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {inq.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap mt-0.5 group-hover:hidden md:group-hover:block transition-all">
                                                        {formatDate(inq.date)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDeleteSingle(e, inq.id)}
                                                        className="p-1 rounded-md text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 -mr-1"
                                                        title="Delete Inquiry"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs font-semibold text-foreground mb-1 truncate pr-6">{inq.subject}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{inq.message}</p>

                                            <div className="mt-3 flex items-center">
                                                {inq.status === 'unread' && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#FA6D16] bg-[#FA6D16]/10 px-2.5 py-0.5 rounded-full border border-[#FA6D16]/20">
                                                        <Mail className="h-3 w-3" /> New
                                                    </span>
                                                )}
                                                {inq.status === 'replied' && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                                        <CheckCircle2 className="h-3 w-3" /> Replied
                                                    </span>
                                                )}
                                                {inq.status === 'read' && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                                                        <MailOpen className="h-3 w-3" /> Read
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </motion.ul>
                    )}
                </div>
            </div>

            {/* ==================== RIGHT PANEL: DETAIL VIEW ==================== */}
            <div className={`flex flex-col w-full md:w-2/3 bg-white h-full relative ${!selectedId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                <AnimatePresence mode="wait">
                    {!selectedInquiry ? (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center text-muted-foreground"
                        >
                            <div className="bg-[#FDFBF7] border border-border/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Mail className="h-8 w-8 text-[#2A5244]/40" />
                            </div>
                            <p className="font-bold text-foreground font-serif text-lg">No Inquiry Selected</p>
                            <p className="text-sm mt-1 max-w-50 mx-auto leading-relaxed">Select an inquiry from the list to read and reply.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={selectedInquiry.id}
                            variants={fadeVariants} initial="hidden" animate="show" exit="exit"
                            className="flex flex-col h-full w-full absolute inset-0"
                        >
                            <div className="p-3 md:p-6 border-b border-border/40 bg-white shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                <div className="flex items-start gap-2 mb-3">
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="md:hidden mt-0.5 p-1.5 -ml-1 rounded-full hover:bg-muted text-muted-foreground transition-colors active:scale-95"
                                    >
                                        <ArrowLeft className="h-5 w-5 text-foreground" />
                                    </button>
                                    <h2 className="text-lg md:text-2xl font-bold font-serif text-foreground leading-tight line-clamp-2">
                                        {selectedInquiry.subject}
                                    </h2>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FDFBF7] p-3 md:p-4 rounded-xl border border-border/40 shadow-sm transition-colors hover:border-[#2A5244]/30">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                                        onClick={() => setSelectedUser(selectedInquiry)}
                                    >
                                        <div className={`h-9 w-9 md:h-10 md:w-10 rounded-full text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0 ${selectedInquiry.crmStatus === 'banned' ? 'bg-red-500' : 'bg-[#2A5244]'}`}>
                                            {selectedInquiry.photo}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-foreground group-hover:text-[#2A5244] transition-colors flex items-center gap-1.5 truncate">
                                                {selectedInquiry.name}
                                                {selectedInquiry.crmStatus === 'banned' && <Ban className="h-3 w-3 text-red-500 shrink-0" />}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium truncate">{selectedInquiry.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0 mt-1 sm:mt-0">
                                        <span className="text-[10px] md:text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" /> {formatDate(selectedInquiry.date)}
                                        </span>
                                        {selectedInquiry.packageOfInterest && (
                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[#2A5244] bg-[#2A5244]/10 px-2 py-1 rounded-md flex items-center gap-1 border border-[#2A5244]/20 whitespace-nowrap">
                                                <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate max-w-30 md:max-w-none">{selectedInquiry.packageOfInterest}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-white/50 custom-scrollbar">
                                <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                                    {selectedInquiry.message}
                                </div>
                            </div>

                            <div className="p-3 md:p-6 border-t border-border/40 bg-[#FDFBF7] shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                                {selectedInquiry.status === "replied" ? (
                                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 shadow-sm">
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                                        <div>
                                            <p className="text-sm font-bold">Reply Sent Successfully</p>
                                            <p className="text-xs mt-0.5 opacity-80 font-medium">You have already responded to this inquiry.</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col gap-2 md:gap-3">
                                        <label htmlFor="reply" className="text-xs md:text-sm font-bold text-foreground flex items-center gap-2">
                                            <Send className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#2A5244]" /> Draft Reply via Email
                                        </label>
                                        <textarea
                                            id="reply"
                                            placeholder="Type your response here..."
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
                                                <AnimatePresence>
                                                    {isSending && (
                                                        <motion.div
                                                            className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                                            initial={{ x: '-150%' }}
                                                            animate={{ x: '150%' }}
                                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                        />
                                                    )}
                                                </AnimatePresence>

                                                <span className="relative z-10 flex items-center gap-2">
                                                    {isSending ? "Sending..." : <>Send Reply <Send className="h-4 w-4" /></>}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ========================================= */}
            {/* CRM "USER 360" MODAL */}
            {/* ========================================= */}
            <UserDetailModal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                userData={selectedUser}
            />
        </div>
    );
}