import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { MapPin, Info, Mountain, Calendar, CloudSun, X, ChevronLeft, ChevronRight, LayoutGrid, GalleryHorizontalEnd, Trash2, Plus, RotateCcw, AlertTriangle, Loader2, Settings2, Check, Filter, Map as MapIcon, Images, Navigation, IndianRupee, ChevronDown } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { InlineEditor } from "../../components/admin/InlineEditor";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import CustomSelect from "../../components/ui/CustomSelect";

// --- Custom Leaflet Marker (Bigger & Clearer) ---
const getCustomIcon = (imageUrl) => {
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div style="width: 70px; height: 70px; border-radius: 12px; border: 3px solid white; box-shadow: 0 6px 14px rgba(0,0,0,0.5); overflow: hidden; background: #fff; cursor: pointer; transition: transform 0.2s;">
                <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 12px solid white; position: absolute; bottom: -11px; left: 50%; transform: translateX(-50%); drop-shadow(0 4px 4px rgba(0,0,0,0.3));"></div>
        `,
        iconSize: [70, 82],
        iconAnchor: [35, 82]
    });
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

    if (mediaType === 'video') return <video key={src} ref={videoRef} src={src} autoPlay muted loop playsInline onTimeUpdate={handleTimeUpdate} className={`${className} object-cover`} onError={() => setMediaType('image')} />;
    if (mediaType === 'image') return <img key={src} src={src} className={`${className} object-cover`} alt="Media" onError={(e) => { e.target.src = "https://placehold.co/800x1200/1a1a1a/4a4a4a?text=Invalid+Media+Link"; }} />;
    return <div className={`${className} bg-black/20 animate-pulse`} />;
};

// --- Live Media Preview Editor ---
const LiveMediaEditor = ({ initialValue, onSave, onLivePreview }) => {
    const [val, setVal] = useState(initialValue);
    useEffect(() => { setVal(initialValue); }, [initialValue]);

    const handleChange = (e) => { setVal(e.target.value); onLivePreview(e.target.value); };
    const handleSave = () => { if (val !== initialValue) onSave(val); };
    const handleCancel = () => { setVal(initialValue); onLivePreview(initialValue); };

    return (
        <div className="flex items-center gap-1 bg-black/60 rounded border border-white/20 p-0.5 transition-colors focus-within:border-emerald-500/50">
            <input className="bg-transparent text-white text-[10px] w-full outline-none px-1 py-1 placeholder:text-white/30" value={val} onChange={handleChange} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }} placeholder="Paste media URL..." />
            {val !== initialValue && (
                <div className="flex items-center gap-1 pr-1 animate-in fade-in zoom-in duration-200">
                    <button onClick={handleSave} className="text-green-400 hover:scale-110 transition-transform p-1 bg-green-400/20 rounded"><Check size={12} /></button>
                    <button onClick={handleCancel} className="text-red-400 hover:scale-110 transition-transform p-1 bg-red-400/20 rounded"><X size={12} /></button>
                </div>
            )}
        </div>
    );
};

// --- Custom Package Link Dropdown Editor ---
const PackageLinkEditor = ({ initialValue, allPackages, onSave }) => {
    const [val, setVal] = useState(initialValue || "");
    const isChanged = val !== (initialValue || "");

    useEffect(() => { setVal(initialValue || ""); }, [initialValue]);

    const handleSave = () => { onSave(val); };
    const handleCancel = () => { setVal(initialValue || ""); };

    const packageOptions = [
        { value: "", label: "-- Unlinked --" },
        ...allPackages.map(p => ({ value: p._id, label: p.title }))
    ];

    return (
        <div className="flex flex-col gap-2 mt-1 w-full min-w-0">
            <CustomSelect
                name="linkedPackage"
                theme="emerald"
                options={packageOptions}
                value={val}
                onChange={(e) => setVal(e.target.value)}
            />
            {isChanged && (
                <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200 justify-end">
                    <button onClick={handleSave} className="text-green-400 p-1.5 bg-green-400/20 hover:bg-green-400/40 rounded transition-colors" title="Save Link"><Check size={14} /></button>
                    <button onClick={handleCancel} className="text-red-400 p-1.5 bg-red-400/20 hover:bg-red-400/40 rounded transition-colors" title="Cancel"><X size={14} /></button>
                </div>
            )}
        </div>
    );
};

// --- Inline Textarea Editor ---
const InlineTextareaEditor = ({ initialValue, onSave, placeholder = "Add short description..." }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [val, setVal] = useState(initialValue);

    useEffect(() => { setVal(initialValue); }, [initialValue]);
    const handleSave = () => { if (val !== initialValue) onSave(val); setIsEditing(false); };
    const handleCancel = () => { setVal(initialValue); setIsEditing(false); };

    if (!isEditing) return <div onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="cursor-pointer hover:ring-2 ring-emerald-500/50 rounded px-1 -mx-1 transition-all" title="Edit text">{initialValue || placeholder}</div>;

    return (
        <div className="relative flex flex-col bg-black/80 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-xl w-full z-50" onClick={e => e.stopPropagation()}>
            <textarea autoFocus className="bg-transparent text-white text-sm md:text-base outline-none resize-none placeholder:text-white/40 w-full" rows={4} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') handleCancel(); }} placeholder={placeholder} />
            <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={handleSave} className="flex items-center justify-center text-green-400 p-1.5 bg-green-400/20 hover:bg-green-400/40 rounded-md"><Check size={16} /></button>
                <button onClick={handleCancel} className="flex items-center justify-center text-red-400 p-1.5 bg-red-400/20 hover:bg-red-400/40 rounded-md"><X size={16} /></button>
            </div>
        </div>
    );
};

// --- Continuous 3D Cylinder Card Component ---
const CylinderCard = ({ pkg, allPackages, index, activeIndex, dragX, navigate, isDragging, activeGodMode, deletingId, setDeletingId, confirmDelete, onUpdate, onUpdateLinked }) => {
    const PAGE_WIDTH = typeof window !== 'undefined' ? (window.innerWidth < 768 ? window.innerWidth : 800) : 400;

    const localX = useTransform(activeIndex, (latest) => (index - latest) * PAGE_WIDTH);
    const absoluteX = useTransform([dragX, activeIndex], ([$drag, $active]) => $drag + (index - $active) * PAGE_WIDTH);
    const rotateY = useTransform(absoluteX, [-PAGE_WIDTH, 0, PAGE_WIDTH], [-35, 0, 35]);
    const z = useTransform(absoluteX, [-PAGE_WIDTH, 0, PAGE_WIDTH], [-100, 0, -100]);
    const scale = useTransform(absoluteX, [-PAGE_WIDTH, 0, PAGE_WIDTH], [0.85, 1, 0.85]);
    const opacity = useTransform(absoluteX, [-PAGE_WIDTH, -PAGE_WIDTH / 2, 0, PAGE_WIDTH / 2, PAGE_WIDTH], [0, 0.7, 1, 0.7, 0]);

    const [liveDesktop, setLiveDesktop] = useState(pkg.cover_image_desktop);
    const [liveMobile, setLiveMobile] = useState(pkg.cover_image_mobile);
    const [showTrivia, setShowTrivia] = useState(false);

    useEffect(() => { setLiveDesktop(pkg.cover_image_desktop); }, [pkg.cover_image_desktop]);
    useEffect(() => { setLiveMobile(pkg.cover_image_mobile); }, [pkg.cover_image_mobile]);

    // Ensure we are resolving the linked package properly
    const linkedPkgId = pkg.linkedPackage?._id || pkg.linkedPackage;
    const resolvedPackage = allPackages.find(p => p._id === linkedPkgId);

    const handleCardClick = (e) => {
        if (isDragging.current) { e.preventDefault(); return; }
        e.stopPropagation();

        // Bulletproof Slug Resolver preventing blank pages
        if (resolvedPackage && resolvedPackage.slug) {
            navigate(`/packages/${resolvedPackage.slug}`, { state: { from: 'discover', tier: 'Gold' } });
        } else if (pkg.slug && !linkedPkgId) {
            // Fallback: If it's literally just a package card acting as discover
            navigate(`/packages/${pkg.slug}`, { state: { from: 'discover', tier: 'Gold' } });
        } else {
            toast.info("This destination is not properly mapped to a valid itinerary yet.");
        }
    };

    const handleGalleryClick = (e) => {
        e.stopPropagation();
        navigate(`/gallery?destination=${encodeURIComponent(pkg.destination)}`);
    };

    return (
        <motion.div
            style={{ x: localX, rotateY, z, scale, opacity, transformStyle: "preserve-3d" }}
            className="absolute inset-0 m-auto w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl bg-black group cursor-pointer"
            onClick={handleCardClick}
        >
            {activeGodMode && (
                <>
                    <AnimatePresence>
                        {deletingId === pkg._id ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-lg border border-red-500/30 p-4 rounded-2xl flex flex-col gap-3 w-56 shadow-2xl" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-2 text-white"><AlertTriangle size={18} className="text-red-500" /><span className="text-sm font-bold">Delete Entry?</span></div>
                                <div className="flex gap-2 w-full mt-1">
                                    <Button size="sm" variant="ghost" className="w-full h-8 text-xs text-white/70 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>Cancel</Button>
                                    <Button size="sm" className="w-full h-8 text-xs bg-red-500 hover:bg-red-600 text-white" onClick={(e) => { e.stopPropagation(); confirmDelete(pkg._id); }}>Delete</Button>
                                </div>
                            </motion.div>
                        ) : (
                            <button onClick={(e) => { e.stopPropagation(); setDeletingId(pkg._id); }} className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm" title="Delete">
                                <Trash2 size={20} />
                            </button>
                        )}
                    </AnimatePresence>
                    <div className="absolute top-6 left-6 z-40 bg-black/90 backdrop-blur-md p-3 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 shadow-xl w-52" onClick={e => e.stopPropagation()}>
                        <p className="text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 border-b border-white/20 pb-1.5"><Settings2 size={12} /> God Mode Settings</p>                        <div className="flex flex-col gap-1"><span className="text-white/70 text-[10px]">Desktop Image URL:</span><LiveMediaEditor initialValue={pkg.cover_image_desktop} onLivePreview={setLiveDesktop} onSave={(val) => onUpdate(pkg._id, "cover_image_desktop", val)} /></div>
                        <div className="flex flex-col gap-1"><span className="text-white/70 text-[10px]">Mobile Image URL:</span><LiveMediaEditor initialValue={pkg.cover_image_mobile} onLivePreview={setLiveMobile} onSave={(val) => onUpdate(pkg._id, "cover_image_mobile", val)} /></div>

                        {/* Coordinate Editors */}
                        <div className="flex gap-3 mt-1 pt-2">
                            <div className="flex flex-col gap-1 w-1/2"><span className="text-emerald-400 text-[10px] font-bold">Map Lat:</span><InlineEditor value={pkg.latitude || ""} onSave={(val) => onUpdate(pkg._id, "latitude", Number(val))} /></div>
                            <div className="flex flex-col gap-1 w-1/2"><span className="text-emerald-400 text-[10px] font-bold">Map Lng:</span><InlineEditor value={pkg.longitude || ""} onSave={(val) => onUpdate(pkg._id, "longitude", Number(val))} /></div>
                        </div>

                        {/* Linking Dropdown */}
                        <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/10">
                            <span className="text-emerald-400 text-[10px] font-bold">Link to Package:</span>
                            <PackageLinkEditor initialValue={linkedPkgId} allPackages={allPackages} onSave={(val) => onUpdate(pkg._id, "linkedPackage", val)} />
                        </div>
                    </div>
                </>
            )}

            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-90 transition-transform duration-700 group-hover:scale-105">
                <div className="hidden md:block w-full h-full"><SeamlessMedia src={liveDesktop} className="w-full h-full" /></div>
                <div className="block md:hidden w-full h-full"><SeamlessMedia src={liveMobile} className="w-full h-full" /></div>
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

            {/* Floating Actions */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 pointer-events-auto flex flex-col gap-3">
                <button
                    onClick={(e) => { e.stopPropagation(); setShowTrivia(!showTrivia); }}
                    className={`p-2.5 md:p-3 backdrop-blur-md border border-white/20 text-white rounded-full shadow-lg transition-colors cursor-pointer ${showTrivia ? 'bg-emerald-600/80' : 'bg-black/30 hover:bg-black/50'}`}
                    title="Trip Info & Pricing"
                >
                    {showTrivia ? <X size={20} className="md:w-6 md:h-6" /> : <Info size={20} className="md:w-6 md:h-6" />}
                </button>
                <button
                    onClick={handleGalleryClick}
                    className="p-2.5 md:p-3 bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/20 text-white rounded-full shadow-lg transition-colors cursor-pointer group/gal"
                    title="View Media Gallery"
                >
                    <Images size={20} className="md:w-6 md:h-6 group-hover/gal:scale-110 transition-transform" />
                </button>
            </div>

            <AnimatePresence>
                {showTrivia && (
                    <motion.div
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute top-0 right-0 bottom-0 w-[75%] md:w-[45%] lg:w-[35%] bg-[#0a1a14]/80 backdrop-blur-lg border-l border-emerald-400/20 z-20 shadow-2xl flex flex-col p-6 pt-20 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-serif text-xl md:text-2xl font-bold text-emerald-50 border-b border-emerald-400/30 pb-3 mb-4 drop-shadow-md">Did You Know?</h3>
                        <div className="text-sm md:text-base text-emerald-50/90 leading-relaxed font-medium drop-shadow-sm flex-1">
                            {activeGodMode ? (
                                <InlineTextareaEditor initialValue={pkg.trivia || ""} onSave={(val) => onUpdate(pkg._id, "trivia", val)} placeholder="Enter trivia details..." />
                            ) : (
                                <p>{pkg.trivia || "Discover fascinating facts about this destination!"}</p>
                            )}
                        </div>

                        {/* Price Section derived from linked Package - NOW FULLY EDITABLE */}
                        <div className="mt-auto border-t border-emerald-400/30 pt-4 flex gap-4 md:gap-6">
                            <div className="flex-1">
                                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5 drop-shadow-sm">Gold Tier</span>
                                <div className="text-xl md:text-2xl font-bold text-white flex items-center drop-shadow">
                                    <IndianRupee size={20} className="mr-0.5" strokeWidth={2.5} />
                                    {activeGodMode && resolvedPackage?._id ? (
                                        <InlineEditor value={resolvedPackage.price_gold || resolvedPackage.price_inr || ""} onSave={(val) => onUpdateLinked(resolvedPackage._id, "price_gold", Number(val))} />
                                    ) : (
                                        resolvedPackage?.price_gold?.toLocaleString('en-IN') || resolvedPackage?.price_inr?.toLocaleString('en-IN') || "TBA"
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 border-l border-white/20 pl-4 md:pl-6">
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-wider block mb-0.5 drop-shadow-sm">Platinum Tier</span>
                                <div className="text-xl md:text-2xl font-bold text-white flex items-center drop-shadow">
                                    <IndianRupee size={20} className="mr-0.5" strokeWidth={2.5} />
                                    {activeGodMode && resolvedPackage?._id ? (
                                        <InlineEditor value={resolvedPackage.price_platinum || ""} onSave={(val) => onUpdateLinked(resolvedPackage._id, "price_platinum", Number(val))} />
                                    ) : (
                                        resolvedPackage?.price_platinum?.toLocaleString('en-IN') || "TBA"
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 flex flex-col justify-end transform-gpu z-10 pointer-events-auto">
                <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                    <span className="bg-white/20 backdrop-blur-md text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest border border-white/30" onClick={e => e.stopPropagation()}>
                        {activeGodMode ? <InlineEditor value={pkg.category} onSave={(val) => onUpdate(pkg._id, "category", val)} /> : pkg.category}
                    </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-md pr-12" onClick={e => e.stopPropagation()}>
                    {activeGodMode ? <InlineEditor value={pkg.destination} onSave={(val) => onUpdate(pkg._id, "destination", val)} /> : pkg.destination}
                </h2>

                <div className="flex flex-wrap gap-2 md:gap-4 border-t border-white/20 pt-4 md:pt-6" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-white/10 text-xs md:text-sm backdrop-blur-sm">
                        <Mountain className="h-4 w-4 text-emerald-400" />
                        <span>{activeGodMode ? <InlineEditor value={pkg.altitude || "N/A"} onSave={(val) => onUpdate(pkg._id, "altitude", val)} /> : (pkg.altitude || "N/A")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-white/10 text-xs md:text-sm backdrop-blur-sm">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span>{activeGodMode ? <InlineEditor value={pkg.bestTime || "Anytime"} onSave={(val) => onUpdate(pkg._id, "bestTime", val)} /> : (pkg.bestTime || "Anytime")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/90 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-white/10 text-xs md:text-sm backdrop-blur-sm">
                        <CloudSun className="h-4 w-4 text-emerald-400" />
                        <span>{activeGodMode ? <InlineEditor value={pkg.weather || "Varies"} onSave={(val) => onUpdate(pkg._id, "weather", val)} /> : (pkg.weather || "Varies")}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Standard Grid Card Component ---
const GridCard = ({ pkg, allPackages, idx, navigate, activeGodMode, deletingId, setDeletingId, confirmDelete, onUpdate, onUpdateLinked }) => {
    const [liveDesktop, setLiveDesktop] = useState(pkg.cover_image_desktop);
    const [liveMobile, setLiveMobile] = useState(pkg.cover_image_mobile);

    useEffect(() => { setLiveDesktop(pkg.cover_image_desktop); }, [pkg.cover_image_desktop]);
    useEffect(() => { setLiveMobile(pkg.cover_image_mobile); }, [pkg.cover_image_mobile]);

    const linkedPkgId = pkg.linkedPackage?._id || pkg.linkedPackage;
    const resolvedPackage = allPackages.find(p => p._id === linkedPkgId);

    const handleCardClick = () => {
        if (resolvedPackage && resolvedPackage.slug) {
            navigate(`/packages/${resolvedPackage.slug}`, { state: { from: 'discover', tier: 'Gold' } });
        } else if (pkg.slug && !linkedPkgId) {
            navigate(`/packages/${pkg.slug}`, { state: { from: 'discover', tier: 'Gold' } });
        } else {
            toast.info("This destination is not properly mapped to a valid itinerary yet.");
        }
    };

    const handleGalleryClick = (e) => {
        e.stopPropagation();
        localStorage.setItem("gallerySearch", pkg.destination);
        navigate(`/gallery`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            onClick={handleCardClick}
            className="cursor-pointer group bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
        >
            {activeGodMode && (
                <>
                    <AnimatePresence>
                        {deletingId === pkg._id && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-4 right-4 z-50 bg-black/90 backdrop-blur-lg border border-red-500/30 p-4 rounded-2xl flex flex-col gap-3 w-56" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-2 text-white"><AlertTriangle size={18} className="text-red-500" /><span className="text-sm font-bold">Delete?</span></div>
                                <div className="flex gap-2 w-full mt-1">
                                    <Button size="sm" variant="ghost" className="w-full h-8 text-xs text-white/70 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>Cancel</Button>
                                    <Button size="sm" className="w-full h-8 text-xs bg-red-500 hover:bg-red-600 text-white" onClick={(e) => { e.stopPropagation(); confirmDelete(pkg._id); }}>Delete</Button>
                                </div>
                            </motion.div>
                        )}
                        {activeGodMode && deletingId !== pkg._id && (
                            <button onClick={(e) => { e.stopPropagation(); setDeletingId(pkg._id); }} className="absolute top-4 right-4 z-50 bg-red-500/90 hover:bg-red-600 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </AnimatePresence>
                    <div className="absolute top-4 left-26 z-40 bg-black/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 shadow-xl w-48" onClick={e => e.stopPropagation()}>                        <div className="flex flex-col gap-1"><span className="text-white/70 text-[10px]">Desktop Image URL:</span><LiveMediaEditor initialValue={pkg.cover_image_desktop} onLivePreview={setLiveDesktop} onSave={(val) => onUpdate(pkg._id, "cover_image_desktop", val)} /></div>
                        <div className="flex flex-col gap-1"><span className="text-white/70 text-[10px]">Mobile Image URL:</span><LiveMediaEditor initialValue={pkg.cover_image_mobile} onLivePreview={setLiveMobile} onSave={(val) => onUpdate(pkg._id, "cover_image_mobile", val)} /></div>

                        <div className="flex gap-3 mt-1 pt-2 border-t border-white/10">
                            <div className="flex flex-col gap-1 w-1/2"><span className="text-emerald-400 text-[10px] font-bold">Lat:</span><InlineEditor value={pkg.latitude || ""} onSave={(val) => onUpdate(pkg._id, "latitude", Number(val))} /></div>
                            <div className="flex flex-col gap-1 w-1/2"><span className="text-emerald-400 text-[10px] font-bold">Lng:</span><InlineEditor value={pkg.longitude || ""} onSave={(val) => onUpdate(pkg._id, "longitude", Number(val))} /></div>
                        </div>

                        <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/10">
                            <span className="text-emerald-400 text-[10px] font-bold">Link to Package:</span>
                            <PackageLinkEditor initialValue={linkedPkgId} allPackages={allPackages} onSave={(val) => onUpdate(pkg._id, "linkedPackage", val)} />
                        </div>
                    </div>
                </>
            )}

            <div className="relative h-56 w-full overflow-hidden pointer-events-none">
                <div className="hidden md:block w-full h-full"><SeamlessMedia src={liveDesktop} className="w-full h-full transition-transform duration-700 group-hover:scale-110" /></div>
                <div className="block md:hidden w-full h-full"><SeamlessMedia src={liveMobile} className="w-full h-full transition-transform duration-700 group-hover:scale-110" /></div>
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 flex flex-col gap-2 items-start pointer-events-auto" onClick={e => e.stopPropagation()}>
                    <span className="bg-background/90 backdrop-blur text-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-border/50 uppercase tracking-widest">
                        {activeGodMode ? <InlineEditor value={pkg.category} onSave={(val) => onUpdate(pkg._id, "category", val)} /> : pkg.category}
                    </span>
                </div>

                <div className="absolute top-4 right-4 pointer-events-auto">
                    <button
                        onClick={handleGalleryClick}
                        className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full shadow-lg transition-colors cursor-pointer group/gal"
                        title="View Media Gallery"
                    >
                        <Images size={16} className="group-hover/gal:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col pointer-events-auto">
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2" onClick={e => e.stopPropagation()}>
                    <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {activeGodMode ? <InlineEditor value={pkg.destination} onSave={(val) => onUpdate(pkg._id, "destination", val)} /> : pkg.destination}
                    </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-foreground mb-4 line-clamp-2 group-hover:text-emerald-600 transition-colors" onClick={e => e.stopPropagation()}>
                    {activeGodMode ? <InlineEditor value={pkg.title} onSave={(val) => onUpdate(pkg._id, "title", val)} /> : pkg.title}
                </h3>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center py-2 border-t border-border/50">
                        <span className="flex items-center gap-1.5"><Mountain className="w-4 h-4" /> Altitude</span>
                        <span className="font-medium text-foreground">{activeGodMode ? <InlineEditor value={pkg.altitude || "N/A"} onSave={(val) => onUpdate(pkg._id, "altitude", val)} /> : (pkg.altitude || "N/A")}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-border/50">
                        <span className="flex items-center gap-1.5"><span className="text-amber-500 font-bold tracking-wider uppercase text-[10px]">Gold Price</span></span>
                        <span className="font-bold text-foreground flex items-center">
                            <IndianRupee size={14} strokeWidth={2.5} className="mr-0.5" />
                            {activeGodMode && resolvedPackage?._id ? (
                                <InlineEditor value={resolvedPackage.price_gold || resolvedPackage.price_inr || ""} onSave={(val) => onUpdateLinked(resolvedPackage._id, "price_gold", Number(val))} />
                            ) : (
                                resolvedPackage?.price_gold?.toLocaleString('en-IN') || resolvedPackage?.price_inr?.toLocaleString('en-IN') || 'TBA'
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Map View Component (With Clustering & Geocoding Fallback) ---
const DiscoverMap = ({ destinations, allPackages, navigate, activeGodMode, onUpdate }) => {
    const { user } = useSelector((state) => state.auth);
    const [userLocation, setUserLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [geocodedPins, setGeocodedPins] = useState({});

    const hasValidCoords = user?.location?.coordinates && (user.location.coordinates[0] !== 0 || user.location.coordinates[1] !== 0);
    const initialCenter = hasValidCoords ? [user.location.coordinates[1], user.location.coordinates[0]] : [22.9074, 79.1322];
    const initialZoom = hasValidCoords ? 6 : 5;

    // Smart Geocoding for Missing Coordinates
    useEffect(() => {
        destinations.forEach(async (pkg) => {
            if (!pkg.latitude || !pkg.longitude) {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pkg.destination)}`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setGeocodedPins(prev => ({ ...prev, [pkg._id]: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } }));
                    }
                } catch (e) { console.error("Geocoding failed for", pkg.destination); }
            }
        });
    }, [destinations]);

    useEffect(() => {
        if (hasValidCoords) {
            setUserLocation([user.location.coordinates[1], user.location.coordinates[0]]);
        }
    }, [user, hasValidCoords]);

    const handleGetLocation = () => {
        setLoadingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation([lat, lng]);

                    try {
                        await api.post('/user/location', { latitude: lat, longitude: lng, forceUpdate: true });
                        toast.success("Map centered on your location!");
                    } catch (error) {
                        console.error("Failed to sync location to backend");
                    }
                    setLoadingLocation(false);
                },
                (error) => {
                    toast.error("Please enable location permissions to jump to your area.");
                    setLoadingLocation(false);
                }
            );
        } else {
            toast.error("Geolocation not supported by your browser.");
            setLoadingLocation(false);
        }
    };

    const RecenterAutomatically = ({ lat, lng }) => {
        const map = useMap();
        useEffect(() => {
            if (lat && lng) map.flyTo([lat, lng], 6, { duration: 1.5 });
        }, [lat, lng, map]);
        return null;
    };

    return (
        <div className="w-full h-[calc(100dvh-13rem)] rounded-3xl overflow-hidden shadow-xl border border-border/50 relative z-0">
            <div className="absolute top-4 right-4 z-400">
                <Button
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg border-none"
                    size="icon"
                    title="Find My Location"
                >
                    {loadingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                </Button>
            </div>

            <MapContainer center={initialCenter} zoom={initialZoom} className="w-full h-full z-0">
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <RecenterAutomatically lat={userLocation?.[0]} lng={userLocation?.[1]} />

                {userLocation && (
                    <Marker position={userLocation} icon={L.divIcon({
                        className: '',
                        html: `<div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(37,99,235,0.8);"></div>`,
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    })}>
                    </Marker>
                )}

                {/* MarkerClusterGroup ensures places close to each other are grouped beautifully */}
                <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={40}>
                    {destinations.map((pkg) => {
                        const lat = pkg.latitude || geocodedPins[pkg._id]?.lat;
                        const lng = pkg.longitude || geocodedPins[pkg._id]?.lng;

                        if (!lat || !lng) return null; // Wait for geocoding

                        return (
                            <Marker
                                key={pkg._id}
                                position={[lat, lng]}
                                icon={getCustomIcon(pkg.cover_image_mobile)}
                                eventHandlers={{
                                    click: () => {
                                        const linkedPkgId = pkg.linkedPackage?._id || pkg.linkedPackage;
                                        const resolvedPackage = allPackages.find(p => p._id === linkedPkgId) || pkg;
                                        if (resolvedPackage?.slug) {
                                            navigate(`/packages/${resolvedPackage.slug}`, { state: { from: 'discover', tier: 'Gold' } });
                                        } else {
                                            toast.warning("This destination isn't mapped to a package yet.");
                                        }
                                    }
                                }}
                            />
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default function Discover() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isSuperAdmin = isAuthenticated && user?.role === "SuperAdmin";

    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [allPackages, setAllPackages] = useState([]);

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
    const [viewMode, setViewMode] = useState("immersive");

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasSwiped, setHasSwiped] = useState(false);

    const dynamicCategories = ["All", ...new Set(destinations.map(p => p.category).filter(Boolean))];

    const [deletingId, setDeletingId] = useState(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);

    const dragX = useMotionValue(0);
    const activeIndex = useMotionValue(0);

    const filterRef = useRef(null);
    const cardContainerRef = useRef(null);
    const wheelTimeout = useRef(null);
    const isDragging = useRef(false);

    // Fetch Discover Destinations AND All Packages
    useEffect(() => {
        document.title = "Discover Nepal — NepalTrip";
        const timer = setTimeout(() => setIsMounted(true), 50);

        const fetchData = async () => {
            try {
                const [discRes, packRes] = await Promise.all([
                    api.get('/discover').catch(() => api.get('/packages')), // Fallback to packages if discover route missing
                    api.get('/packages')
                ]);
                setDestinations(discRes.data);
                setAllPackages(packRes.data);
            } catch (error) {
                toast.error("Failed to load discovery destinations");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        return () => clearTimeout(timer);
    }, []);

    const handleInstantCreate = async () => {
        try {
            const { data } = await api.post('/discover').catch(() => api.post('/packages'));
            setDestinations([data, ...destinations]);
            toast.success("Destination draft generated! Edit directly on the card.");
        } catch (error) {
            toast.error("Could not create destination.");
        }
    };

    const handleUpdatePackage = async (id, field, value) => {
        setDestinations(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
        try {
            await api.put(`/discover/${id}`, { [field]: value }).catch(() => api.put(`/packages/${id}`, { [field]: value }));
        } catch (error) {
            toast.error("Failed to save changes.");
        }
    };

    // NEW: Handle updating actual linked package prices explicitly from Discover
    const handleUpdateLinkedPackage = async (packageId, field, value) => {
        setAllPackages(prev => prev.map(p => p._id === packageId ? { ...p, [field]: value } : p));
        try {
            await api.put(`/packages/${packageId}`, { [field]: value });
            toast.success("Linked package price updated!");
        } catch (error) {
            toast.error("Failed to update linked package.");
        }
    };

    const confirmDeletePackage = async (id) => {
        try {
            await api.delete(`/discover/${id}`).catch(() => api.delete(`/packages/${id}`));
            setDestinations(destinations.filter(p => p._id !== id));
            toast.success("Destination permanently deleted.");
            setDeletingId(null);
        } catch (error) {
            toast.error("Could not delete destination.");
        }
    };

    const handleRestoreDefaults = async () => {
        setIsRestoring(true);
        try {
            await api.post('/discover/restore-defaults').catch(() => api.post('/packages/restore-defaults'));
            toast.success("Demo destinations restored successfully!");
            setShowRestoreModal(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            toast.error("Failed to restore defaults.");
        } finally {
            setIsRestoring(false);
        }
    };

    const filteredDestinations = destinations.filter(pkg => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            pkg.title?.toLowerCase().includes(query) ||
            pkg.destination?.toLowerCase().includes(query) ||
            pkg.category?.toLowerCase().includes(query);

        const matchesCategory = selectedCategory === "All" || pkg.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        setCurrentIndex(0);
        animate(dragX, 0, { duration: 0 });
    }, [searchQuery, selectedCategory, viewMode, dragX]);

    useEffect(() => {
        animate(activeIndex, currentIndex, { type: "spring", stiffness: 300, damping: 30 });
    }, [currentIndex, activeIndex]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 40) {
                setIsScrolled(true);
                setIsFilterOpen(false);
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
        const preventBrowserSwipe = (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault(); };
        container.addEventListener("wheel", preventBrowserSwipe, { passive: false });
        return () => container.removeEventListener("wheel", preventBrowserSwipe);
    }, [isLoading, viewMode]);

    const paginate = (newDirection) => {
        if (newDirection === 1 && currentIndex >= filteredDestinations.length - 1) return;
        if (newDirection === -1 && currentIndex <= 0) return;
        setHasSwiped(true);
        setCurrentIndex((prev) => prev + newDirection);
    };

    const handleDragEnd = (e, { offset }) => {
        setTimeout(() => { isDragging.current = false; }, 100);
        const PAGE_WIDTH = window.innerWidth < 768 ? window.innerWidth : 800;
        const swipeThreshold = PAGE_WIDTH * 0.2;

        if (offset.x < -swipeThreshold && currentIndex < filteredDestinations.length - 1) {
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

    const lockWheel = () => { wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 800); };

    return (
        <div className={`w-full transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className={`w-full bg-background min-h-[calc(100dvh-4rem)] flex flex-col pt-2 pb-6 md:pb-4 md:pt-6 font-sans relative animate-in fade-in duration-700 ${viewMode === 'immersive' ? 'overflow-hidden items-center' : ''}`}>

                {viewMode === 'immersive' && (
                    <style>{`@media (max-width: 767px) { footer { display: none !important; } }`}</style>
                )}

                <motion.div
                    animate={{ y: isScrolled && viewMode === 'immersive' ? -100 : 0, opacity: isScrolled && viewMode === 'immersive' ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full max-w-full md:max-w-5xl px-4 flex justify-between items-center z-50 mb-6 md:mb-6 ${viewMode !== 'immersive' ? 'mx-auto max-w-7xl' : ''}`}
                >
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-foreground drop-shadow-sm tracking-tight">Discover</h1>
                        <p className="text-muted-foreground text-xs md:text-base font-medium">
                            {filteredDestinations.length} {filteredDestinations.length === 1 ? 'destination' : 'destinations'} found
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 relative">
                        <div ref={filterRef}>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`cursor-pointer w-9 h-9 md:w-11 md:h-11 border shadow-sm rounded-full transition-colors flex items-center justify-center ${searchQuery || selectedCategory !== "All" ? "bg-emerald-600 text-white border-emerald-600" : "bg-card border-border text-foreground hover:bg-muted"}`}
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
                                            <Input type="search" placeholder="E.g., Kathmandu, Mountains..." className="w-full h-10 text-sm rounded-xl focus-visible:ring-emerald-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Categories (Vibe)</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {dynamicCategories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`cursor-pointer rounded-full px-3 py-1 text-xs md:text-sm font-medium transition-colors ${selectedCategory === cat ? "bg-emerald-600 text-white" : "bg-muted text-foreground hover:bg-muted/80"}`}
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
                            <button onClick={() => setViewMode("immersive")} className={`cursor-pointer p-1.5 rounded-full transition-all ${viewMode === "immersive" ? "bg-white shadow-sm text-emerald-600" : "text-muted-foreground hover:text-foreground"}`} title="Immersive View"><GalleryHorizontalEnd size={18} /></button>
                            <button onClick={() => setViewMode("grid")} className={`cursor-pointer p-1.5 rounded-full transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-emerald-600" : "text-muted-foreground hover:text-foreground"}`} title="Grid View"><LayoutGrid size={18} /></button>
                            <button onClick={() => setViewMode("map")} className={`cursor-pointer p-1.5 rounded-full transition-all ${viewMode === "map" ? "bg-white shadow-sm text-emerald-600" : "text-muted-foreground hover:text-foreground"}`} title="Map View"><MapIcon size={18} /></button>
                        </div>
                    </div>
                </motion.div>

                {isLoading ? null : (
                    <>
                        {activeGodMode && viewMode === "immersive" && (
                            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50">
                                <button onClick={handleInstantCreate} className="flex items-center gap-2 bg-emerald-600 cursor-pointer text-white px-6 py-2 rounded-full font-bold shadow-xl hover:scale-105 transition-transform border border-white/20">
                                    <Plus size={18} /> Add Destination
                                </button>
                            </div>
                        )}

                        {viewMode === "immersive" && (
                            <div className="flex-1 w-full max-w-full md:max-w-5xl relative z-10 px-3 md:px-0 mx-auto">
                                <div ref={cardContainerRef} onWheel={handleWheel} style={{ perspective: "1000px" }} className="relative w-full h-[calc(100dvh-16rem)] my-4 md:my-0 min-h-100 max-h-200 md:h-[65vh] md:min-h-125 md:max-h-187.5 overflow-hidden flex items-center justify-center overscroll-x-none">
                                    <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={1} style={{ x: dragX, transformStyle: "preserve-3d" }} onDragStart={() => { isDragging.current = true; setHasSwiped(true); }} onDragEnd={handleDragEnd} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center">
                                        {filteredDestinations.map((pkg, i) => (
                                            <CylinderCard key={pkg._id} pkg={pkg} allPackages={allPackages} index={i} activeIndex={activeIndex} dragX={dragX} navigate={navigate} isDragging={isDragging} activeGodMode={activeGodMode} deletingId={deletingId} setDeletingId={setDeletingId} confirmDelete={confirmDeletePackage} onUpdate={handleUpdatePackage} onUpdateLinked={handleUpdateLinkedPackage} />
                                        ))}
                                    </motion.div>

                                    {currentIndex > 0 && (
                                        <button onClick={(e) => { e.stopPropagation(); paginate(-1); }} className="cursor-pointer hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all hover:bg-white/30 hover:scale-110 active:scale-95"><ChevronLeft className="w-8 h-8" /></button>
                                    )}
                                    {currentIndex < filteredDestinations.length - 1 && (
                                        <button onClick={(e) => { e.stopPropagation(); paginate(1); }} className="cursor-pointer hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all hover:bg-white/30 hover:scale-110 active:scale-95"><ChevronRight className="w-8 h-8" /></button>
                                    )}
                                </div>
                            </div>
                        )}

                        {viewMode === "grid" && (
                            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-16 md:pb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {activeGodMode && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={handleInstantCreate} className="cursor-pointer group bg-transparent border-2 border-dashed border-emerald-600/40 rounded-3xl overflow-hidden shadow-sm hover:bg-emerald-600/5 transition-all duration-300 flex flex-col items-center justify-center min-h-100">
                                            <div className="bg-emerald-600/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><Plus size={32} className="text-emerald-600" /></div>
                                            <h3 className="text-xl font-serif font-bold text-foreground">Add New Destination</h3>
                                        </motion.div>
                                    )}
                                    {filteredDestinations.map((pkg, idx) => (
                                        <GridCard key={pkg._id} pkg={pkg} allPackages={allPackages} idx={idx} navigate={navigate} activeGodMode={activeGodMode} deletingId={deletingId} setDeletingId={setDeletingId} confirmDelete={confirmDeletePackage} onUpdate={handleUpdatePackage} onUpdateLinked={handleUpdateLinkedPackage} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {viewMode === "map" && (
                            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-16 md:pb-10">
                                <DiscoverMap destinations={filteredDestinations} allPackages={allPackages} navigate={navigate} activeGodMode={activeGodMode} onUpdate={handleUpdatePackage} />
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
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
                                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="h-8 w-8 text-red-500" /></div>
                                    <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Seed Demo Destinations?</h3>
                                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">This will overwrite everything and inject the original placeholder packages into your database.</p>
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
    );
}