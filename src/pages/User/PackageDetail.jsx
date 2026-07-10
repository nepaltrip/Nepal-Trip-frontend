import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Check, X, Clock, MapPin, ArrowLeft, ChevronDown, Image as ImageIcon, Trash2, Plus, Settings2, Pencil, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InquiryDialog } from "../../components/site/InquiryDialog";
import { Button } from "../../components/ui/button";
import { InlineEditor } from "../../components/admin/InlineEditor";
import api from "../../api/axios";
import { toast } from "react-toastify";

// ----------------------------------------------------------------------
// Advanced Media Handling
// ----------------------------------------------------------------------
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
            <video key={src} ref={videoRef} src={src} autoPlay muted loop playsInline onTimeUpdate={handleTimeUpdate} className={`${className} object-cover`} onError={() => setMediaType('image')} />
        );
    }

    if (mediaType === 'image') {
        return (
            <img key={src} src={src} className={`${className} object-cover`} alt="Media" onError={(e) => e.target.src = "https://placehold.co/800x1200/1a1a1a/4a4a4a?text=Invalid+Media"} />
        );
    }

    return <div className={`${className} bg-black/20 animate-pulse`} />;
};

const LiveMediaEditor = ({ initialValue, onSave, onLivePreview }) => {
    const [val, setVal] = useState(initialValue || "");

    useEffect(() => { setVal(initialValue || ""); }, [initialValue]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setVal(newVal);
        onLivePreview(newVal);
    };

    const handleSave = () => { if (val !== initialValue) onSave(val); };
    const handleCancel = () => { setVal(initialValue || ""); onLivePreview(initialValue || ""); };

    return (
        <div className="flex items-center gap-1 bg-black/40 rounded border border-white/20 p-0.5 focus-within:border-primary/50">
            <input
                className="bg-transparent text-white text-[10px] w-full outline-none px-1 py-0.5 placeholder:text-white/30"
                value={val}
                onChange={handleChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                placeholder="Paste media URL..."
            />
            {val !== initialValue && (
                <div className="flex items-center gap-1 pr-1 animate-in fade-in zoom-in duration-200">
                    <button onClick={handleSave} className="text-green-400 hover:scale-110 transition-transform p-0.5 bg-green-400/10 rounded"><Check size={12} /></button>
                    <button onClick={handleCancel} className="text-red-400 hover:scale-110 transition-transform p-0.5 bg-red-400/10 rounded"><X size={12} /></button>
                </div>
            )}
        </div>
    );
};

// --- Upgraded Inline Textarea Editor (With Hover Pencil) ---
const InlineTextareaEditor = ({ initialValue, onSave, placeholder = "Type here..." }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [val, setVal] = useState(initialValue || "");

    useEffect(() => { setVal(initialValue || ""); }, [initialValue]);

    const handleSave = () => {
        if (val !== initialValue) onSave(val);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setVal(initialValue || "");
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div onClick={() => setIsEditing(true)} className="group relative cursor-pointer hover:bg-muted/50 rounded-xl p-3 -mx-3 border border-transparent hover:border-border transition-all min-h-12" title="Edit Content">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-primary/10 text-primary rounded-md transition-opacity">
                    <Pencil size={14} />
                </div>
                {initialValue || <span className="text-muted-foreground italic">{placeholder}</span>}
            </div>
        );
    }

    return (
        <div className="relative flex flex-col bg-card/80 backdrop-blur-md rounded-xl border border-primary/50 p-3 shadow-xl w-full">
            <textarea
                autoFocus
                className="bg-transparent text-foreground outline-none resize-none placeholder:text-muted-foreground w-full min-h-30"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') handleCancel(); }}
                placeholder={placeholder}
            />
            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border/50">
                <button onClick={handleSave} className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-md transition-colors" title="Save changes"><Check size={16} /></button>
                <button onClick={handleCancel} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors" title="Discard changes"><X size={16} /></button>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// Itinerary Component
// ----------------------------------------------------------------------
const ItineraryDay = ({ dayObj, index, isFirst, isLast, activeGodMode, onUpdate, onDelete }) => {
    const [isOpen, setIsOpen] = useState(isFirst);

    return (
        <div className={`relative pl-8 md:pl-10 ${!isLast ? "pb-8" : ""}`}>
            {!isLast && <div className="absolute left-2.75 top-6 bottom-0 w-0.5 bg-primary/20" />}

            <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-background shadow-sm">
                <span className="text-[10px] text-primary-foreground font-bold">
                    {activeGodMode ? <InlineEditor value={dayObj.day} type="number" onSave={(v) => onUpdate(index, "day", Number(v))} /> : dayObj.day}
                </span>
            </div>

            <div className="flex items-center justify-between group">
                <button onClick={() => !activeGodMode && setIsOpen(!isOpen)} className={`text-left flex-1 ${activeGodMode ? '' : 'cursor-pointer'}`}>
                    <h3 className="font-serif text-lg font-semibold group-hover:text-primary transition-colors pr-4">
                        {activeGodMode ? <InlineEditor value={dayObj.title} onSave={(v) => onUpdate(index, "title", v)} /> : dayObj.title}
                    </h3>
                </button>

                <div className="flex items-center gap-2">
                    {activeGodMode && (
                        <button onClick={() => onDelete(index)} className="p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded transition-colors" title="Delete Day">
                            <Trash2 size={16} />
                        </button>
                    )}
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-4 text-muted-foreground leading-relaxed text-sm md:text-base pb-2">
                            {activeGodMode ? (
                                <InlineTextareaEditor initialValue={dayObj.details} onSave={(v) => onUpdate(index, "details", v)} placeholder="Describe this day's activities..." />
                            ) : (
                                dayObj.details
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ----------------------------------------------------------------------
// Main Package Detail Component
// ----------------------------------------------------------------------
export default function PackageDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isSuperAdmin = isAuthenticated && user?.role === "SuperAdmin";

    const [isDesktop, setIsDesktop] = useState(true);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const activeGodMode = isSuperAdmin && isDesktop;

    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);

    const [liveDesktop, setLiveDesktop] = useState("");
    const [liveMobile, setLiveMobile] = useState("");

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const { data } = await api.get(`/packages/${slug}`);
                setPkg(data);
                setLiveDesktop(data.cover_image_desktop || "");
                setLiveMobile(data.cover_image_mobile || "");
                document.title = `${data.title} — NepalTrip`;
            } catch (error) {
                toast.error("Failed to load package details");
                navigate('/packages');
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [slug, navigate]);

    // --- Master Save Function ---
    const handleUpdate = async (field, value) => {
        setPkg(prev => ({ ...prev, [field]: value }));
        try {
            await api.put(`/packages/${pkg._id}`, { [field]: value });
        } catch (error) {
            toast.error("Failed to save changes.");
        }
    };

    // --- Array Helpers ---
    const updateArrayItem = (field, index, value) => {
        const newArr = [...(pkg[field] || [])];
        newArr[index] = value;
        handleUpdate(field, newArr);
    };

    const addToArray = (field, defaultVal) => {
        const newArr = [...(pkg[field] || []), defaultVal];
        handleUpdate(field, newArr);
    };

    const removeFromArray = (field, index) => {
        const newArr = (pkg[field] || []).filter((_, i) => i !== index);
        handleUpdate(field, newArr);
    };

    // --- Itinerary Helpers ---
    const updateItineraryDay = (index, field, val) => {
        const newItin = [...(pkg.itinerary || [])];
        newItin[index] = { ...newItin[index], [field]: val };
        handleUpdate("itinerary", newItin);
    };

    if (loading) return (
        <div className="w-full bg-background font-sans pb-20 flex justify-center items-center h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        </div>
    );
    if (!pkg) return null;

    // Fallbacks for arrays/text
    const sidebarFeatures = pkg.sidebar_features || ["Free itinerary tailoring", "Trusted agency since 2015", "24×7 on-trip support"];

    return (
        <div className="w-full bg-background font-sans pb-20">
            {/* --- FIXED HERO SECTION --- */}
            <section className="relative w-full pt-28 pb-12 md:pt-40 md:pb-20 flex flex-col justify-end overflow-hidden group/hero">
                {activeGodMode && (
                    <div className="absolute top-24 right-8 z-50 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20 opacity-0 group-hover/hero:opacity-100 transition-opacity flex flex-col gap-3 shadow-xl max-w-xs">
                        <p className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Settings2 size={14} /> Hero Media Setup</p>
                        <div className="flex flex-col gap-1 text-xs">
                            <span className="text-white/60">Desktop (Landscape):</span>
                            <LiveMediaEditor initialValue={pkg.cover_image_desktop} onLivePreview={setLiveDesktop} onSave={(val) => handleUpdate("cover_image_desktop", val)} />
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                            <span className="text-white/60">Mobile (Portrait):</span>
                            <LiveMediaEditor initialValue={pkg.cover_image_mobile} onLivePreview={setLiveMobile} onSave={(val) => handleUpdate("cover_image_mobile", val)} />
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 z-0 bg-muted">
                    <div className="hidden md:block w-full h-full"><SeamlessMedia src={liveDesktop} className="w-full h-full" /></div>
                    <div className="block md:hidden w-full h-full"><SeamlessMedia src={liveMobile} className="w-full h-full" /></div>
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-black/20" />
                </div>

                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link to="/packages" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-md px-4 py-2 rounded-full w-fit mb-6 shadow-sm border border-border/50">
                        <ArrowLeft className="h-4 w-4" /> Back to explore
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-md">
                            {activeGodMode ? <InlineEditor value={pkg.category || "UNCATEGORIZED"} onSave={(val) => handleUpdate("category", val)} /> : pkg.category}
                        </span>

                        <span className="flex items-center whitespace-nowrap gap-1.5 text-sm font-medium text-foreground bg-background/50 backdrop-blur-md px-3 py-1 rounded-full border border-border/50">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {activeGodMode ? (
                                <span className="flex items-center gap-1 whitespace-nowrap">
                                    <span className="inline-block w-6 text-center"><InlineEditor value={pkg.duration_days} type="number" onSave={(val) => handleUpdate("duration_days", Number(val))} /></span>
                                    <span>Days / </span>
                                    <span className="inline-block w-6 text-center"><InlineEditor value={pkg.duration_nights} type="number" onSave={(val) => handleUpdate("duration_nights", Number(val))} /></span>
                                    <span>Nights</span>
                                </span>
                            ) : (
                                `${pkg.duration_days} Days / ${pkg.duration_nights} Nights`
                            )}
                        </span>

                        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-background/50 backdrop-blur-md px-3 py-1 rounded-full border border-border/50">
                            <MapPin className="h-3.5 w-3.5" />
                            {activeGodMode ? <InlineEditor value={pkg.destination} onSave={(val) => handleUpdate("destination", val)} /> : pkg.destination}
                        </span>
                    </div>

                    <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-foreground drop-shadow-sm max-w-4xl">
                        {activeGodMode ? <InlineEditor value={pkg.title} onSave={(val) => handleUpdate("title", val)} /> : pkg.title}
                    </h1>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">

                    <div className="lg:col-span-2 space-y-12 md:space-y-16">

                        {/* --- BENTO BOX GALLERY --- */}
                        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-2 md:gap-3 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg h-70 sm:h-87.5 md:h-112.5 group/gallery relative">
                            {[0, 1, 2, 3].map((idx) => {
                                const hasImg = pkg.gallery_images && pkg.gallery_images[idx];
                                const isMain = idx === 0;
                                const isHiddenMobile = idx === 2;
                                const isViewAll = idx === 3;

                                let styleClass = "relative overflow-hidden bg-muted group/item ";
                                if (isMain) styleClass += "col-span-2 row-span-2 ";
                                else if (isHiddenMobile) styleClass += "hidden md:block ";
                                else if (isViewAll) styleClass += "cursor-pointer col-span-1 md:col-span-2 row-span-1 ";

                                return (
                                    <div key={idx} className={styleClass} onClick={isViewAll && !activeGodMode ? () => navigate(`/gallery?destination=${pkg.destination}`) : undefined}>
                                        {hasImg ? (
                                            <>
                                                <SeamlessMedia src={pkg.gallery_images[idx]} className="w-full h-full transition-transform duration-700 group-hover/item:scale-105" />
                                                {isViewAll && !activeGodMode && (
                                                    <div className="absolute inset-0 bg-black/40 group-hover/item:bg-black/50 transition-colors flex items-center justify-center backdrop-blur-[2px]">
                                                        <span className="text-white font-semibold flex items-center gap-2 text-xs sm:text-sm md:text-base border border-white/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-black/20">
                                                            <ImageIcon size={16} /> View photos
                                                        </span>
                                                    </div>
                                                )}
                                                {activeGodMode && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2 p-4">
                                                        <div className="w-full max-w-50 bg-card p-1 rounded">
                                                            <InlineEditor value={pkg.gallery_images[idx]} onSave={(val) => updateArrayItem("gallery_images", idx, val)} />
                                                        </div>
                                                        <Button size="sm" variant="destructive" onClick={() => removeFromArray("gallery_images", idx)}>Remove</Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            activeGodMode && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity border-2 border-dashed border-primary/40 m-2 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10" onClick={() => addToArray("gallery_images", "https://placehold.co/800x600/e2e8f0/64748b?text=New+Gallery+Image")}>
                                                    <Plus size={24} className="text-primary" />
                                                </div>
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- OVERVIEW --- */}
                        <div>
                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                                {activeGodMode ? (
                                    <InlineEditor value={pkg.about_title || "About this journey"} onSave={(val) => handleUpdate("about_title", val)} />
                                ) : (
                                    pkg.about_title || "About this journey"
                                )}
                            </h2>
                            <div className="leading-relaxed text-muted-foreground text-sm md:text-lg">
                                {activeGodMode ? (
                                    <InlineTextareaEditor initialValue={pkg.full_description || pkg.short_description} onSave={(val) => handleUpdate("full_description", val)} placeholder="Write the full, detailed overview of the package here..." />
                                ) : (
                                    pkg.full_description || pkg.short_description
                                )}
                            </div>
                        </div>

                        {/* --- EXPANDABLE TIMELINE ITINERARY --- */}
                        <div>
                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8 flex items-center justify-between">
                                Day-by-day itinerary
                                {activeGodMode && (
                                    <Button size="sm" variant="outline" onClick={() => addToArray("itinerary", { day: (pkg.itinerary?.length || 0) + 1, title: "New Day Plan", details: "Describe the day..." })} className="rounded-full">
                                        <Plus size={16} className="mr-1" /> Add Day
                                    </Button>
                                )}
                            </h2>
                            <div className="mt-4 md:mt-6">
                                {(pkg.itinerary || []).map((d, index) => (
                                    <ItineraryDay
                                        key={index}
                                        dayObj={d}
                                        index={index}
                                        isFirst={index === 0}
                                        isLast={index === (pkg.itinerary?.length || 0) - 1}
                                        activeGodMode={activeGodMode}
                                        onUpdate={updateItineraryDay}
                                        onDelete={(idx) => removeFromArray("itinerary", idx)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* --- INCLUSIONS & EXCLUSIONS --- */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Included */}
                            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-3xl p-6 relative">
                                <h3 className="font-serif text-xl md:text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-4 md:mb-6 flex items-center gap-2 justify-between">
                                    <span>Included</span>
                                    {activeGodMode && <Button size="icon" variant="ghost" onClick={() => addToArray("inclusions", "New Inclusion Item")} className="h-8 w-8 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900"><Plus size={16} /></Button>}
                                </h3>
                                <ul className="space-y-3">
                                    {(pkg.inclusions || []).map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm md:text-base text-emerald-800 dark:text-emerald-300/80 leading-snug group">
                                            <Check className="shrink-0 h-5 w-5 text-emerald-500 mt-0.5" />
                                            <span className="flex-1">
                                                {activeGodMode ? <InlineEditor value={item} onSave={(val) => updateArrayItem("inclusions", idx, val)} /> : item}
                                            </span>
                                            {activeGodMode && (
                                                <button onClick={() => removeFromArray("inclusions", idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                    {(!pkg.inclusions || pkg.inclusions.length === 0) && !activeGodMode && <li className="text-muted-foreground italic text-sm">Nothing explicitly included.</li>}
                                </ul>
                            </div>

                            {/* Not Included */}
                            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-3xl p-6 relative">
                                <h3 className="font-serif text-xl md:text-2xl font-bold text-rose-900 dark:text-rose-400 mb-4 md:mb-6 flex items-center gap-2 justify-between">
                                    <span>Not Included</span>
                                    {activeGodMode && <Button size="icon" variant="ghost" onClick={() => addToArray("exclusions", "New Exclusion Item")} className="h-8 w-8 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900"><Plus size={16} /></Button>}
                                </h3>
                                <ul className="space-y-3">
                                    {(pkg.exclusions || []).map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm md:text-base text-rose-800 dark:text-rose-300/80 leading-snug group">
                                            <X className="shrink-0 h-5 w-5 text-rose-500 mt-0.5" />
                                            <span className="flex-1">
                                                {activeGodMode ? <InlineEditor value={item} onSave={(val) => updateArrayItem("exclusions", idx, val)} /> : item}
                                            </span>
                                            {activeGodMode && (
                                                <button onClick={() => removeFromArray("exclusions", idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                    {(!pkg.exclusions || pkg.exclusions.length === 0) && !activeGodMode && <li className="text-muted-foreground italic text-sm">Nothing explicitly excluded.</li>}
                                </ul>
                            </div>
                        </div>

                    </div>

                    {/* --- FLOATING PREMIUM SIDEBAR --- */}
                    <aside className="lg:sticky lg:top-28 lg:h-fit z-10">
                        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Starting from</p>
                            <div className="mt-2 flex items-baseline gap-1 text-foreground">
                                <span className="font-serif text-4xl md:text-5xl font-bold flex items-center">
                                    ₹{activeGodMode ? <InlineEditor value={pkg.price_inr} type="number" onSave={(val) => handleUpdate("price_inr", Number(val))} /> : Number(pkg.price_inr).toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* Editable Price Subtitle */}
                            <div className="text-sm text-muted-foreground mt-1">
                                {activeGodMode ? (
                                    <InlineEditor value={pkg.price_subtitle || "per person, taxes extra"} onSave={(val) => handleUpdate("price_subtitle", val)} />
                                ) : (
                                    pkg.price_subtitle || "per person, taxes extra"
                                )}
                            </div>

                            <div className="mt-6 md:mt-8 space-y-3 relative z-10">
                                <InquiryDialog
                                    packageId={pkg._id}
                                    packageTitle={pkg.title}
                                    trigger={
                                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 md:h-14 rounded-xl text-base md:text-lg font-bold shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                            Book / Inquire now
                                        </Button>
                                    }
                                />
                            </div>

                            {/* Editable Sidebar Features */}
                            <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-border flex flex-col gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                                {sidebarFeatures.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 group">
                                        <Check size={16} className="text-primary shrink-0" />
                                        <span className="flex-1">
                                            {activeGodMode ? <InlineEditor value={feat} onSave={(val) => updateArrayItem("sidebar_features", idx, val)} /> : feat}
                                        </span>
                                        {activeGodMode && (
                                            <button onClick={() => removeFromArray("sidebar_features", idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity p-0.5">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {activeGodMode && (
                                    <Button size="sm" variant="ghost" className="h-7 w-fit text-xs text-primary mt-1 px-2" onClick={() => addToArray("sidebar_features", "New Feature")}>
                                        <Plus size={12} className="mr-1" /> Add Feature
                                    </Button>
                                )}
                            </div>
                        </div>
                    </aside>

                </div>
            </section>
        </div>
    );
}