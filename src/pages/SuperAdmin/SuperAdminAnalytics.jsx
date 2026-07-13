import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
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
    Activity,
    Compass,
    Ban,
    ArrowRight,
    Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserDetailModal } from "../../components/modal/UserDetailModal";

export default function SuperAdminAnalytics() {
    // ✨ CONSUME GLOBAL STATE FROM LAYOUT
    const { metrics, socketInstance } = useOutletContext();
    const { user } = useSelector((state) => state.auth);

    const [discoverStats, setDiscoverStats] = useState([]);

    // ✨ NEW: Dynamic Live State for Package Engagement (Cleaned of Anonymous schema data)
    const [packageEngagement, setPackageEngagement] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);

    // ✨ LIVE PRESENCE STATE
    const [livePresence, setLivePresence] = useState({}); // { [userId]: { isOnline, lastSeenAt } }

    // Modal States
    const [activeModal, setActiveModal] = useState(null); // 'inquiries', 'pending', 'media', 'discoverDetails', 'user360'
    const [modalData, setModalData] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

    // ✨ REAL-TIME LIVE GALLERY STATE
    const [liveTopMedia, setLiveTopMedia] = useState([]);

    // Fetch baseline data on mount
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

        const fetchVibeStats = async () => {
            try {
                const { data } = await api.get('/discover/track');
                if (data.success) setDiscoverStats(data.data);
            } catch (error) {
                console.error("Failed to load initial vibe stats", error);
            }
        };

        // ✨ NEW: Fetch baseline package tracking using new aggregation payload
        const fetchPackageAnalytics = async () => {
            try {
                const { data } = await api.get('/superadmin/package-analytics');
                const analyticsData = data.success ? data.data : data;
                if (Array.isArray(analyticsData)) {
                    const normalized = analyticsData.map(p => ({ ...p, id: p.packageId }));
                    setPackageEngagement(normalized.sort((a, b) => b.sevenDayTotalTime - a.sevenDayTotalTime));
                }
            } catch (error) {
                console.error("Failed to load baseline package analytics", error);
            }
        };

        fetchTopGallery();
        fetchVibeStats();
        fetchPackageAnalytics();

        // Expose the fetch function so the socket effect below can call it too
        window.__fetchPackageAnalytics = fetchPackageAnalytics;
    }, []);

    // ✨ REAL-TIME STREAMING SOCKET LISTENER
    useEffect(() => {
        if (socketInstance) {
            const handleGalleryUpdate = (payload) => {
                setLiveTopMedia(prev => {
                    const updated = prev.map(m =>
                        m._id === payload.mediaId
                            ? { ...m, allTimeViews: payload.allTimeViews, trendingViews: payload.trendingViews }
                            : m
                    );
                    return updated.sort((a, b) => b.trendingViews - a.trendingViews);
                });
            };

            const handleVibeUpdate = (payload) => {
                setDiscoverStats(payload);
            };

            // ✨ UPDATED: Listens to the redesigned aggregation payload shape in real-time
            // not the full stats object — so we just refetch the authoritative data.
            let refetchTimeout = null;
            const handlePackageUpdate = () => {
                // Debounce: multiple pings in quick succession (heartbeats every 5s)
                // should only trigger one refetch, not a flood of requests.
                if (refetchTimeout) clearTimeout(refetchTimeout);
                refetchTimeout = setTimeout(async () => {
                    try {
                        const { data } = await api.get('/superadmin/package-analytics');
                        const analyticsData = data.success ? data.data : data;
                        if (Array.isArray(analyticsData)) {
                            const normalized = analyticsData.map(p => ({ ...p, id: p.packageId }));
                            setPackageEngagement(normalized.sort((a, b) => b.sevenDayTotalTime - a.sevenDayTotalTime));
                        }
                    } catch (error) {
                        console.error("Failed to refresh package analytics after live ping", error);
                    }
                }, 800);
            };

            // ✨ NEW: Catch live presence updates
            const handlePresenceUpdate = ({ userId, isOnline, lastSeenAt }) => {
                setLivePresence(prev => ({
                    ...prev,
                    [userId]: { isOnline, lastSeenAt }
                }));
            };

            // Bind events
            socketInstance.on('gallery_view_update', handleGalleryUpdate);
            socketInstance.on('vibe_intent_update', handleVibeUpdate);
            socketInstance.on('package_engagement_update', handlePackageUpdate);
            socketInstance.on('user_presence_update', handlePresenceUpdate); // ✨ Bound presence listener

            // Cleanup on unmount
            return () => {
                socketInstance.off('gallery_view_update', handleGalleryUpdate);
                socketInstance.off('vibe_intent_update', handleVibeUpdate);
                socketInstance.off('package_engagement_update', handlePackageUpdate);
                socketInstance.off('user_presence_update', handlePresenceUpdate); // ✨ Cleaned up
            };
        }
    }, [socketInstance]);

    // ✨ KPI MAPPINGS
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

    const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);
    const openModal = (type, data = null) => { setActiveModal(type); setModalData(data); };
    const closeModal = () => { setActiveModal(null); setModalData(null); };

    // ✨ Always resolve the live, authoritative visit count for whichever user's modal we open
    const openUserModal = async (userLike) => {
        const uid = userLike.id || userLike.userId || userLike._id;

        // Resolve current known live presence
        const isCurrentlyOnline = livePresence[uid]?.isOnline ?? userLike.isOnline ?? false;
        const currentLastSeen = livePresence[uid]?.lastSeenAt
            ? new Date(livePresence[uid].lastSeenAt).toLocaleString()
            : userLike.lastSeen;

        // Open immediately with what we already have — no spinner delay
        setActiveModal('user360');
        setModalData({
            ...userLike,
            id: uid,
            totalVisits: userLike.totalVisits ?? 0,
            isOnline: isCurrentlyOnline,
            lastSeen: currentLastSeen
        });

        if (!uid) return;

        try {
            const { data } = await api.get(`/user/${uid}`);
            if (data?.user) {
                setModalData(prev => (prev && (prev.id === uid || prev.userId === uid))
                    ? {
                        ...prev,
                        totalVisits: data.user.totalPackageVisits || 0,
                        photo: data.user.profilePic || prev.photo,
                        isOnline: livePresence[uid]?.isOnline ?? data.user.isOnline,
                        lastSeen: livePresence[uid]
                            ? (livePresence[uid].isOnline ? prev.lastSeen : new Date(livePresence[uid].lastSeenAt).toLocaleString())
                            : (data.user.lastSeen ? new Date(data.user.lastSeen).toLocaleString() : prev.lastSeen)
                    }
                    : prev
                );
            }
        } catch (error) {
            console.error("Failed to fetch live visit count for user", error);
        }
    };

    // ✨ Keep an open modal's visit count in sync with real-time package analytics refreshes
    useEffect(() => {
        if (activeModal !== 'user360' || !modalData) return;
        const uid = modalData.id || modalData.userId;
        if (!uid) return;

        for (const pkg of packageEngagement) {
            const match = pkg.topUsers?.find(u => (u.userId || u.id) === uid);
            if (match) {
                setModalData(prev => (prev && (prev.id === uid || prev.userId === uid))
                    ? { ...prev, totalVisits: match.totalVisits ?? prev.totalVisits }
                    : prev
                );
                break;
            }
        }
    }, [packageEngagement]);

    // ✨ Keep an open modal's presence in sync with real-time socket events
    useEffect(() => {
        if (activeModal !== 'user360' || !modalData) return;
        const uid = modalData.id || modalData.userId;
        const presence = livePresence[uid];

        if (presence) {
            setModalData(prev => (prev && (prev.id === uid || prev.userId === uid))
                ? {
                    ...prev,
                    isOnline: presence.isOnline,
                    lastSeen: presence.isOnline ? prev.lastSeen : new Date(presence.lastSeenAt).toLocaleString()
                }
                : prev
            );
        }
    }, [livePresence]);

    const top3Media = liveTopMedia.slice(0, 3);

    // ✨ RENDER LEADBOARD CONTENT (Pre-sorted Top 10 Authenticated Users list)
    // -------------------------------------------------------------------------
    // RESOLVED: Handled layout wrapping and truncating to fix mobile overflowing
    const renderExpandedContent = (pkg) => (
        <div className="p-4 md:p-6 bg-slate-50/50 rounded-b-2xl border-t border-border/40">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-start sm:items-center gap-1.5 leading-snug">
                    <Timer className="h-4 w-4 text-[#FA6D16] shrink-0 mt-0.5 sm:mt-0" />
                    <span>Top 10 Active Leads <span className="block sm:inline mt-0.5 sm:mt-0 text-[10px] sm:text-xs text-muted-foreground sm:text-slate-500">(Ranked by 7-Day Attention velocity)</span></span>
                </h4>
                <span className="text-[11px] text-muted-foreground font-semibold italic border-t border-border/40 sm:border-0 pt-2 sm:pt-0 shrink-0">
                    Excludes card-only viewers who never clicked details
                </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {pkg.topUsers && pkg.topUsers.length > 0 ? pkg.topUsers.map((user) => (
                    <div
                        key={user.userId}
                        onClick={() => openUserModal(user)}
                        className="flex flex-col p-4 bg-white border border-border/40 rounded-xl hover:border-[#2A5244]/50 hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                    >
                        {/* Row Core Meta */}
                        <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* ✨ WRAPPED IN RELATIVE CONTAINER FOR LIVE DOT */}
                                <div className="relative shrink-0">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-white overflow-hidden shadow-inner ${user.status === 'banned' ? 'bg-red-500' : 'bg-[#2A5244]'}`}>
                                        {user.photo && user.photo.length > 1 ? (
                                            <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            user.photo || (user.name ? user.name.charAt(0).toUpperCase() : 'U')
                                        )}
                                    </div>
                                    {(livePresence[user.userId]?.isOnline ?? user.isOnline) && (
                                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-foreground text-sm truncate group-hover:text-[#2A5244] transition-colors flex items-center gap-1.5 w-full">
                                        <span className="truncate">{user.name || "Unknown User"}</span>
                                        {user.status === 'banned' && <Ban className="h-3 w-3 text-red-500 shrink-0" />}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium truncate w-full">{user.email || "No email"}</p>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className="flex items-center gap-1 justify-end text-sm font-black text-[#2A5244]">
                                    <MousePointerClick className="h-3.5 w-3.5 shrink-0" /> {user.sevenDayClicksOnThisPackage || 0}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mt-0.5">7d Clicks</span>
                            </div>
                        </div>

                        {/* Direct Tier Breakdown Tags & Exact Durations Mapping */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-border/40">
                            {user.tiers && user.tiers.map((t, idx) => (
                                <div key={idx} className="flex flex-col bg-[#FDFBF7] rounded-lg p-2.5 border border-border/60 min-w-0">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block truncate">{t.tier} Plan</span>
                                    <div className="flex flex-col gap-1 text-[11px] sm:text-xs">
                                        <span className="font-bold text-[#FA6D16] flex items-center gap-1 truncate">
                                            <Timer className="h-3 w-3 shrink-0" /> {t.sevenDaySeconds}s <span className="text-[9px] text-muted-foreground font-medium shrink-0">(7d)</span>
                                        </span>
                                        <span className="font-semibold text-slate-500 flex items-center gap-1 truncate">
                                            <Clock className="h-3 w-3 shrink-0" /> {t.allTimeSeconds}s <span className="text-[9px] text-muted-foreground font-medium shrink-0">(Total)</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <p className="text-muted-foreground text-sm italic p-4 md:p-6 border border-dashed border-border/60 rounded-xl text-center bg-white md:col-span-2 xl:col-span-2">
                        No authenticated users meet the activity requirements for this package yet.
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 font-sans bg-[#FDFBF7] min-h-full">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">Business Intelligence</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Monitor traffic analytics, premium tier engagement, and active user velocity loops.</p>
            </div>

            {/* KPI Cards */}
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
                {/* Vibe Intent Tracking */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-border/40 rounded-2xl shadow-sm p-6">
                        <div className="flex items-start justify-between mb-6 border-b border-border/40 pb-4">
                            <div>
                                <h2 className="text-xl font-bold font-serif text-foreground">Vibe Intent</h2>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Real-time discovery insights</p>
                            </div>
                            <TrendingUp className="h-5 w-5 text-[#2A5244] shrink-0" />
                        </div>
                        <div className="space-y-5">
                            {discoverStats.map((stat, idx) => {
                                const maxClicks = discoverStats.length > 0 ? Math.max(...discoverStats.map(s => s.clicks)) : 1;
                                const clickPercent = maxClicks > 0 ? (stat.clicks / maxClicks) * 100 : 0;
                                const conversionRate = stat.clicks > 0 ? Math.round((stat.galleryConversions / stat.clicks) * 100) : 0;

                                return (
                                    <div key={idx} onClick={() => openModal('discoverDetails', stat)} className="group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold text-foreground group-hover:text-[#2A5244] transition-colors">{stat.vibe}</span>
                                            <span className="text-muted-foreground font-medium text-xs">{stat.clicks} views</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
                                            <div className="h-full bg-[#2A5244] rounded-full transition-all duration-1000 ease-out group-hover:bg-[#FA6D16]" style={{ width: `${clickPercent}%` }} />
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
                            {discoverStats.length === 0 && <p className="text-muted-foreground text-sm italic text-center py-4">No discovery metrics recorded.</p>}
                        </div>
                    </div>
                </div>

                {/* Live Top Performing Media Preview Cards */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-border/40 rounded-2xl shadow-sm p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-4">
                            <h2 className="text-xl font-bold font-serif text-foreground">Top Performing Media</h2>
                            <ImageIcon className="h-5 w-5 text-[#2A5244]" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">Visual assets driving active platform conversion loops.</p>
                        {top3Media.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-xl p-8 bg-muted/20">
                                <ImageIcon className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground font-medium">No media logs established.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                {top3Media.map((img) => (
                                    <div key={img._id} onClick={() => setSelectedMedia(img)} className="group relative rounded-xl overflow-hidden shadow-sm aspect-video cursor-pointer bg-black">
                                        <img src={img.fileType === 'video' ? (img.thumbnailUrl || '/video-placeholder.png') : img.mediaUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                                        <div className="absolute bottom-3 left-3 flex items-center bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10 shadow-lg max-w-[85%]"><MapPin size={12} className="text-[#FA6D16] mr-1.5 shrink-0" /><span className="text-white text-[10px] font-bold uppercase tracking-widest truncate">{img.locationTag}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-auto text-center border-t border-border/40 pt-4">
                            <button onClick={() => openModal('media')} className="inline-flex items-center gap-2 text-sm font-bold text-[#2A5244] hover:text-[#FA6D16] transition-colors">View Top 50 Media Assets <ArrowRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Engagement Tracking Grid/Table Section */}
            <div className="mt-8">
                <div className="mb-4">
                    <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2"><Compass className="h-6 w-6 text-[#2A5244]" /> Package Traffic & Leads</h2>
                    <p className="text-sm text-muted-foreground mt-1">Cross-examine direct customer attention data windows side-by-side.</p>
                </div>

                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block bg-white border border-border/40 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-[#FDFBF7] border-b border-border/40">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">Package Name</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">All-Time Clicks</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">Last 7 Days Clicks</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">7d Total Dwell Time</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">Insights</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {packageEngagement.map((pkg) => (
                                <React.Fragment key={pkg.id}>
                                    <tr className={`hover:bg-[#FDFBF7] transition-colors ${expandedRow === pkg.id ? 'bg-[#FDFBF7]' : ''}`}>
                                        <td className="px-6 py-5 font-bold text-foreground whitespace-nowrap">{pkg.name}</td>
                                        <td className="px-6 py-5 text-center font-black text-slate-500">{pkg.allTimeClicks || 0}</td>
                                        <td className="px-6 py-5 text-center font-black text-[#2A5244] flex items-center justify-center gap-1">
                                            <TrendingUp className="h-4 w-4 text-[#FA6D16]" /> {pkg.sevenDayClicks || 0}
                                        </td>
                                        <td className="px-6 py-5 text-center font-black text-[#FA6D16]">{pkg.sevenDayTotalTime || 0}s</td>
                                        <td className="px-6 py-5 text-right">
                                            <button onClick={() => toggleRow(pkg.id)} className="inline-flex items-center justify-center p-2 rounded-full hover:bg-muted text-[#2A5244] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2A5244]/50">
                                                {expandedRow === pkg.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                            </button>
                                        </td>
                                    </tr>
                                    <AnimatePresence>
                                        {expandedRow === pkg.id && (
                                            <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-muted/10 border-b border-border/40">
                                                <td colSpan="5" className="p-0">{renderExpandedContent(pkg)}</td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                            {packageEngagement.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground italic">
                                        No package analytics available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="md:hidden flex flex-col gap-4">
                    {packageEngagement.map((pkg) => (
                        <div key={pkg.id} className="bg-white border border-border/40 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div onClick={() => toggleRow(pkg.id)} className="p-4 flex flex-col gap-3 active:bg-muted/50 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-foreground leading-tight pr-2">{pkg.name}</h3>
                                    <div className="text-[#2A5244] shrink-0">{expandedRow === pkg.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</div>
                                </div>
                                <div className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
                                    <div className="flex justify-between"><span>All-Time Clicks:</span><span className="font-black text-slate-700">{pkg.allTimeClicks}</span></div>
                                    <div className="flex justify-between text-[#2A5244]"><span>7d Clicks:</span><span className="font-black flex items-center gap-1"><TrendingUp size={12} className="text-[#FA6D16]" /> {pkg.sevenDayClicks}</span></div>
                                    <div className="flex justify-between text-[#FA6D16]"><span>7d Velocity Time:</span><span className="font-black">{pkg.sevenDayTotalTime}s</span></div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {expandedRow === pkg.id && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-muted/10 border-t border-border/40">
                                        {renderExpandedContent(pkg)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                    {packageEngagement.length === 0 && (
                        <div className="bg-white border border-dashed border-border/60 rounded-xl p-8 text-center text-muted-foreground italic">
                            No package analytics available yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Global Overlays / Modals */}
            <AnimatePresence>
                {activeModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

                        <UserDetailModal isOpen={activeModal === 'user360'} viewerRole={user?.role} onClose={closeModal} userData={modalData} />

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
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-sm bg-white rounded-3xl shadow-2xl z-50 border border-border/40 overflow-hidden flex flex-col max-h-[85vh]"
                            >
                                <div className="p-6 border-b border-border/40 bg-[#FDFBF7] flex justify-between items-center shrink-0">
                                    <h2 className="text-lg font-bold font-serif text-foreground truncate pr-4">{modalData.vibe}</h2>
                                    <button onClick={closeModal} className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                                </div>

                                <div className="p-6 overflow-y-auto">
                                    <div className="space-y-4">
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

                                    {modalData.topUsers && modalData.topUsers.length > 0 && (
                                        <div className="mt-6 border-t border-border/40 pt-5">
                                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Top Registered Viewers</h3>
                                            <div className="space-y-3">
                                                {modalData.topUsers.map((u, i) => (
                                                    <div
                                                        key={i}
                                                        // ✨ UPDATED to use openUserModal
                                                        onClick={() => openUserModal({
                                                            id: u.id,
                                                            name: u.name || "Unknown User",
                                                            email: u.email || "No email provided",
                                                            photo: u.photo || (u.name ? u.name.charAt(0).toUpperCase() : "U"),
                                                            role: "User",
                                                            topVibe: modalData.vibe,
                                                            leadScore: u.timeSpent > 30 ? "Hot" : "Warm",
                                                            isOnline: u.isOnline,
                                                            lastSeen: u.lastSeen
                                                        })}
                                                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-border/60 shadow-sm cursor-pointer hover:border-[#2A5244]/50 hover:shadow-md transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-[#2A5244] text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                                                {u.photo ? <img src={u.photo} className="w-full h-full object-cover" alt={u.name} /> : (u.name?.charAt(0) || 'U')}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-xs font-bold text-foreground leading-tight truncate group-hover:text-[#2A5244] transition-colors">{u.name || "Unknown"}</span>
                                                                <span className="text-[10px] font-medium text-muted-foreground truncate w-24 md:w-32">{u.email || "No email"}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-[#FA6D16] bg-[#FA6D16]/10 px-2 py-1 rounded-md shrink-0">
                                                            {u.timeSpent > 60 ? `${Math.floor(u.timeSpent / 60)}m ${u.timeSpent % 60}s` : `${u.timeSpent}s`}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* LIVE TOP 50 GRID MODAL */}
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

                                                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-md border border-white/10 shadow-md">
                                                    #{index + 1}
                                                </div>

                                                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#FA6D16]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">
                                                    <TrendingUp size={12} /> {media.trendingViews}
                                                </div>

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

            {/* FULL SCREEN MEDIA LIGHTBOX */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedMedia(null)}
                        className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <div className="absolute bottom-10 left-4 md:left-10 max-w-4xl z-110 pointer-events-auto flex flex-col gap-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2 md:gap-4 drop-shadow-2xl">
                                <MapPin size={32} className="text-[#FA6D16] drop-shadow-lg shrink-0 md:w-10 md:h-10" />
                                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">{selectedMedia.locationTag}</h2>
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

                        <button onClick={() => setSelectedMedia(null)} className="absolute top-8 right-4 md:right-8 z-110 text-white hover:text-white/70 transition-colors p-3 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
                            <X size={24} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}
                        >
                            {selectedMedia.fileType === 'video' ? (
                                <video src={selectedMedia.mediaUrl} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" controls autoPlay loop playsInline />
                            ) : (
                                <img src={selectedMedia.mediaUrl} alt={selectedMedia.title} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl select-none" />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}