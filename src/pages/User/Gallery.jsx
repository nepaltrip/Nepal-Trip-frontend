import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Trash2, AlertTriangle, ArrowUp, ArrowDown, Eye, X, Volume2, VolumeX, Plus, Copy, Check, Filter, LayoutGrid, GalleryVerticalEnd, Play, Pause, Maximize } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { InlineEditor } from "../../components/admin/InlineEditor";
import { useSearchParams } from "react-router-dom";

// --- Helper to generate local thumbnail for upload preview ---
const generateLocalVideoThumbnail = (file) => {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        const url = URL.createObjectURL(file);
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.onloadeddata = () => { video.currentTime = 0.5; };
        video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 360;
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
            URL.revokeObjectURL(url);
        };
        video.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
    });
};

// --- Immersive Fullscreen Lightbox Component ---
const Lightbox = ({ item, onClose, activeGodMode, onUpdate, isGlobalMuted, setIsGlobalMuted, onRegisterView }) => {
    const videoRef = useRef(null);
    const viewTrackedRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        if (item.fileType === 'image') onRegisterView(item);
        return () => { document.body.style.overflow = 'unset'; };
    }, [item]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleTimeUpdate = (e) => {
        if (viewTrackedRef.current) return;
        const video = e.target;
        if (video.duration && (video.currentTime / video.duration) >= 0.4) {
            viewTrackedRef.current = true;
            onRegisterView(item);
        }
    };

    const togglePlay = (e) => {
        e.stopPropagation(); // Prevents Lightbox from closing
        if (videoRef.current) {
            if (videoRef.current.paused) videoRef.current.play();
            else videoRef.current.pause();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute bottom-10 left-4 md:left-10 max-w-4xl z-110 pointer-events-auto flex flex-col gap-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 md:gap-4 drop-shadow-2xl">
                    <MapPin size={32} className="text-[#FA6D16] drop-shadow-lg shrink-0 md:w-10 md:h-10" />
                    <h2 className="text-3xl md:text-6xl font-black text-white tracking-tight leading-none">
                        {activeGodMode ? <InlineEditor value={item.locationTag} onSave={(val) => onUpdate(item._id, "locationTag", val)} /> : item.locationTag}
                    </h2>
                </div>
            </div>

            <button onClick={onClose} className="absolute top-8 right-4 md:right-8 z-110 text-white hover:text-white/70 transition-colors p-3 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
                <X size={24} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center group/lightbox" onClick={e => e.stopPropagation()}>
                {item.fileType === 'video' ? (
                    <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                        <video
                            ref={videoRef}
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            src={item.mediaUrl}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            autoPlay
                            loop
                            playsInline
                            muted={isGlobalMuted}
                            controlsList="nodownload"
                            onContextMenu={(e) => e.preventDefault()}
                        />

                        {/* Central Play Icon Overlay on Pause */}
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-115">
                                <div className="bg-black/50 p-6 rounded-full backdrop-blur-md border border-white/20 shadow-2xl scale-110">
                                    <Play className="text-white ml-2" fill="white" size={48} />
                                </div>
                            </div>
                        )}

                        <div className="absolute top-28 right-4 md:right-8 flex flex-col gap-3 opacity-100 md:opacity-0 group-hover/lightbox:opacity-100 transition-opacity duration-500 z-110">
                            <button onClick={(e) => { e.stopPropagation(); setIsGlobalMuted(!isGlobalMuted); }} className="p-3 bg-black/40 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-colors shadow-2xl">
                                {isGlobalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <img
                        src={item.mediaUrl}
                        alt="Gallery Asset"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable="false"
                    />
                )}
            </div>
        </motion.div>
    );
};

