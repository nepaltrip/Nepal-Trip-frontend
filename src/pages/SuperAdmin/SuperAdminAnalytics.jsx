import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
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
    Mail,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserDetailModal } from "../../components/modal/UserDetailModal";


const discoverStats = [
    { vibe: "High Altitude Trekking", clicks: 840, galleryConversions: 320, avgTime: "4m 12s", bounceRate: "22%" },
    { vibe: "Culture & City", clicks: 610, galleryConversions: 150, avgTime: "2m 45s", bounceRate: "35%" },
    { vibe: "Wildlife & Jungle", clicks: 430, galleryConversions: 95, avgTime: "3m 10s", bounceRate: "28%" },
    { vibe: "Honeymoon", clicks: 290, galleryConversions: 110, avgTime: "5m 30s", bounceRate: "15%" },
];

const galleryStats = [
    { id: 1, title: "Rhino at Chitwan", vibe: "Wildlife & Jungle", clicks: 1205, url: "https://images.unsplash.com/photo-1585675100414-22d71f11cb23?q=80&w=400&auto=format&fit=crop" },
    { id: 2, title: "Everest Base Camp", vibe: "High Altitude", clicks: 940, url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400&auto=format&fit=crop" },
    { id: 3, title: "Patan Durbar Square", vibe: "Culture & City", clicks: 820, url: "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?q=80&w=400&auto=format&fit=crop" }
];

const top50Media = Array.from({ length: 50 }).map((_, i) => ({
    id: `m-${i + 1}`,
    title: `Premium Media Asset ${i + 1}`,
    vibe: ["Wildlife", "Culture", "Mountains", "Honeymoon"][i % 4],
    clicks: 1500 - (i * 22),
    url: [
        "https://images.unsplash.com/photo-1585675100414-22d71f11cb23?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=800&auto=format&fit=crop"
    ][i % 4]
}));

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
    const { user, isAuthenticated } = useSelector((state) => state.auth);


    // ✨ REAL-TIME METRICS STATE
    const [metrics, setMetrics] = useState({
        uniqueVisitors: 2405, // Placeholder for 30d visitors
        totalInquiries: 0,
        pendingReplies: 0
    });

    const [inquiriesList, setInquiriesList] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [rowTab, setRowTab] = useState("auth");

    // Modal States
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'inquiries', 'pending', 'media', 'discoverDetails'
    const [modalData, setModalData] = useState(null);

    // Full Screen Media State
    const [selectedMedia, setSelectedMedia] = useState(null);



    // ✨ FETCH BASELINE & WIRE UP SOCKETS
    const fetchBaselineMetrics = async () => {
        try {
            const { data } = await api.get('/superadmin/dashboard-counters');
            setMetrics({
                uniqueVisitors: data.uniqueVisitors || 0,
                totalInquiries: data.totalInquiries || 0,
                pendingReplies: data.pendingReplies || 0
            });
            if (data.recentInquiries) {
                setInquiriesList(data.recentInquiries); // Populate the modal list
            }
        } catch (error) {
            console.error("Failed to load dashboard metrics", error);
        }
    };
    useEffect(() => {
        fetchBaselineMetrics();

        let socket;
        if (isAuthenticated && user) {
            socket = io(import.meta.env.VITE_API_URL);
            socket.emit('register', { id: user.id || user._id, role: user.role });

            // ✨ When an inquiry comes in or is replied to, instantly refetch to update numbers AND the lists
            socket.on('dashboard_counter_update', (payload) => {
                if (payload.action === 'live_visitor_update') {
                    setMetrics(prev => ({
                        ...prev,
                        uniqueVisitors: payload.count // Smoothly rewrite visitor metrics count live
                    }));
                } else {
                    // For everything else (inquiries, replies), fall back to the safe core master refetch
                    fetchBaselineMetrics();
                }
            });
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, [isAuthenticated, user]);

    // ✨ DYNAMIC KPI DATA LINKED TO LIVE METRICS
    const dynamicKpiData = [
        {
            id: "visitors",
            title: "Unique Visitors (30d)",
            value: metrics.uniqueVisitors.toLocaleString(),
            trend: "Live Stream", // Indicates metrics are pulling cleanly from sockets
            icon: Users,
            color: "text-[#2A5244]",
            bg: "bg-[#2A5244]/10",
            clickable: false
        },
        {
            id: "inquiries",
            title: "Total Inquiries",
            value: metrics.totalInquiries.toLocaleString(),
            // Replaced dummy percentage because Total Inquiries is an 'All Time' metric
            trend: "All Time",
            icon: MessageSquare,
            color: "text-[#2A5244]",
            bg: "bg-[#2A5244]/10",
            clickable: true
        },
        {
            id: "pending",
            title: "Pending Replies",
            value: metrics.pendingReplies.toLocaleString(),
            // ✨ LOGICAL CHECK: Only say "Action Required" if there are actual pending replies
            trend: metrics.pendingReplies > 0 ? "Action Required" : "All Caught Up",
            icon: Clock,
            // ✨ LOGICAL CHECK: Turn the icon green if everything is replied to
            color: metrics.pendingReplies > 0 ? "text-[#FA6D16]" : "text-emerald-600",
            bg: metrics.pendingReplies > 0 ? "bg-[#FA6D16]/10" : "bg-emerald-100",
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
        setSelectedUser(null);
    };

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

            {/* KPI Cards (Mapped to live metrics state) */}
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

                {/* Top Performing Media (Middle/Right Col) */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-border/40 rounded-2xl shadow-sm p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-4">
                            <h2 className="text-xl font-bold font-serif text-foreground">Top Performing Media</h2>
                            <ImageIcon className="h-5 w-5 text-[#2A5244]" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">Visuals that are driving the most engagement and clicks on your site right now.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            {galleryStats.map((img) => (
                                <div
                                    key={img.id}
                                    onClick={() => setSelectedMedia(img)}
                                    className="group relative rounded-xl overflow-hidden border border-border/40 shadow-sm aspect-square sm:aspect-auto sm:h-48 cursor-pointer"
                                >
                                    <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FA6D16] mb-1">{img.vibe}</span>
                                        <h3 className="text-white font-bold text-sm leading-tight mb-2 line-clamp-1">{img.title}</h3>
                                        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                                            <Eye className="h-3.5 w-3.5 text-emerald-400" /> {img.clicks} Views
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

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
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-black text-[#2A5244]">{pkg.totalClicks}</span> Views
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                        <span className="bg-[#2A5244]/10 text-[#2A5244] px-2 py-0.5 rounded-md">{pkg.authUsers.length} Auth</span>
                                        <span className="text-muted-foreground">+</span>
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{pkg.anonTotal} Anon</span>
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
                                        {/* ✨ CHANGED: Now mapping over the real live database inquiries */}
                                        {inquiriesList.filter(i => activeModal === 'inquiries' || i.status === 'pending').map(inq => (
                                            <li key={inq.id} className="p-4 border border-border/60 rounded-xl hover:bg-muted/30 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-foreground">{inq.name}</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground">{inq.date}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{inq.subject}</p>
                                                <div className="mt-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inq.status === 'pending' ? 'bg-[#FA6D16]/10 text-[#FA6D16]' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {inq.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                        {/* Fallback if empty */}
                                        {inquiriesList.filter(i => activeModal === 'inquiries' || i.status === 'pending').length === 0 && (
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

                        {/* TOP 50 MEDIA MODAL */}
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
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">Performance over the last 7 days</p>
                                    </div>
                                    <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="overflow-y-auto p-4 md:p-6 bg-muted/10">
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                        {top50Media.map(media => (
                                            <div
                                                key={media.id}
                                                onClick={() => setSelectedMedia(media)}
                                                className="relative rounded-xl overflow-hidden shadow-sm aspect-square border border-border/40 group bg-black cursor-pointer"
                                            >
                                                <img src={media.url} alt={media.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
                                                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-3 pt-6">
                                                    <p className="text-white text-xs font-bold truncate">{media.title}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[8px] md:text-[10px] font-black uppercase text-[#FA6D16]">{media.vibe}</span>
                                                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><Eye className="h-3 w-3" /> {media.clicks}</span>
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                    #{media.id.replace('m-', '')}
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
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-100 flex flex-col items-center justify-center p-4 md:p-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedMedia(null)}
                            className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all z-110"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Image Container with Spring Animation */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative max-w-5xl w-full h-full max-h-[80vh] md:max-h-[85vh] flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedMedia.url}
                                alt={selectedMedia.title}
                                className="w-auto h-auto max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/20"
                            />

                            {/* Metadata Caption */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="absolute bottom-0 translate-y-full pt-4 text-center w-full"
                            >
                                <h3 className="text-white font-bold text-lg md:text-xl">{selectedMedia.title}</h3>
                                <div className="flex items-center justify-center gap-3 mt-2 text-sm text-white/70">
                                    <span className="font-bold text-[#FA6D16] uppercase tracking-wider">{selectedMedia.vibe}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {selectedMedia.clicks} Views</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}