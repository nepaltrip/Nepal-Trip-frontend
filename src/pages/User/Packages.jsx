import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { MapPin, Clock, IndianRupee, Info, Filter, X, ChevronLeft, ChevronRight, LayoutGrid, GalleryHorizontalEnd, Sparkles, Check, Trash2, Plus, RotateCcw, AlertTriangle, Loader2, Settings2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { InlineEditor } from "../../components/admin/InlineEditor";
import SEO from "../../components/site/SEO";

const TIERS = ["All", "Gold", "Platinum"];

const getTierBadgeStyle = (tier) => {
    if (tier === 'Gold') return "bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 text-yellow-950 border-amber-300/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]";
    if (tier === 'Platinum') return "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 text-slate-900 border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.3)]";
    return "bg-slate-200 text-slate-800 border-slate-300";
};
const getTierTextStyle = (tier) => {
    if (tier === 'Gold') return "text-amber-500 drop-shadow-sm font-bold";
    if (tier === 'Platinum') return "text-slate-600 drop-shadow-sm font-bold";
    return "text-foreground font-medium";
};
const getTierIconColor = (tier) => {
    if (tier === 'Gold') return "fill-amber-600 text-amber-600";
    if (tier === 'Platinum') return "fill-slate-600 text-slate-600";
    return "fill-slate-500 text-slate-500";
};

// --- Seamless Buttery Loop Media Component ---
const SeamlessMedia = ({ src, className }) => {
    const videoRef = useRef(null);
    const [mediaType, setMediaType] = useState(null);

    useEffect(() => {
        if (!src) { setMediaType(null); return; }

        const explicitImageExt = /\.(jpe?g|png|gif|webp|svg|avif|bmp)(\?.*)?$/i;
        const explicitVideoExt = /\.(mp4|webm|ogg|ogv|mov|m4v|mkv|avi|3gp|flv|wmv)(\?.*)?$/i;

        if (explicitImageExt.test(src)) { setMediaType('image'); return; }
        if (explicitVideoExt.test(src)) { setMediaType('video'); return; }

        setMediaType('detecting');
        let cancelled = false;
        const probe = document.createElement('video');
        probe.muted = true;
        probe.preload = 'metadata';
        probe.src = src;

        const onOk = () => { if (!cancelled) setMediaType('video'); cleanup(); };
        const onFail = () => { if (!cancelled) setMediaType('image'); cleanup(); };
        const cleanup = () => {
            probe.removeEventListener('loadedmetadata', onOk);
            probe.removeEventListener('error', onFail);
            probe.src = '';
        };

        probe.addEventListener('loadedmetadata', onOk);
        probe.addEventListener('error', onFail);

        return () => { cancelled = true; cleanup(); };
    }, [src]);

    const handleTimeUpdate = (e) => {
        const vid = e.target;
        if (vid.duration && vid.duration - vid.currentTime < 0.25) {
            vid.style.transition = "opacity 0.25s ease";
            vid.style.opacity = "0.7";
        } else if (vid.currentTime < 0.5) {
            vid.style.transition = "opacity 0.25s ease";
            vid.style.opacity = "1";
        }
    };

    if (mediaType === 'video') {
        return (
            <video
                key={src}
                ref={videoRef}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                className={`${className} object-cover`}
                onError={() => { setMediaType('image'); }}
            />
        );
    }

    if (mediaType === 'image') {
        return (
            <img
                key={src}
                src={src}
                className={`${className} object-cover`}
                alt="Media"
                onError={(e) => { e.target.src = "https://placehold.co/800x1200/1a1a1a/4a4a4a?text=Invalid+Media+Link"; }}
            />
        );
    }

    return <div className={`${className} bg-black/20 animate-pulse`} />;
};

// --- Live Media Preview Editor (Instant Update) ---
const LiveMediaEditor = ({ initialValue, onSave, onLivePreview }) => {
    const [val, setVal] = useState(initialValue);

    useEffect(() => { setVal(initialValue); }, [initialValue]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setVal(newVal);
        onLivePreview(newVal);
    };

    const handleSave = () => {
        if (val !== initialValue) onSave(val);
    };

    const handleCancel = () => {
        setVal(initialValue);
        onLivePreview(initialValue);
    };

    return (
        <div className="flex items-center gap-1 bg-black/40 rounded border border-white/20 p-0.5 transition-colors focus-within:border-primary/50">
            <input
                className="bg-transparent text-white text-[10px] w-full outline-none px-1 py-0.5 placeholder:text-white/30"
                value={val}
                onChange={handleChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                placeholder="Paste media URL..."
            />
            {val !== initialValue && (
                <div className="flex items-center gap-1 pr-1 animate-in fade-in zoom-in duration-200">
                    <button onClick={handleSave} className="text-green-400 hover:scale-110 transition-transform p-0.5 bg-green-400/10 rounded" title="Save"><Check size={12} /></button>
                    <button onClick={handleCancel} className="text-red-400 hover:scale-110 transition-transform p-0.5 bg-red-400/10 rounded" title="Cancel"><X size={12} /></button>
                </div>
            )}
        </div>
    );
};

// --- Inline Textarea Editor ---
const InlineTextareaEditor = ({ initialValue, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [val, setVal] = useState(initialValue);

    useEffect(() => { setVal(initialValue); }, [initialValue]);

    const handleSave = () => {
        if (val !== initialValue) onSave(val);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setVal(initialValue);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="cursor-pointer hover:ring-2 ring-primary/50 rounded px-1 -mx-1 transition-all" title="Edit Description">
                {initialValue || "Add short description..."}
            </div>
        );
    }

    return (
        <div className="relative flex flex-col bg-black/60 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-xl w-full" onClick={e => e.stopPropagation()}>
            <textarea
                autoFocus
                className="bg-transparent text-white text-sm md:text-base outline-none resize-none placeholder:text-white/40 w-full"
                rows={3}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') handleCancel(); }}
                placeholder="Type your package description here..."
            />
            <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={handleSave} className="flex items-center justify-center text-green-400 hover:scale-110 transition-transform p-1.5 bg-green-400/10 hover:bg-green-400/20 rounded-md" title="Save"><Check size={16} /></button>
                <button onClick={handleCancel} className="flex items-center justify-center text-red-400 hover:scale-110 transition-transform p-1.5 bg-red-400/10 hover:bg-red-400/20 rounded-md" title="Cancel"><X size={16} /></button>
            </div>
        </div>
    );
};

// --- Continuous 3D Cylinder Card Component ---
const CylinderCard = ({ pkg, index, activeIndex, dragX, onNavigate, isDragging, activeGodMode, deletingId, setDeletingId, confirmDelete, onUpdate }) => {
    const PAGE_WIDTH = typeof window !== 'undefined' ? (window.innerWidth < 768 ? window.innerWidth : 800) : 400;

    const localX = useTransform(activeIndex, (latest) => (index - latest) * PAGE_WIDTH);
    const absoluteX = useTransform([dragX, activeIndex], ([$drag, $active]) => $drag + (index - $active) * PAGE_WIDTH);
    const rotateY = useTransform(absoluteX, [-PAGE_WIDTH, 0, PAGE_WIDTH], [-35, 0, 35]);
    const z = useTransform(absoluteX, [-PAGE_WIDTH, 0, PAGE_WIDTH], [-100, 0, -100]);
    const scale = useTransform(absoluteX, [-PAGE_WIDTH, 0, PAGE_WIDTH], [0.85, 1, 0.85]);
    const opacity = useTransform(absoluteX, [-PAGE_WIDTH, -PAGE_WIDTH / 2, 0, PAGE_WIDTH / 2, PAGE_WIDTH], [0, 0.7, 1, 0.7, 0]);

    const [liveDesktop, setLiveDesktop] = useState(pkg.cover_image_desktop);
    const [liveMobile, setLiveMobile] = useState(pkg.cover_image_mobile);

    useEffect(() => { setLiveDesktop(pkg.cover_image_desktop); }, [pkg.cover_image_desktop]);
    useEffect(() => { setLiveMobile(pkg.cover_image_mobile); }, [pkg.cover_image_mobile]);

    return (
        <motion.div
            style={{ x: localX, rotateY, z, scale, opacity, transformStyle: "preserve-3d" }}
            className="absolute inset-0 m-auto w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl bg-black group"
            onClick={(e) => {
                if (isDragging.current) { e.preventDefault(); return; }
                onNavigate(pkg, false);
            }}
        >
            {activeGodMode && (
                <>
                    <AnimatePresence>
                        {deletingId === pkg._id ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="absolute top-4 right-4 z-50 bg-black/90 backdrop-blur-lg border border-red-500/30 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 w-56"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-2 text-white">
                                    <AlertTriangle size={18} className="text-red-500" />
                                    <span className="text-sm font-bold">Delete Package?</span>
                                </div>
                                <div className="flex gap-2 w-full mt-1">
                                    <Button size="sm" variant="ghost" className="w-full h-8 text-xs text-white/70 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>Cancel</Button>
                                    <Button size="sm" className="w-full h-8 text-xs bg-red-500 hover:bg-red-600 text-white" onClick={(e) => { e.stopPropagation(); confirmDelete(pkg._id); }}>Delete</Button>
                                </div>
                            </motion.div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setDeletingId(pkg._id); }}
                                className="absolute top-6 right-6 z-50 bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"
                                title="Delete Package"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </AnimatePresence>

                    <div className="absolute top-6 right-20 z-40 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 shadow-xl max-w-60" onClick={e => e.stopPropagation()}>
                        <p className="text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Settings2 size={12} /> Media Setup</p>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white/60 text-[10px]">Desktop (Landscape):</span>
                            <LiveMediaEditor initialValue={pkg.cover_image_desktop} onLivePreview={setLiveDesktop} onSave={(val) => onUpdate(pkg._id, "cover_image_desktop", val)} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white/60 text-[10px]">Mobile (Portrait):</span>
                            <LiveMediaEditor initialValue={pkg.cover_image_mobile} onLivePreview={setLiveMobile} onSave={(val) => onUpdate(pkg._id, "cover_image_mobile", val)} />
                        </div>
                    </div>
                </>
            )}

            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-90 transition-transform duration-700 group-hover:scale-105">
                <div className="hidden md:block w-full h-full"><SeamlessMedia src={liveDesktop} className="w-full h-full" /></div>
                <div className="block md:hidden w-full h-full"><SeamlessMedia src={liveMobile} className="w-full h-full" /></div>
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 flex flex-col justify-end transform-gpu">
                <div className="flex flex-wrap gap-2 mb-3 md:mb-4 pointer-events-auto">
                    {(pkg.serviceTier !== "All" || activeGodMode) && (
                        <span className={`px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 border ${getTierBadgeStyle(pkg.serviceTier)}`} onClick={e => e.stopPropagation()}>
                            <Sparkles size={14} className={getTierIconColor(pkg.serviceTier)} />
                            {activeGodMode ? <InlineEditor value={pkg.serviceTier} onSave={(val) => onUpdate(pkg._id, "serviceTier", val)} /> : pkg.serviceTier}
                        </span>
                    )}

                    <span className="bg-black/50 backdrop-blur-sm text-white px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium border border-white/10 flex items-center gap-1.5 relative" onClick={e => e.stopPropagation()}>
                        <MapPin size={14} />
                        {activeGodMode ? <InlineEditor value={pkg.category} onSave={(val) => onUpdate(pkg._id, "category", val)} /> : pkg.category}
                    </span>
                </div>

                <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight drop-shadow-md pointer-events-auto" onClick={e => e.stopPropagation()}>
                    {activeGodMode ? <InlineEditor value={pkg.title} onSave={(val) => onUpdate(pkg._id, "title", val)} /> : pkg.title}
                </h2>

                <div className="text-white/80 text-sm md:text-lg mb-5 md:mb-8 leading-snug max-w-3xl drop-shadow-sm pointer-events-auto">
                    {activeGodMode ? <InlineTextareaEditor initialValue={pkg.short_description} onSave={(val) => onUpdate(pkg._id, "short_description", val)} /> : <div className="line-clamp-2 md:line-clamp-3">{pkg.short_description}</div>}
                </div>

                <div className="flex flex-col" onClick={e => e.stopPropagation()}>
                    <span className="text-white/60 text-[10px] md:text-sm font-medium uppercase tracking-wider">
                        {activeGodMode ? <InlineEditor value={pkg.destination} onSave={(val) => onUpdate(pkg._id, "destination", val)} /> : pkg.destination}
                    </span>
                    <div className="flex items-center text-white font-bold text-xl md:text-3xl drop-shadow-sm mt-0.5">
                        <IndianRupee size={24} className="mr-0.5 md:mr-1" strokeWidth={2.5} />
                        {activeGodMode ? (
                            pkg.serviceTier === "Platinum" ? (
                                <InlineEditor
                                    value={pkg.price_platinum || 0}
                                    onSave={(val) => onUpdate(pkg._id, "price_platinum", Number(val))}
                                />
                            ) : (
                                <InlineEditor
                                    value={pkg.price_gold || 0}
                                    onSave={(val) => onUpdate(pkg._id, "price_gold", Number(val))}
                                />
                            )
                        ) : (
                            pkg.serviceTier === "Platinum"
                                ? (pkg.price_platinum?.toLocaleString('en-IN') || 0)
                                : (pkg.price_gold?.toLocaleString('en-IN') || 0)
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Standard Grid Card Component ---
const GridCard = ({ pkg, idx, onNavigate, activeGodMode, deletingId, setDeletingId, confirmDelete, onUpdate, onHoverActive }) => {
    const [liveDesktop, setLiveDesktop] = useState(pkg.cover_image_desktop);
    const [liveMobile, setLiveMobile] = useState(pkg.cover_image_mobile);

    useEffect(() => { setLiveDesktop(pkg.cover_image_desktop); }, [pkg.cover_image_desktop]);
    useEffect(() => { setLiveMobile(pkg.cover_image_mobile); }, [pkg.cover_image_mobile]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            onClick={() => onNavigate(pkg, false)}
            onMouseEnter={() => onHoverActive && onHoverActive(pkg)}
            onMouseLeave={() => onHoverActive && onHoverActive(null)}
            className="cursor-pointer group bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
        >
            {activeGodMode && (
                <>
                    <AnimatePresence>
                        {deletingId === pkg._id ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="absolute top-4 right-4 z-50 bg-black/90 backdrop-blur-lg border border-red-500/30 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 w-56"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-2 text-white">
                                    <AlertTriangle size={18} className="text-red-500" />
                                    <span className="text-sm font-bold">Delete Package?</span>
                                </div>
                                <div className="flex gap-2 w-full mt-1">
                                    <Button size="sm" variant="ghost" className="w-full h-8 text-xs text-white/70 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>Cancel</Button>
                                    <Button size="sm" className="w-full h-8 text-xs bg-red-500 hover:bg-red-600 text-white" onClick={(e) => { e.stopPropagation(); confirmDelete(pkg._id); }}>Delete</Button>
                                </div>
                            </motion.div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setDeletingId(pkg._id); }}
                                className="absolute top-4 right-4 z-50 bg-red-500/90 hover:bg-red-600 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </AnimatePresence>

                    <div className="absolute top-4 right-16 z-40 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 shadow-xl max-w-50" onClick={e => e.stopPropagation()}>
                        <p className="text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Settings2 size={12} /> Media Setup</p>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white/60 text-[10px]">Desktop (Landscape):</span>
                            <LiveMediaEditor initialValue={pkg.cover_image_desktop} onLivePreview={setLiveDesktop} onSave={(val) => onUpdate(pkg._id, "cover_image_desktop", val)} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white/60 text-[10px]">Mobile (Portrait):</span>
                            <LiveMediaEditor initialValue={pkg.cover_image_mobile} onLivePreview={setLiveMobile} onSave={(val) => onUpdate(pkg._id, "cover_image_mobile", val)} />
                        </div>
                    </div>
                </>
            )}

            <div className="relative h-56 w-full overflow-hidden pointer-events-none">
                <div className="hidden md:block w-full h-full"><SeamlessMedia src={liveDesktop} className="w-full h-full transition-transform duration-700 group-hover:scale-110" /></div>
                <div className="block md:hidden w-full h-full"><SeamlessMedia src={liveMobile} className="w-full h-full transition-transform duration-700 group-hover:scale-110" /></div>
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                <div className="absolute top-4 left-4 flex flex-col gap-2 items-start pointer-events-auto" onClick={e => e.stopPropagation()}>
                    <span className="bg-background/90 backdrop-blur text-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-border/50">
                        {activeGodMode ? <InlineEditor value={pkg.category} onSave={(val) => onUpdate(pkg._id, "category", val)} /> : pkg.category}
                    </span>
                    {(pkg.serviceTier !== "All" || activeGodMode) && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${getTierBadgeStyle(pkg.serviceTier)}`}>
                            <Sparkles size={12} className={getTierIconColor(pkg.serviceTier)} />
                            {activeGodMode ? <InlineEditor value={pkg.serviceTier} onSave={(val) => onUpdate(pkg._id, "serviceTier", val)} /> : pkg.serviceTier}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col pointer-events-auto">
                <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2" onClick={e => e.stopPropagation()}>
                    <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-primary" />
                        {activeGodMode ? <InlineEditor value={pkg.destination} onSave={(val) => onUpdate(pkg._id, "destination", val)} /> : pkg.destination}
                    </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors" onClick={e => e.stopPropagation()}>
                    {activeGodMode ? <InlineEditor value={pkg.title} onSave={(val) => onUpdate(pkg._id, "title", val)} /> : pkg.title}
                </h3>

                <div className="text-muted-foreground text-sm mb-6 flex-1 relative z-10" onClick={e => e.stopPropagation()}>
                    {activeGodMode ? <InlineTextareaEditor initialValue={pkg.short_description} onSave={(val) => onUpdate(pkg._id, "short_description", val)} /> : <div className="line-clamp-2">{pkg.short_description}</div>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto pointer-events-none">
                    <div className="pointer-events-auto" onClick={e => e.stopPropagation()}>
                        <span className="text-xs text-muted-foreground font-medium uppercase">From</span>
                        <div className="text-lg font-bold text-foreground flex items-center">
                            <IndianRupee size={16} strokeWidth={2.5} />
                            {activeGodMode ? (
                                pkg.serviceTier === "Platinum" ? (
                                    <InlineEditor
                                        value={pkg.price_platinum || 0}
                                        onSave={(val) => onUpdate(pkg._id, "price_platinum", Number(val))}
                                    />
                                ) : (
                                    <InlineEditor
                                        value={pkg.price_gold || 0}
                                        onSave={(val) => onUpdate(pkg._id, "price_gold", Number(val))}
                                    />
                                )
                            ) : (
                                pkg.serviceTier === "Platinum"
                                    ? (pkg.price_platinum?.toLocaleString('en-IN') || 0)
                                    : (pkg.price_gold?.toLocaleString('en-IN') || 0)
                            )}
                        </div>
                    </div>
                    <div className="text-primary text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all pointer-events-auto">
                        View <ChevronRight size={16} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function Packages() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isSuperAdmin = isAuthenticated && user?.role === "SuperAdmin";

    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [packages, setPackages] = useState([]);

    const [isDesktop, setIsDesktop] = useState(true);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const activeGodMode = isSuperAdmin && isDesktop;

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedTier, setSelectedTier] = useState("All");
    const [viewMode, setViewMode] = useState("immersive");

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isTierOpen, setIsTierOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasSwiped, setHasSwiped] = useState(false);

    const [hoveredGridPkg, setHoveredGridPkg] = useState(null);

    const dynamicCategories = ["All", ...new Set(packages.map(p => p.category).filter(Boolean))];

    const [deletingId, setDeletingId] = useState(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);

    const dragX = useMotionValue(0);
    const activeIndex = useMotionValue(0);

    const filterRef = useRef(null);
    const tierRef = useRef(null);
    const cardContainerRef = useRef(null);
    const wheelTimeout = useRef(null);
    const isDragging = useRef(false);

    useEffect(() => {
        // ✨ REMOVED document.title from here
        const timer = setTimeout(() => setIsMounted(true), 50);

        const fetchPackages = async () => {
            try {
                const { data } = await api.get('/packages');
                setPackages(data);
            } catch (error) {
                toast.error("Failed to load packages");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPackages();
        return () => clearTimeout(timer);
    }, []);

    const filteredPackages = packages.filter(pkg => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            pkg.title?.toLowerCase().includes(query) ||
            pkg.destination?.toLowerCase().includes(query) ||
            pkg.category?.toLowerCase().includes(query) ||
            pkg.short_description?.toLowerCase().includes(query) ||
            pkg.price_inr?.toString().includes(query);

        const matchesCategory = selectedCategory === "All" || pkg.category === selectedCategory;
        const matchesTier = selectedTier === "All" || pkg.serviceTier === selectedTier;

        return matchesSearch && matchesCategory && matchesTier;
    });

    // ✨ HEARTBEAT LOOP: Track Outside attention windows continuously (Every 5 seconds)
    useEffect(() => {
        if (isLoading || filteredPackages.length === 0) return;

        const emitAttentionPulse = async () => {
            let activePkg = null;
            if (viewMode === 'immersive') {
                activePkg = filteredPackages[currentIndex];
            } else if (viewMode === 'grid') {
                activePkg = hoveredGridPkg;
            }

            if (!activePkg) return;

            try {
                const visitorId = localStorage.getItem('nt_visitor_id') || 'anonymous_fallback';
                await api.post(`/packages/${activePkg._id}/telemetry`, {
                    visitorId,
                    actionType: 'outside_hover',
                    tier: 'None',
                    durationSeconds: 5,
                    packageName: activePkg.title,
                    category: activePkg.category,
                    isClick: false
                });
            } catch (err) {
                console.error("Failed executing background telemetry sync", err);
            }
        };

        const interval = setInterval(emitAttentionPulse, 5000);
        return () => clearInterval(interval);
    }, [currentIndex, hoveredGridPkg, viewMode, isLoading, packages]);

    // ✨ Click Analytics Trigger Integration
    const trackAndNavigate = (pkg, explicitDetailsClick = false) => {
        const visitorId = localStorage.getItem('nt_visitor_id') || 'anonymous_fallback';
        api.post(`/packages/${pkg._id}/telemetry`, {
            visitorId,
            actionType: explicitDetailsClick ? 'inside_detail' : 'outside_hover',
            tier: 'None',
            durationSeconds: 0,
            packageName: pkg.title,
            category: pkg.category,
            isClick: true
        }).catch(err => console.error("Click log delivery failure", err));

        navigate(`/packages/${pkg.slug}`);
    };

    useEffect(() => {
        setCurrentIndex(0);
        animate(dragX, 0, { duration: 0 });
    }, [searchQuery, selectedCategory, selectedTier, viewMode, dragX]);

    useEffect(() => {
        animate(activeIndex, currentIndex, { type: "spring", stiffness: 300, damping: 30 });
    }, [currentIndex, activeIndex]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
            if (tierRef.current && !tierRef.current.contains(event.target)) setIsTierOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 40) {
                setIsScrolled(true);
                setIsFilterOpen(false);
                setIsTierOpen(false);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const container = cardContainerRef.current;
        if (!container || viewMode !== "immersive") return;
        const preventBrowserSwipe = (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault();
        };
        container.addEventListener("wheel", preventBrowserSwipe, { passive: false });
        return () => container.removeEventListener("wheel", preventBrowserSwipe);
    }, [isLoading, viewMode]);

    const paginate = (newDirection) => {
        if (newDirection === 1 && currentIndex >= filteredPackages.length - 1) return;
        if (newDirection === -1 && currentIndex <= 0) return;
        setHasSwiped(true);
        setCurrentIndex((prev) => prev + newDirection);
    };

    const handleDragEnd = (e, { offset }) => {
        setTimeout(() => { isDragging.current = false; }, 100);
        const PAGE_WIDTH = window.innerWidth < 768 ? window.innerWidth : 800;
        const swipeThreshold = PAGE_WIDTH * 0.2;

        if (offset.x < -swipeThreshold && currentIndex < filteredPackages.length - 1) {
            paginate(1);
        } else if (offset.x > swipeThreshold && currentIndex > 0) {
            paginate(-1);
        }
        animate(dragX, 0, { type: "spring", stiffness: 300, damping: 30 });
    };

    const handleWheel = (e) => {
        if (wheelTimeout.current || viewMode !== "immersive") return;
        const swipeThreshold = 30;
        if (e.deltaX > swipeThreshold) { paginate(1); lockWheel(); }
        else if (e.deltaX < -swipeThreshold) { paginate(-1); lockWheel(); }
    };

    const lockWheel = () => {
        wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 800);
    };

    const handleInstantCreate = async () => {
        try {
            const { data } = await api.post('/packages');
            setPackages([data, ...packages]);
            toast.success("Package draft generated! Edit directly on the card.");
        } catch (error) {
            toast.error("Could not create package.");
        }
    };

    const handleUpdatePackage = async (id, field, value) => {
        let finalValue = value;

        if (field === "serviceTier") {
            const cleanStr = String(value).trim().toLowerCase();
            if (cleanStr === 'platinum') finalValue = 'Platinum';
            else if (cleanStr === 'all') finalValue = 'All';
            else finalValue = 'Gold';
        }

        setPackages(prev => prev.map(p => p._id === id ? { ...p, [field]: finalValue } : p));

        try {
            await api.put(`/packages/${id}`, { [field]: finalValue });
        } catch (error) {
            toast.error("Failed to save changes.");
        }
    };

    const confirmDeletePackage = async (id) => {
        try {
            await api.delete(`/packages/${id}`);
            setPackages(packages.filter(p => p._id !== id));
            toast.success("Package permanently deleted.");
            setDeletingId(null);
        } catch (error) {
            toast.error("Could not delete package.");
        }
    };

    const handleRestoreDefaults = async () => {
        setIsRestoring(true);
        try {
            await api.post('/packages/restore-defaults');
            toast.success("Demo packages restored successfully!");
            setShowRestoreModal(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            toast.error("Failed to restore defaults.");
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <>
            {/* ✨ NEW SEO COMPONENT ✨ */}
            <SEO
                title="All Tour Packages | Nepal Trip"
                description="Browse our complete list of handpicked Nepal tour packages, from standard itineraries to luxury platinum experiences."
                url="https://nepaltrip.in/packages"
            />

            <div className={`w-full transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className={`w-full bg-background min-h-[calc(100dvh-4rem)] flex flex-col pt-2 pb-6 md:pb-4 md:pt-6 font-sans relative animate-in fade-in duration-700 ${viewMode === 'immersive' ? 'overflow-hidden items-center' : ''}`}>

                    {viewMode === 'immersive' && (
                        <style>{`@media (max-width: 767px) { footer { display: none !important; } }`}</style>
                    )}

                    <motion.div
                        animate={{ y: isScrolled && viewMode === 'immersive' ? -100 : 0, opacity: isScrolled && viewMode === 'immersive' ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                        className={`w-full max-w-full md:max-w-5xl px-4 flex justify-between items-center z-50 mb-6 md:mb-6 ${viewMode === 'grid' ? 'mx-auto' : ''}`}
                    >
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-foreground drop-shadow-sm tracking-tight">Explore</h1>
                            <p className="text-muted-foreground text-xs md:text-base font-medium">
                                {filteredPackages.length} {filteredPackages.length === 1 ? 'trip' : 'trips'} found
                            </p>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 relative">
                            <div ref={tierRef}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setIsTierOpen(!isTierOpen); setIsFilterOpen(false); }}
                                    className={`cursor-pointer flex items-center gap-1.5 p-2 md:px-4 md:py-2.5 rounded-full font-bold text-xs md:text-sm border transition-colors ${selectedTier !== "All" ? getTierBadgeStyle(selectedTier) : "bg-card border-border shadow-sm text-foreground hover:bg-muted"}`}
                                >
                                    {isTierOpen ? <X size={16} /> : <Sparkles size={16} className={selectedTier !== "All" ? getTierIconColor(selectedTier) : ""} />}
                                    <span className="hidden sm:inline">{selectedTier === "All" ? "Service Tier" : `${selectedTier} Service`}</span>
                                </motion.button>
                                <AnimatePresence>
                                    {isTierOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-[calc(100%+12px)] right-0 w-60 bg-card border border-border p-2 rounded-2xl shadow-xl flex flex-col gap-1 z-100"
                                        >
                                            <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-1">Select Service Level</div>
                                            {TIERS.map(tier => (
                                                <button
                                                    key={tier}
                                                    onClick={() => { setSelectedTier(tier); setIsTierOpen(false); }}
                                                    className={`cursor-pointer flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-colors ${selectedTier === tier ? "bg-primary/10" : "hover:bg-muted"} ${getTierTextStyle(tier)}`}
                                                >
                                                    {tier === "All" ? "All Packages" : `${tier} Service`}
                                                    {selectedTier === tier && <Check size={16} className={getTierTextStyle(tier)} />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div ref={filterRef}>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => { setIsFilterOpen(!isFilterOpen); setIsTierOpen(false); }}
                                    className={`cursor-pointer w-9 h-9 md:w-11 md:h-11 border shadow-sm rounded-full transition-colors flex items-center justify-center ${searchQuery || selectedCategory !== "All" ? "bg-primary text-white border-primary" : "bg-card border-border text-foreground hover:bg-muted"}`}
                                >
                                    {isFilterOpen ? <X size={18} /> : <Filter size={16} />}
                                </motion.button>
                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-[calc(100%+12px)] right-0 w-[calc(100vw-32px)] sm:w-[320px] max-w-90 bg-card border border-border p-4 rounded-2xl shadow-xl flex flex-col gap-4 z-100"
                                        >
                                            <div>
                                                <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Universal Search</label>
                                                <Input type="search" placeholder="E.g., Maldives, Beach, 45000..." className="w-full h-10 text-sm rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Categories</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {dynamicCategories.map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setSelectedCategory(cat)}
                                                            className={`cursor-pointer rounded-full px-3 py-1 text-xs md:text-sm font-medium transition-colors ${selectedCategory === cat ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"}`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
                                <button onClick={() => setViewMode("immersive")} className={`cursor-pointer p-1.5 rounded-full transition-all ${viewMode === "immersive" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}><GalleryHorizontalEnd size={18} /></button>
                                <button onClick={() => setViewMode("grid")} className={`cursor-pointer p-1.5 rounded-full transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid size={18} /></button>
                            </div>
                        </div>
                    </motion.div>

                    {isLoading ? null : (
                        <>
                            {activeGodMode && viewMode === "immersive" && (
                                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50">
                                    <button onClick={handleInstantCreate} className="flex items-center gap-2 bg-[#FA6D16] cursor-pointer text-white px-6 py-2 rounded-full font-bold shadow-xl hover:scale-105 transition-transform border border-white/20">
                                        <Plus size={18} /> Add New Package
                                    </button>
                                </div>
                            )}

                            {viewMode === "immersive" && (
                                <div className="flex-1 w-full max-w-full md:max-w-5xl relative z-10 px-3 md:px-0 mx-auto">
                                    <div
                                        ref={cardContainerRef}
                                        onWheel={handleWheel}
                                        style={{ perspective: "1000px" }}
                                        className="relative w-full h-[calc(100dvh-16rem)] my-4 md:my-0 min-h-100 max-h-200 md:h-[65vh] md:min-h-125 md:max-h-187.5 overflow-hidden flex items-center justify-center overscroll-x-none"
                                    >
                                        <motion.div
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            dragElastic={1}
                                            style={{ x: dragX, transformStyle: "preserve-3d" }}
                                            onDragStart={() => { isDragging.current = true; setHasSwiped(true); }}
                                            onDragEnd={handleDragEnd}
                                            className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
                                        >
                                            {filteredPackages.map((pkg, i) => (
                                                <CylinderCard
                                                    key={pkg._id}
                                                    pkg={pkg}
                                                    index={i}
                                                    activeIndex={activeIndex}
                                                    dragX={dragX}
                                                    onNavigate={trackAndNavigate}
                                                    isDragging={isDragging}
                                                    activeGodMode={activeGodMode}
                                                    deletingId={deletingId}
                                                    setDeletingId={setDeletingId}
                                                    confirmDelete={confirmDeletePackage}
                                                    onUpdate={handleUpdatePackage}
                                                />
                                            ))}
                                        </motion.div>

                                        {currentIndex > 0 && (
                                            <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="cursor-pointer hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all hover:bg-white/30 hover:scale-110 active:scale-95"><ChevronLeft className="w-8 h-8" /></button>
                                        )}
                                        {currentIndex < filteredPackages.length - 1 && (
                                            <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="cursor-pointer hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all hover:bg-white/30 hover:scale-110 active:scale-95"><ChevronRight className="w-8 h-8" /></button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {viewMode === "grid" && (
                                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-16 md:pb-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                        {activeGodMode && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                                onClick={handleInstantCreate}
                                                className="cursor-pointer group bg-transparent border-2 border-dashed border-primary/40 rounded-3xl overflow-hidden shadow-sm hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center min-h-100"
                                            >
                                                <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                                    <Plus size={32} className="text-primary" />
                                                </div>
                                                <h3 className="text-xl font-serif font-bold text-foreground">Add New Package</h3>
                                            </motion.div>
                                        )}

                                        {filteredPackages.map((pkg, idx) => (
                                            <GridCard
                                                key={pkg._id}
                                                pkg={pkg}
                                                idx={idx}
                                                onNavigate={trackAndNavigate}
                                                activeGodMode={activeGodMode}
                                                deletingId={deletingId}
                                                setDeletingId={setDeletingId}
                                                confirmDelete={confirmDeletePackage}
                                                onUpdate={handleUpdatePackage}
                                                onHoverActive={setHoveredGridPkg}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {activeGodMode && (
                    <>
                        <div className="fixed bottom-6 right-6 z-50">
                            <Button onClick={() => setShowRestoreModal(true)} variant="destructive" className="shadow-2xl font-bold rounded-full px-6 flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" /> Seed Demo Data
                            </Button>
                        </div>

                        <AnimatePresence>
                            {showRestoreModal && (
                                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center"
                                    >
                                        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                            <AlertTriangle className="h-8 w-8 text-red-500" />
                                        </div>
                                        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Seed Demo Packages?</h3>
                                        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                            This will overwrite everything and inject the original placeholder packages into your database.
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <Button variant="outline" onClick={() => setShowRestoreModal(false)} disabled={isRestoring} className="rounded-xl w-full">Cancel</Button>
                                            <Button onClick={handleRestoreDefaults} disabled={isRestoring} className="bg-red-500 hover:bg-red-600 text-white rounded-xl w-full flex items-center justify-center">
                                                {isRestoring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Yes, Inject Data
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </>
    );
}