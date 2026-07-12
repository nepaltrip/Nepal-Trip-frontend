import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; // ✨ Consumes global state from Layout
import api from "../../api/axios";
import {
    Users,
    MessageSquare,
    Clock,
    TrendingUp,
    Eye,
    MousePointerClick,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
    Smartphone,
    Monitor,
    MapPin,
    X,
    CheckCircle2,
    Activity,
    Compass,
    Ban,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserDetailModal } from "../../components/modal/UserDetailModal";

// --- DUMMY DATA FOR VIBE INTENT & PACKAGES (Will be made live in the next step) ---
const discoverStats = [
    { vibe: "High Altitude Trekking", clicks: 840, galleryConversions: 320, avgTime: "4m 12s", bounceRate: "22%" },
    { vibe: "Culture & City", clicks: 610, galleryConversions: 150, avgTime: "2m 45s", bounceRate: "35%" },
    { vibe: "Wildlife & Jungle", clicks: 430, galleryConversions: 95, avgTime: "3m 10s", bounceRate: "28%" },
    { vibe: "Honeymoon", clicks: 290, galleryConversions: 110, avgTime: "5m 30s", bounceRate: "15%" },
];

const packageEngagement = [
    {
        id: "pkg-1",
        name: "Everest Base Camp Trek",
        totalClicks: 1245,
        authUsers: [
            { id: "u1", name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 98765 43210", photo: "R", status: "active", location: "Sultanpur, India", totalVisits: 14, lastSeen: "2 hours ago", mostViewed: "Everest Base Camp Trek", topVibe: "High Altitude Trekking", leadScore: "Hot" },
            { id: "u2", name: "Priya Patel", email: "priya99@example.com", phone: "+91 87654 32109", photo: "P", status: "active", location: null, totalVisits: 5, lastSeen: "1 day ago", mostViewed: "Everest Base Camp Trek", topVibe: "High Altitude Trekking", leadScore: "Warm" },
        ],
        anonUsers: [
            { id: "a1", device: "Mobile", browser: "Safari", location: "Mumbai, India", time: "10 mins ago" },
            { id: "a2", device: "Desktop", browser: "Chrome", location: "London, UK", time: "45 mins ago" },
        ],
        anonTotal: 890
    },
    {
        id: "pkg-2",
        name: "Kathmandu Heritage Tour",
        totalClicks: 856,
        authUsers: [
            { id: "u3", name: "Amit Kumar", email: "amit.k@example.com", phone: "+91 76543 21098", photo: "A", status: "banned", location: "New Delhi, India", totalVisits: 42, lastSeen: "3 days ago", mostViewed: "Kathmandu Heritage Tour", topVibe: "Culture & City", leadScore: "Spam" },
        ],
        anonUsers: [
            { id: "a4", device: "Desktop", browser: "Edge", location: "New York, USA", time: "5 mins ago" },
        ],
        anonTotal: 700
    }
];

export default function SuperAdminAnalytics() {
    // ✨ CONSUME GLOBAL STATE FROM LAYOUT
    const { metrics, socketInstance } = useOutletContext();

    const [expandedRow, setExpandedRow] = useState(null);
    const [rowTab, setRowTab] = useState("auth");

    // Modal States
    const [activeModal, setActiveModal] = useState(null); // 'inquiries', 'pending', 'media', 'discoverDetails', 'user360'
    const [modalData, setModalData] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

    // ✨ REAL-TIME LIVE GALLERY STATE
    const [liveTopMedia, setLiveTopMedia] = useState([]);

    // Fetch the real top 50 media assets from your database on mount
    useEffect(() => {
        const fetchTopGallery = async () => {
            try {
                const { data } = await api.get('/gallery/trending');
                if (data.success) {
                    setLiveTopMedia(data.data);
                }
            } catch (error) {
                console.error("Failed to load top gallery items", error);
            }
        };
        fetchTopGallery();
    }, []);

    // Listen for real-time gallery clicks and dynamically re-sort the UI!
    useEffect(() => {
        if (socketInstance) {
            const handleGalleryUpdate = (payload) => {
                setLiveTopMedia(prev => {
                    const updated = prev.map(m =>
                        m._id === payload.mediaId
                            ? { ...m, allTimeViews: payload.allTimeViews, trendingViews: payload.trendingViews }
                            : m
                    );
                    // ✨ Re-sort explicitly by TRENDING views (last 7 days)
                    return updated.sort((a, b) => b.trendingViews - a.trendingViews);
                });
            };

            socketInstance.on('gallery_view_update', handleGalleryUpdate);
            return () => socketInstance.off('gallery_view_update', handleGalleryUpdate);
        }
    }, [socketInstance]);

    // ✨ DYNAMIC KPI DATA LINKED TO LAYOUT CONTEXT
    const dynamicKpiData = [
        {
            id: "visitors",
            title: "Unique Visitors (30d)",
            value: (metrics?.uniqueVisitors || 0).toLocaleString(),
            trend: "Live Stream",
            icon: Users,
            color: "text-[#2A5244]",
            bg: "bg-[#2A5244]/10",
            clickable: false
        },
        {
            id: "inquiries",
            title: "Total Inquiries",
            value: (metrics?.totalInquiries || 0).toLocaleString(),
            trend: "All Time",
            icon: MessageSquare,
            color: "text-[#2A5244]",
            bg: "bg-[#2A5244]/10",
            clickable: true
        },
        {
            id: "pending",
            title: "Pending Replies",
            value: (metrics?.pendingReplies || 0).toLocaleString(),
            trend: (metrics?.pendingReplies || 0) > 0 ? "Action Required" : "All Caught Up",
            icon: Clock,
            color: (metrics?.pendingReplies || 0) > 0 ? "text-[#FA6D16]" : "text-emerald-600",
            bg: (metrics?.pendingReplies || 0) > 0 ? "bg-[#FA6D16]/10" : "bg-emerald-100",
            clickable: true
        },
    ];

    // Lock body scroll when any modal or full-screen viewer is active
    useEffect(() => {
        if (activeModal !== null || selectedMedia !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [activeModal, selectedMedia]);

    const toggleRow = (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
        } else {
            setExpandedRow(id);
            setRowTab("auth");
        }
    };

    const openModal = (type, data = null) => {
        setActiveModal(type);
        setModalData(data);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
    };

    // Grab just the top 3 for the preview cards on the main dashboard
    const top3Media = liveTopMedia.slice(0, 3);

    const renderExpandedContent = (pkg) => (
        <div className="p-4 md:p-6">
            <div className="flex gap-2 border-b border-border/40 pb-3 mb-4">
                <button
                    onClick={() => setRowTab("auth")}
                    className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-bold rounded-full transition-all ${rowTab === 'auth' ? 'bg-[#2A5244] text-white' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}
                >
                    Auth Leads ({pkg.authUsers.length})
                </button>
                <button
                    onClick={() => setRowTab("anon")}
                    className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-bold rounded-full transition-all ${rowTab === 'anon' ? 'bg-slate-700 text-white' : 'bg-transparent text-muted-foreground hover:bg-muted'}`}
                >
                    Anonymous ({pkg.anonTotal})
                </button>
            </div>

            {rowTab === 'auth' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.authUsers.length > 0 ? pkg.authUsers.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => openModal('user360', user)}
                            className="flex items-center justify-between p-4 bg-white border border-border/40 rounded-xl hover:border-[#2A5244]/50 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-white ${user.status === 'banned' ? 'bg-red-500' : 'bg-[#2A5244]'}`}>
                                    {user.photo}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-foreground truncate group-hover:text-[#2A5244] transition-colors flex items-center gap-1.5">
                                        {user.name}
                                        {user.status === 'banned' && <Ban className="h-3 w-3 text-red-500 shrink-0" />}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.leadScore === 'Hot' ? 'bg-[#FA6D16]/10 text-[#FA6D16]' :
                                    user.leadScore === 'Spam' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {user.leadScore}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-sm italic p-4 md:p-6 border border-dashed border-border/60 rounded-xl text-center bg-white md:col-span-2">
                            No authenticated leads have viewed this package yet.
                        </p>
                    )}
                </div>
            )}

            {rowTab === 'anon' && (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pkg.anonUsers.map((anon) => (
                            <div key={anon.id} className="flex items-start gap-3 p-3 bg-white border border-border/40 rounded-lg">
                                <div className="mt-0.5 text-slate-400">
                                    {anon.device === 'Mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">{anon.device} • {anon.browser}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" /> {anon.location}
                                    </p>
                                    <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" /> {anon.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 pb-12 font-sans bg-[#FDFBF7] min-h-full">

            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">Business Intelligence</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Monitor traffic, visual engagement, and top-of-funnel leads.</p>
            </div>

            {/* KPI Cards (Mapped to layout context state) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {dynamicKpiData.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div
                            key={idx}
                            onClick={() => kpi.clickable && openModal(kpi.id)}
                            className={`flex items-center p-6 bg-white border border-border/40 rounded-2xl shadow-sm transition-all duration-300 ${kpi.clickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-[#2A5244]/30' : ''}`}
                        >
                            <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                                <Icon className={`h-7 w-7 ${kpi.color}`} />
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-3xl font-black text-foreground">{kpi.value}</h3>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.trend.includes('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {kpi.trend}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">

                {/* Discover Intent Tracking (Left Col) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-border/40 rounded-2xl shadow-sm p-6">
                        <div className="flex items-start justify-between mb-6 border-b border-border/40 pb-4">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-foreground">Vibe Intent</h2>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                                    Records obtained: Jul 1, 2026 - Jul 7, 2026
                                </p>
                            </div>
                            <TrendingUp className="h-5 w-5 text-[#2A5244] shrink-0" />
                        </div>

                        <div className="space-y-5">
                            {discoverStats.map((stat, idx) => {
                                const maxClicks = Math.max(...discoverStats.map(s => s.clicks));
                                const clickPercent = (stat.clicks / maxClicks) * 100;
                                const conversionRate = Math.round((stat.galleryConversions / stat.clicks) * 100);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => openModal('discoverDetails', stat)}
                                        className="group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold text-foreground group-hover:text-[#2A5244] transition-colors">{stat.vibe}</span>
                                            <span className="text-muted-foreground font-medium text-xs">{stat.clicks} views</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
                                            <div
                                                className="h-full bg-[#2A5244] rounded-full transition-all duration-1000 ease-out group-hover:bg-[#FA6D16]"
                                                style={{ width: `${clickPercent}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-[10px] md:text-xs font-semibold text-muted-foreground">
                                            <div className="flex items-center gap-1.5 text-[#FA6D16]">
                                                <MousePointerClick className="h-3.5 w-3.5" />
                                                <span>{stat.galleryConversions} Gallery Clicks</span>
                                            </div>
                                            <span className="bg-[#2A5244]/10 text-[#2A5244] px-2 py-0.5 rounded-full">{conversionRate}% Conversion</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ✨ LIVE TOP PERFORMING MEDIA PREVIEW CARDS (Middle/Right Col) */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-border/40 rounded-2xl shadow-sm p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-4">
                            <h2 className="text-xl font-bold font-serif text-foreground">Top Performing Media</h2>
                            <ImageIcon className="h-5 w-5 text-[#2A5244]" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">Visuals that are driving the most engagement and clicks on your site right now.</p>

                        {top3Media.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-8 bg-muted/20">
                                <ImageIcon className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground font-medium">No media tracked yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                {top3Media.map((img) => (
                                    <div
                                        key={img._id}
                                        onClick={() => setSelectedMedia(img)}
                                        className="group relative rounded-xl overflow-hidden shadow-sm aspect-video cursor-pointer bg-black"
                                    >
                                        <img
                                            src={img.fileType === 'video' ? (img.thumbnailUrl || '/video-placeholder.png') : img.mediaUrl}
                                            alt={img.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        />

                                        {/* Location Badge (Bottom Left) */}
                                        <div className="absolute bottom-3 left-3 flex items-center bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10 shadow-lg">
                                            <MapPin size={12} className="text-[#FA6D16] mr-1.5" />
                                            <span className="text-white text-[10px] font-bold uppercase tracking-widest">{img.locationTag}</span>
                                        </div>

                                        {/* Views Badge (Top Right) */}
                                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10 shadow-lg">
                                            <span className="flex items-center gap-1 text-[#FA6D16] text-[10px] font-bold">
                                                <TrendingUp size={12} /> {img.trendingViews}
                                            </span>
                                            <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold border-l border-white/20 pl-2">
                                                <Eye size={12} /> {img.allTimeViews}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-auto text-center border-t border-border/40 pt-4">
                            <button
                                onClick={() => openModal('media')}
                                className="inline-flex items-center gap-2 text-sm font-bold text-[#2A5244] hover:text-[#FA6D16] transition-colors"
                            >
                                View Top 50 Media Assets <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Engagement Tracking */}
            <div className="mt-8">
                <div className="mb-4">
                    <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                        <Compass className="h-6 w-6 text-[#2A5244]" /> Package Traffic & Leads
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Track which packages are capturing user interest.</p>
                </div>

                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block bg-white border border-border/40 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-[#FDFBF7] border-b border-border/40">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">Package Name</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">Total Clicks</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">Traffic Split</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">Insights</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {packageEngagement.map((pkg) => (
                                <React.Fragment key={pkg.id}>
                                    <tr className={`hover:bg-[#FDFBF7] transition-colors ${expandedRow === pkg.id ? 'bg-[#FDFBF7]' : ''}`}>
                                        <td className="px-6 py-5 font-bold text-foreground whitespace-nowrap">
                                            {pkg.name}
                                        </td>
                                        <td className="px-6 py-5 text-center font-black text-lg text-[#2A5244]">
                                            {pkg.totalClicks}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2A5244]/10 text-[#2A5244] font-bold text-xs border border-[#2A5244]/20">
                                                    {pkg.authUsers.length} Auth Leads
                                                </span>
                                                <span className="text-muted-foreground text-xs font-bold">+</span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                                                    {pkg.anonTotal} Anon
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => toggleRow(pkg.id)}
                                                className="inline-flex items-center justify-center p-2 rounded-full hover:bg-muted text-[#2A5244] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2A5244]/50"
                                            >
                                                {expandedRow === pkg.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                            </button>
                                        </td>
                                    </tr>
                                    <AnimatePresence>
                                        {expandedRow === pkg.id && (
                                            <motion.tr
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                                className="bg-muted/10 border-b border-border/40"
                                            >
                                                <td colSpan="4" className="p-0">
                                                    {renderExpandedContent(pkg)}
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="md:hidden flex flex-col gap-4">
                    {packageEngagement.map((pkg) => (
                        <div key={pkg.id} className="bg-white border border-border/40 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div
                                onClick={() => toggleRow(pkg.id)}
                                className="p-4 flex flex-col gap-3 active:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-foreground leading-tight pr-2">{pkg.name}</h3>
                                    <div className="text-[#2A5244] shrink-0">
                                        {expandedRow === pkg.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] md:text-xs font-semibold text-[#2A5244] bg-[#2A5244]/10 px-2 py-0.5 rounded-md">
                                            {pkg.authUsers.length} Auth
                                        </span>
                                        <span className="text-[10px] md:text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {pkg.anonTotal} Anon
                                        </span>
                                    </div>
                                    <div className="flex items-center shrink-0">
                                        <span className="text-xs font-black text-[#2A5244] flex items-center gap-1">
                                            <MousePointerClick className="h-3.5 w-3.5" /> {pkg.totalClicks}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedRow === pkg.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className="bg-muted/10 border-t border-border/40"
                                    >
                                        {renderExpandedContent(pkg)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================= */}
            {/* GLOBAL OVERLAY & MODALS */}
            {/* ========================================= */}
            <AnimatePresence>
                {activeModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        <UserDetailModal
                            isOpen={activeModal === 'user360'}
                            onClose={closeModal}
                            userData={modalData}
                        />

                        {/* LIST MODALS (Inquiries / Pending) */}
                        {(activeModal === 'inquiries' || activeModal === 'pending') && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl z-50 border border-border/40 overflow-hidden"
                            >
                                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-[#FDFBF7]">
                                    <h2 className="text-xl font-bold font-serif flex items-center gap-2 text-foreground">
                                        {activeModal === 'inquiries' ? <MessageSquare className="h-5 w-5 text-[#2A5244]" /> : <Clock className="h-5 w-5 text-[#FA6D16]" />}
                                        {activeModal === 'inquiries' ? 'All Inquiries' : 'Pending Replies'}
                                    </h2>
                                    <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="overflow-y-auto flex-1 p-4">
                                    <ul className="space-y-3">
                                        {(metrics?.recentInquiries || []).filter(i => activeModal === 'inquiries' || i.status === 'pending').map(inq => (
                                            <li key={inq.id || inq._id} className="p-4 border border-border/60 rounded-xl hover:bg-muted/30 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-foreground">{inq.name || "Unknown"}</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground">{inq.date || "Recent"}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{inq.subject || "No subject"}</p>
                                                <div className="mt-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inq.status === 'pending' ? 'bg-[#FA6D16]/10 text-[#FA6D16]' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {inq.status?.toUpperCase() || 'UNKNOWN'}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                        {(metrics?.recentInquiries || []).filter(i => activeModal === 'inquiries' || i.status === 'pending').length === 0 && (
                                            <li className="text-center p-4 text-muted-foreground text-sm italic">No inquiries found.</li>
                                        )}
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {/* DISCOVER DETAILS MODAL */}
                        {activeModal === 'discoverDetails' && modalData && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-sm bg-white rounded-3xl shadow-2xl z-50 border border-border/40 overflow-hidden"
                            >
                                <div className="p-6 border-b border-border/40 bg-[#FDFBF7] flex justify-between items-center">
                                    <h2 className="text-lg font-bold font-serif text-foreground truncate pr-4">{modalData.vibe}</h2>
                                    <button onClick={closeModal} className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                        <span className="text-sm font-semibold text-muted-foreground">Total Views</span>
                                        <span className="text-base font-black text-foreground">{modalData.clicks}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-[#FA6D16]/5 rounded-lg border border-[#FA6D16]/10">
                                        <span className="text-sm font-semibold text-[#FA6D16]">Gallery Conversions</span>
                                        <span className="text-base font-black text-[#FA6D16]">{modalData.galleryConversions}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                        <span className="text-sm font-semibold text-muted-foreground">Avg. Time on Page</span>
                                        <span className="text-base font-black text-foreground">{modalData.avgTime}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                        <span className="text-sm font-semibold text-muted-foreground">Bounce Rate</span>
                                        <span className="text-base font-black text-foreground">{modalData.bounceRate}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ✨ LIVE TOP 50 GRID MODAL */}
                        {activeModal === 'media' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-[90%] max-w-5xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl z-50 border border-border/40 overflow-hidden"
                            >
                                <div className="p-6 border-b border-border/40 flex items-center justify-between bg-[#FDFBF7]">
                                    <div>
                                        <h2 className="text-xl font-bold font-serif flex items-center gap-2 text-foreground">
                                            <ImageIcon className="h-5 w-5 text-[#2A5244]" /> Top 50 Media Assets
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">Live real-time engagement data</p>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="overflow-y-auto p-4 md:p-6 bg-muted/10">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {liveTopMedia.map((media, index) => (
                                            <div
                                                key={media._id}
                                                onClick={() => setSelectedMedia(media)}
                                                className="group relative rounded-xl overflow-hidden shadow-sm aspect-square border border-border/40 bg-black cursor-pointer hover:shadow-xl transition-all"
                                            >
                                                <img
                                                    src={media.fileType === 'video' ? (media.thumbnailUrl || '/video-placeholder.png') : media.mediaUrl}
                                                    alt={media.title}
                                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                                                    loading="lazy"
                                                />

                                                {/* Rank Badge */}
                                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-md border border-white/10 shadow-md">
                                                    #{index + 1}
                                                </div>

                                                {/* 7-Day Trending Views (Top Right) */}
                                                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#FA6D16]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">
                                                    <TrendingUp size={12} /> {media.trendingViews}
                                                </div>

                                                {/* Location (Bottom Left) */}
                                                <div className="absolute bottom-2 left-2 right-2 flex items-center bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-white/10 shadow-lg">
                                                    <MapPin size={12} className="text-[#FA6D16] shrink-0 mr-1.5" />
                                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest truncate">{media.locationTag}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>

            {/* ========================================= */}
            {/* FULL SCREEN MEDIA LIGHTBOX                */}
            {/* ========================================= */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMedia(null)}
                        className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        {/* Cinematic Location Overlay (Bottom Left) */}
                        <div
                            className="absolute bottom-10 left-4 md:left-10 max-w-4xl z-110 pointer-events-auto flex flex-col gap-3"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-2 md:gap-4 drop-shadow-2xl">
                                <MapPin size={32} className="text-[#FA6D16] drop-shadow-lg shrink-0 md:w-10 md:h-10" />
                                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
                                    {selectedMedia.locationTag}
                                </h2>
                            </div>
                            <div className="flex items-center gap-4 mt-2 ml-1">
                                <span className="flex items-center gap-1.5 text-[#FA6D16] font-bold bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                    <TrendingUp size={16} /> {selectedMedia.trendingViews} Trending
                                </span>
                                <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                    <Eye size={16} /> {selectedMedia.allTimeViews} Total
                                </span>
                            </div>
                        </div>

                        {/* Close Button (Top Right) */}
                        <button
                            onClick={() => setSelectedMedia(null)}
                            className="absolute top-8 right-4 md:right-8 z-110 text-white hover:text-white/70 transition-colors p-3 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 backdrop-blur-md shadow-2xl"
                        >
                            <X size={24} />
                        </button>

                        {/* Media Container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedMedia.fileType === 'video' ? (
                                <video
                                    src={selectedMedia.mediaUrl}
                                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                    controls
                                    autoPlay
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={selectedMedia.mediaUrl}
                                    alt={selectedMedia.title}
                                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}