// --- Mobile Vertical Swipe Card Component (Instagram Reel Style) ---
const MobileSwipeCard = ({ item, isGlobalMuted, setIsGlobalMuted, onRegisterView }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const viewTrackedRef = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { threshold: 0.6 });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let imageTimer;
        if (isVisible) {
            if (item.fileType === 'image' && !viewTrackedRef.current) {
                imageTimer = setTimeout(() => {
                    viewTrackedRef.current = true;
                    onRegisterView(item);
                }, 3000);
            }
        } else {
            viewTrackedRef.current = false;
        }
        return () => clearTimeout(imageTimer);
    }, [isVisible, item.fileType]);

    useEffect(() => {
        if (item.fileType === 'video' && videoRef.current) {
            if (isVisible) videoRef.current.play().catch(() => { });
            else { videoRef.current.pause(); videoRef.current.currentTime = 0; }
        }
    }, [isVisible, item.fileType]);

    const handleTimeUpdate = (e) => {
        if (viewTrackedRef.current) return;
        const video = e.target;
        if (video.duration && (video.currentTime / video.duration) >= 0.4) {
            viewTrackedRef.current = true;
            onRegisterView(item);
        }
    };

    const togglePlay = (e) => {
        e.stopPropagation();
        if (item.fileType === 'video' && videoRef.current) {
            if (videoRef.current.paused) videoRef.current.play();
            else videoRef.current.pause();
        }
    };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(item.mediaUrl);
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div ref={containerRef} className="w-full h-[calc(100dvh-4.5rem)] shrink-0 snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden" onClick={togglePlay}>
            <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl pointer-events-none scale-110" style={{ backgroundImage: `url(${item.thumbnailUrl || item.mediaUrl})` }} />

            <div className="w-full h-full relative z-10 flex items-center justify-center">
                {item.fileType === 'video' ? (
                    <video
                        ref={videoRef}
                        onTimeUpdate={handleTimeUpdate}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        src={item.mediaUrl}
                        className="max-w-full max-h-full object-contain"
                        loop playsInline muted={isGlobalMuted}
                    />
                ) : (
                    <img src={item.mediaUrl} alt="Gallery Item" className="max-w-full max-h-full object-contain select-none" loading="lazy" />
                )}

                {/* Central Play Icon Overlay on Pause */}
                {item.fileType === 'video' && !isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-115">
                        <div className="bg-black/50 p-5 rounded-full backdrop-blur-md border border-white/20 shadow-2xl scale-125">
                            <Play className="text-white ml-1" fill="white" size={40} />
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
                <MapPin size={14} className="text-[#FA6D16]" />
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">{item.locationTag}</span>
            </div>

            <div className="absolute top-6 right-6 z-30 flex flex-col gap-4">
                <button onClick={handleCopyLink} className="p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl active:scale-95 transition-transform">
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
                {item.fileType === 'video' && (
                    <button onClick={(e) => { e.stopPropagation(); setIsGlobalMuted(!isGlobalMuted); }} className="p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl active:scale-95 transition-transform">
                        {isGlobalMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                )}
                <div className="flex flex-col items-center gap-1 text-white drop-shadow-md">
                    <div className="p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-xl"><Eye size={18} /></div>
                    <span className="text-xs font-bold drop-shadow-md">{item.views || 0}</span>
                </div>
            </div>
        </div>
    );
};

// --- Restored MasonryCard Component (Grid View) ---
const MasonryCard = ({ item, index, activeGodMode, setDeletingId, onUpdate, onClick, isGlobalMuted, setIsGlobalMuted, isMobile, activeVideoId, setActiveVideoId, onRegisterView }) => {
    const cardRef = useRef(null);
    const videoRef = useRef(null);
    const lastClickTime = useRef(0);
    const hoverTimer = useRef(null);
    const viewTrackedRef = useRef(false);

    const [copied, setCopied] = useState(false);
    const [isMediaLoaded, setIsMediaLoaded] = useState(false);
    const [isLocExpanded, setIsLocExpanded] = useState(false);
    const [isMobileGridVisible, setIsMobileGridVisible] = useState(false);
    const locTimeoutRef = useRef(null);

    const isPlaying = activeVideoId === item._id;

    useEffect(() => {
        if (!isMobile || item.fileType !== 'image') return;
        const observer = new IntersectionObserver(([entry]) => setIsMobileGridVisible(entry.isIntersecting), { threshold: 0.5 });
        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [isMobile, item.fileType]);

    useEffect(() => {
        let timer;
        if (isMobileGridVisible && item.fileType === 'image' && !viewTrackedRef.current) {
            timer = setTimeout(() => { viewTrackedRef.current = true; onRegisterView(item); }, 5000);
        } else if (!isMobileGridVisible) viewTrackedRef.current = false;
        return () => clearTimeout(timer);
    }, [isMobileGridVisible, item.fileType]);

    useEffect(() => {
        if (item.fileType === 'video' && videoRef.current) {
            if (isPlaying) videoRef.current.play().catch(() => { });
            else videoRef.current.pause();
        }
    }, [isPlaying, item.fileType]);

    const handleTimeUpdate = (e) => {
        if (viewTrackedRef.current) return;
        const video = e.target;
        if (video.duration && (video.currentTime / video.duration) >= 0.4) {
            viewTrackedRef.current = true;
            onRegisterView(item);
        }
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            if (item.fileType === 'video') setActiveVideoId(item._id);
            else if (item.fileType === 'image' && !viewTrackedRef.current) {
                hoverTimer.current = setTimeout(() => { viewTrackedRef.current = true; onRegisterView(item); }, 3000);
            }
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            if (item.fileType === 'video') setActiveVideoId(null);
            else { clearTimeout(hoverTimer.current); viewTrackedRef.current = false; }
        }
    };

    const canEditLocation = activeGodMode && !isMobile;
    const handleCopyLink = (e) => {
        e.stopPropagation(); navigator.clipboard.writeText(item.mediaUrl); setCopied(true);
        toast.success("Link copied!"); setTimeout(() => setCopied(false), 2000);
    };

    const triggerLocationShow = () => {
        setIsLocExpanded(true);
        if (locTimeoutRef.current) clearTimeout(locTimeoutRef.current);
        locTimeoutRef.current = setTimeout(() => setIsLocExpanded(false), 5000);
    };

    const handleLocClick = (e) => {
        e.stopPropagation();
        if (canEditLocation) return;
        triggerLocationShow();
    };

    const handleCardClick = (e) => {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime.current;

        if (item.fileType === 'video') {
            e.stopPropagation();
            if (timeDiff < 300) onClick(item);
            else {
                if (isPlaying) setActiveVideoId(null);
                else { setActiveVideoId(item._id); if (isMobile) triggerLocationShow(); }
            }
        } else onClick(item);

        lastClickTime.current = currentTime;
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
            className="relative group break-inside-avoid mb-4 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden bg-muted/10 cursor-pointer shadow-sm transition-all hover:shadow-2xl hover:scale-[1.01]"
            onClick={handleCardClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
        >
            {activeGodMode && (
                <button onClick={(e) => { e.stopPropagation(); setDeletingId(item._id); }} className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/10 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                    <Trash2 size={16} />
                </button>
            )}

            <div className={`absolute top-3 right-3 md:top-4 md:right-4 z-30 flex flex-col gap-2 transition-all duration-300 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {item.fileType === 'video' && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); setIsGlobalMuted(!isGlobalMuted); }} className="p-2 md:p-2.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl">
                            {isGlobalMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>

                        {/* NEW: Fullscreen Button (Visible only in Mobile Grid Mode) */}
                        {isMobile && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick(item);
                                }}
                                className="p-2 md:p-2.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl"
                            >
                                <Maximize size={16} />
                            </button>
                        )}
                    </>
                )}
                {!isMobile && (
                    <button onClick={handleCopyLink} className="p-2 md:p-2.5 bg-black/50 hover:bg-[#FA6D16] backdrop-blur-md border border-white/10 text-white rounded-full shadow-xl">
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                )}
            </div>

            <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl bg-zinc-900/5">
                {!isMediaLoaded && <div className="absolute inset-0 bg-neutral-200/60 dark:bg-neutral-800/40 animate-pulse z-10" />}

                {item.fileType === 'video' ? (
                    <>
                        <video ref={videoRef} onTimeUpdate={handleTimeUpdate} src={item.mediaUrl} className={`w-full h-auto object-cover block transition-opacity duration-500 ease-in-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`} muted={isGlobalMuted} playsInline loop onLoadedData={() => setIsMediaLoaded(true)} />
                        {isMediaLoaded && (
                            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none ${!isPlaying ? 'bg-black/20 group-hover:bg-black/40' : ''}`}>

                                {/* Play/Pause Button - Fades out on Desktop Hover */}
                                <div className={`transition-opacity duration-500 ${!isMobile && 'group-hover:opacity-0'}`}>
                                    {!isPlaying ? (
                                        <div className="bg-black/60 p-3 md:p-4 rounded-full backdrop-blur-sm border border-white/20 shadow-xl">
                                            <Play className="text-white ml-0.5 md:ml-1" fill="white" size={isMobile ? 24 : 28} />
                                        </div>
                                    ) : (
                                        <div className="opacity-0 bg-black/40 p-3 md:p-4 rounded-full backdrop-blur-sm border border-white/20 shadow-xl">
                                            <Pause className="text-white" fill="white" size={isMobile ? 24 : 28} />
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Hover Instruction text */}
                                {!isMobile && (
                                    <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 text-white/90 text-[10px] font-black tracking-widest uppercase bg-black/60 px-5 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
                                        Double Tap Fullscreen
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <img src={item.mediaUrl} className={`w-full h-auto block select-none transition-opacity duration-500 ease-in-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`} alt="Gallery Asset" loading="lazy" onLoad={() => setIsMediaLoaded(true)} />
                )}
            </div>

            <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-20 pointer-events-auto" onClick={handleLocClick}>
                {canEditLocation ? (
                    <div className="flex items-center bg-black/70 backdrop-blur-md border border-[#FA6D16] rounded-full p-1 shadow-2xl transition-all w-auto overflow-visible" onClick={e => e.stopPropagation()}>
                        <div className="bg-black/50 w-8 h-8 flex items-center justify-center rounded-full shrink-0"><MapPin size={16} className="text-white" /></div>
                        <div className="mx-2"><InlineEditor value={item.locationTag} onSave={(val) => onUpdate(item._id, "locationTag", val)} /></div>
                    </div>
                ) : (
                    <div className={`group/loc flex items-center bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full transition-all duration-300 overflow-hidden shadow-2xl h-8 md:h-10 border border-white/10 cursor-default ${isLocExpanded && isMobile ? 'bg-black/70' : ''}`}>
                        <div className="w-8 md:w-10 h-full flex items-center justify-center shrink-0 text-white group-hover/loc:text-[#FA6D16] transition-colors"><MapPin size={16} /></div>
                        <span className={`text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-500 ease-in-out overflow-hidden group-hover/loc:opacity-100 group-hover/loc:max-w-50 group-hover/loc:pr-4 ${isLocExpanded && isMobile ? 'opacity-100 max-w-50 pr-4' : 'opacity-0 max-w-0'}`}>{item.locationTag}</span>
                    </div>
                )}
            </div>

            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 md:px-3 md:py-1.5 shadow-xl">
                <Eye size={12} className="text-white md:w-3.5 md:h-3.5" />
                <span className="text-white text-[10px] md:text-xs font-bold">{item.views || 0}</span>
            </div>
        </motion.div>
    );
};

export default function Gallery() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isSuperAdmin = isAuthenticated && user?.role === "SuperAdmin";
    const [searchParams, setSearchParams] = useSearchParams();

    const [mediaItems, setMediaItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', order: 'desc' });
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isGlobalMuted, setIsGlobalMuted] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState(null);

    const [isMobile, setIsMobile] = useState(false);
    const [mobileViewMode, setMobileViewMode] = useState("grid");
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const headerRef = useRef(null);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const observerTarget = useRef(null);

    const [uploadState, setUploadState] = useState({ isUploading: false, progress: 0, preview: null, uploadType: 'gallery' });
    const [deletingId, setDeletingId] = useState(null);
    const hiddenFileInputRef = useRef(null);


    // --- Master Tracker Function (10-Minute LocalStorage Throttle) ---
    const handleRegisterView = async (item) => {
        try {
            const COOLDOWN_MINUTES = 10;
            const LOCAL_STORAGE_KEY = 'gallery_tracked_views';

            const trackedHistory = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
            const now = Date.now();
            const lastViewedAt = trackedHistory[item._id];

            if (lastViewedAt && (now - lastViewedAt) < (COOLDOWN_MINUTES * 60 * 1000)) return;

            trackedHistory[item._id] = now;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trackedHistory));

            const { data } = await api.post(`/gallery/${item._id}/view`, {
                visitorId: localStorage.getItem('nt_visitor_id')
            });

            if (data.success) {
                // ✨ Map the new allTimeViews metric to the standard 'views' key locally
                setMediaItems(prev => prev.map(m => m._id === item._id ? { ...m, views: data.allTimeViews } : m));
                if (selectedMedia && selectedMedia._id === item._id) {
                    setSelectedMedia(prev => ({ ...prev, views: data.allTimeViews }));
                }
            }
        } catch (error) { console.error("View count tracker failed", error); }
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const destParam = searchParams.get("destination");
        if (destParam) {
            setSearchQuery(destParam);
            // clear it from the URL so it doesn't persist once the user edits the search box
            setSearchParams({}, { replace: true });
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsHeaderVisible(entry.isIntersecting), { threshold: 0 });
        if (headerRef.current) observer.observe(headerRef.current);
        return () => observer.disconnect();
    }, []);


    const fetchGallery = async (currentPage = 1, isNewSearch = false) => {
        if (currentPage === 1) setIsLoading(true);
        else setIsFetchingMore(true);

        try {
            const { data } = await api.get('/gallery', {
                params: { page: currentPage, limit: 15, search: searchQuery, sortKey: sortConfig.key, sortOrder: sortConfig.order }
            });

            if (data.success) {
                setMediaItems(prev => isNewSearch ? data.data : [...prev, ...data.data]);
                setHasMore(data.pagination.hasMore); setTotalItems(data.pagination.total);
            }
        } catch (error) { toast.error("Failed to load gallery feed assets."); }
        finally { setIsLoading(false); setIsFetchingMore(false); }
    };

    useEffect(() => {
        setPage(1); const delayDebounceFn = setTimeout(() => fetchGallery(1, true), 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, sortConfig]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore) {
                const nextPage = page + 1; setPage(nextPage); fetchGallery(nextPage, false);
            }
        }, { threshold: 0.1, rootMargin: "200px" });

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
    }, [hasMore, isLoading, isFetchingMore, page, mobileViewMode]);

    const handleInstantBrowseTrigger = () => hiddenFileInputRef.current?.click();

    const handleFileChangeAndUploadInitiation = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        const isVideo = file.type.startsWith('video/');
        let thumbUrl = null;
        if (isVideo) thumbUrl = await generateLocalVideoThumbnail(file);

        const startJobEvent = new CustomEvent('initiateGlobalBackgroundUploadJob', {
            detail: { uploadType: 'gallery', files: [file], metadata: { title: "Untitled", locationTag: "Set Location", description: "", fileType: isVideo ? 'video' : 'image', aspectRatio: 'landscape', thumbnailUrl: thumbUrl } }
        });
        window.dispatchEvent(startJobEvent);
    };

    const handleUpdateField = async (id, field, value) => {
        let finalValue = (value || "").trim(); if (!finalValue) finalValue = "Set Location";
        setMediaItems(prev => prev.map(m => m._id === id ? { ...m, [field]: finalValue } : m));
        if (selectedMedia && selectedMedia._id === id) setSelectedMedia(prev => ({ ...prev, [field]: finalValue }));
        try { await api.put(`/gallery/${id}`, { [field]: finalValue }); }
        catch (error) { toast.error("Failed to save changes."); fetchGallery(page, false); }
    };

    const confirmWipeItem = async () => {
        if (!deletingId) return;
        try {
            await api.delete(`/gallery/${deletingId}`);
            setMediaItems(mediaItems.filter(m => m._id !== deletingId));
            setTotalItems(prev => Math.max(0, prev - 1)); toast.success("Asset wiped completely.");
        } catch (error) { toast.error("Failed deletion."); }
        finally { setDeletingId(null); }
    };

    useEffect(() => {
        const handleStart = (e) => {
            const file = e.detail.files[0];
            const meta = e.detail.metadata;
            const previewUrl = meta.thumbnailUrl || URL.createObjectURL(file);
            setUploadState({ isUploading: true, progress: 0, preview: previewUrl, uploadType: e.detail.uploadType });
        };
        const handleProgress = (e) => setUploadState(prev => ({ ...prev, progress: e.detail }));
        const handleSuccess = () => {
            toast.success("Upload successful!");
            setUploadState({ isUploading: false, progress: 0, preview: null, uploadType: 'gallery' });
            setPage(1); fetchGallery(1, true);
        };
        const handleError = (e) => {
            toast.error(`Upload failed: ${e.detail || 'Network error'}`);
            setUploadState({ isUploading: false, progress: 0, preview: null, uploadType: 'gallery' });
        };

        window.addEventListener('initiateGlobalBackgroundUploadJob', handleStart);
        window.addEventListener('gallery-upload-progress', handleProgress);
        window.addEventListener('gallery-upload-success', handleSuccess);
        window.addEventListener('gallery-upload-error', handleError);

        return () => {
            window.removeEventListener('initiateGlobalBackgroundUploadJob', handleStart);
            window.removeEventListener('gallery-upload-progress', handleProgress);
            window.removeEventListener('gallery-upload-success', handleSuccess);
            window.removeEventListener('gallery-upload-error', handleError);
        };
    }, []);

    const cancelUpload = () => {
        window.dispatchEvent(new Event(`${uploadState.uploadType}-upload-cancel`));
        setUploadState({ isUploading: false, progress: 0, preview: null, uploadType: 'gallery' });
        toast.warning("Upload cancelled.");
    };

    return (
        <div className="w-full min-h-screen bg-background flex flex-col relative overflow-hidden">
            <input type="file" ref={hiddenFileInputRef} className="hidden" accept="video/*,image/*" onChange={handleFileChangeAndUploadInitiation} />

            <AnimatePresence>
                {!isHeaderVisible && isMobile && (
                    <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-60 flex bg-black/80 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-2xl">
                        <button onClick={() => setMobileViewMode("grid")} className={`p-2 rounded-full transition-all ${mobileViewMode === "grid" ? "bg-[#FA6D16] text-white shadow-md" : "text-white/60 hover:text-white"}`}><LayoutGrid size={18} /></button>
                        <button onClick={() => setMobileViewMode("swipe")} className={`p-2 rounded-full transition-all ${mobileViewMode === "swipe" ? "bg-[#FA6D16] text-white shadow-md" : "text-white/60 hover:text-white"}`}><GalleryVerticalEnd size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div ref={headerRef} className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-xl border-b border-border/40 py-3 px-4 md:py-4 md:px-8 shadow-sm">
                <AnimatePresence>
                    {isMobileSearchOpen && isMobile && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center px-4 gap-3 border-b border-border/40">
                            <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input autoFocus placeholder="Search locations..." className="pl-9 h-10 text-sm rounded-full w-full border-[#FA6D16]/50 focus-visible:ring-[#FA6D16]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                            <button onClick={() => setIsMobileSearchOpen(false)} className="p-2.5 bg-muted rounded-full text-foreground"><X size={16} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-5">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight leading-none">Gallery</h1>
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">{totalItems} {totalItems === 1 ? 'Capture' : 'Captured'}</p>
                    </div>

                    <div className="hidden md:block flex-1 max-w-lg relative group/search">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-[#FA6D16] transition-colors duration-300" />
                        <Input placeholder="Search locations..." className="pl-11 bg-white border border-gray-200 focus-visible:ring-1 focus-visible:border-[#FA6D16] rounded-full h-12 w-full text-sm font-medium shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex bg-[#FA6D16]/5 p-1.5 rounded-full border border-[#FA6D16]/20 shadow-sm">
                            <button onClick={() => setSortConfig({ key: 'createdAt', order: sortConfig.order === 'desc' ? 'asc' : 'desc' })} className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${sortConfig.key === 'createdAt' ? 'bg-[#FA6D16] text-white shadow-md' : 'text-[#FA6D16]/80 hover:bg-[#FA6D16]/10'}`}>Recent {sortConfig.key === 'createdAt' && (sortConfig.order === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />)}</button>
                            <button onClick={() => { if (sortConfig.key !== 'views') setSortConfig({ key: 'views', order: 'desc' }) }} className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${sortConfig.key === 'views' ? 'bg-[#FA6D16] text-white shadow-md' : 'text-[#FA6D16]/80 hover:bg-[#FA6D16]/10'}`}><Eye size={14} /> Views</button>
                        </div>

                        <div className="flex md:hidden items-center gap-2 relative">
                            <button onClick={() => setIsMobileSearchOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-full border shadow-sm bg-card border-border text-foreground hover:bg-muted transition-colors"><Search size={16} /></button>

                            <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
                                <button onClick={() => setMobileViewMode("grid")} className={`p-1.5 rounded-full transition-all ${mobileViewMode === "grid" ? "bg-white shadow-sm text-[#FA6D16]" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid size={16} /></button>
                                <button onClick={() => setMobileViewMode("swipe")} className={`p-1.5 rounded-full transition-all ${mobileViewMode === "swipe" ? "bg-white shadow-sm text-[#FA6D16]" : "text-muted-foreground hover:text-foreground"}`}><GalleryVerticalEnd size={16} /></button>
                            </div>
                        </div>

                        {isSuperAdmin && !isMobile && (
                            <button onClick={handleInstantBrowseTrigger} className="shrink-0 flex items-center justify-center px-6 py-2.5 bg-[#FA6D16] hover:bg-[#E55B05] text-white rounded-full font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"><Plus size={16} className="mr-2" /> Upload</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8">
                <AnimatePresence>
                    {uploadState.isUploading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, height: 0 }}
                            animate={{ opacity: 1, scale: 1, height: 'auto' }}
                            exit={{ opacity: 0, scale: 0.9, height: 0 }}
                            className="relative mb-6 rounded-2xl overflow-hidden bg-black/10 shadow-2xl min-h-37.5 md:min-h-75 mt-6 border border-[#FA6D16]/30 flex flex-col items-center justify-center"
                        >
                            <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-300 pointer-events-none" style={{ backgroundImage: `url(${uploadState.preview})`, filter: `blur(${Math.max(0, 20 - (uploadState.progress / 5))}px) brightness(0.5)` }} />
                            <div className="absolute bottom-0 left-0 w-full bg-[#FA6D16]/70 backdrop-blur-sm z-10" style={{ height: `${uploadState.progress}%` }} />
                            <div className="relative z-20 flex flex-col items-center gap-2 md:gap-4 mt-6 mb-6">
                                <div className="text-white text-3xl md:text-5xl font-black drop-shadow-2xl flex items-baseline">{uploadState.progress}<span className="text-lg md:text-xl">%</span></div>
                                <button onClick={cancelUpload} className="mt-2 bg-white/20 hover:bg-red-500 text-white p-2 md:p-3 rounded-full backdrop-blur-md border border-white/20 shadow-2xl"><X size={16} /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- GRID VIEW --- */}
            <div className={`${mobileViewMode === 'grid' || !isMobile ? 'block' : 'hidden'} w-full max-w-[1800px] mx-auto px-4 md:px-8 pb-16 pt-6`}>
                <div className="columns-1 sm:columns-[14rem] lg:columns-[22rem] xl:columns-[26rem] gap-4 md:gap-6 space-y-4 md:space-y-6">
                    {mediaItems.map((item, index) => (
                        <MasonryCard
                            key={item._id} item={item} index={index % 15} activeGodMode={isSuperAdmin} setDeletingId={setDeletingId} onUpdate={handleUpdateField} onClick={(item) => setSelectedMedia(item)} isGlobalMuted={isGlobalMuted} setIsGlobalMuted={setIsGlobalMuted} isMobile={isMobile} activeVideoId={activeVideoId} setActiveVideoId={setActiveVideoId} onRegisterView={handleRegisterView}
                        />
                    ))}

                    {/* NEW: YouTube-Style Masonry Shimmer skeletons replacing the old spinner */}
                    {(isLoading || isFetchingMore) && [300, 450, 250, 350, 400].map((h, i) => (
                        <div key={`shimmer-grid-${i}`} className="w-full break-inside-avoid mb-4 md:mb-6 rounded-xl md:rounded-2xl bg-muted/30 dark:bg-zinc-800/40 animate-pulse" style={{ height: `${h}px` }} />
                    ))}
                </div>

                {hasMore && <div ref={mobileViewMode === 'grid' || !isMobile ? observerTarget : null} className="w-full py-4 flex justify-center items-center"></div>}
            </div>

            {/* --- MOBILE SWIPE VIEW --- */}
            <div className={`${mobileViewMode === 'swipe' && isMobile ? 'flex' : 'hidden'} w-full flex-col overflow-y-scroll snap-y snap-mandatory h-[calc(100dvh-4.5rem)] bg-black mt-0 scrollbar-none`}>
                {mediaItems.map((item) => (
                    <MobileSwipeCard key={item._id} item={item} isGlobalMuted={isGlobalMuted} setIsGlobalMuted={setIsGlobalMuted} onRegisterView={handleRegisterView} />
                ))}

                {hasMore && (
                    <div ref={mobileViewMode === 'swipe' && isMobile ? observerTarget : null} className="w-full shrink-0 snap-start bg-black">
                        {/* NEW: YouTube-Style Fullscreen Swipe Shimmer skeleton replacing the old spinner */}
                        {(isLoading || isFetchingMore) ? (
                            <div className="w-full h-[calc(100dvh-4.5rem)] relative flex items-center justify-center overflow-hidden animate-pulse bg-zinc-900/20">
                                <div className="absolute top-6 left-6 w-24 h-8 bg-zinc-800/80 rounded-full"></div>
                                <div className="absolute top-6 right-6 flex flex-col gap-4">
                                    <div className="w-11 h-11 bg-zinc-800/80 rounded-full"></div>
                                    <div className="w-11 h-11 bg-zinc-800/80 rounded-full"></div>
                                    <div className="w-11 h-11 bg-zinc-800/80 rounded-full"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-32 w-full bg-transparent"></div>
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedMedia && <Lightbox item={selectedMedia} onClose={() => setSelectedMedia(null)} activeGodMode={isSuperAdmin} onUpdate={handleUpdateField} isGlobalMuted={isGlobalMuted} setIsGlobalMuted={setIsGlobalMuted} onRegisterView={handleRegisterView} />}
            </AnimatePresence>

            <AnimatePresence>
                {deletingId && (
                    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/65 backdrop-blur-md p-4" onClick={() => setDeletingId(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-900 border border-white/10 rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6"><AlertTriangle size={32} /></div>
                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3">Wipe Content?</h3>
                            <div className="flex gap-4 mt-8">
                                <Button variant="outline" className="w-full rounded-xl bg-transparent border-white/20 text-white" onClick={() => setDeletingId(null)}>Cancel</Button>
                                <Button className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white border-none" onClick={confirmWipeItem}>Delete</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}