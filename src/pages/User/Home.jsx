import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { ArrowRight, Star, Map, Plus, Trash2, ImageOff, Check, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { InquiryDialog } from "../../components/site/InquiryDialog";
import { InlineEditor } from "../../components/admin/InlineEditor";
import api from "../../api/axios";
import { toast } from "react-toastify";

const DynamicIcon = ({ name, className }) => {
    if (!name) return <Icons.HelpCircle className={className} />;
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    const Icon = Icons[name] || Icons[formattedName] || Icons.HelpCircle;
    return <Icon className={className} />;
};

// --- Skeletons ---
const TestimonialsSkeleton = () => (
    <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-64 rounded-md bg-muted mt-1 animate-pulse" />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-pulse h-40" />
                ))}
            </div>
        </div>
    </section>
);

const HeroContentSkeleton = () => (
    <div className="max-w-2xl text-primary-foreground animate-pulse">
        <div className="h-6 w-48 rounded-full bg-white/20 backdrop-blur" />
        <div className="h-14 md:h-20 w-full rounded-xl bg-white/10 mt-6" />
        <div className="space-y-2 mt-5">
            <div className="h-4 w-full rounded-md bg-white/10" />
            <div className="h-4 w-4/5 rounded-md bg-white/10" />
        </div>
    </div>
);

// --- Auto-detecting Gallery Media (Image or Video) ---
const GalleryMedia = ({ src, className, onError }) => {
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

    if (mediaType === 'video') {
        return (
            <video
                key={src}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                className={`${className} object-cover`}
                onError={() => setMediaType('image')}
            />
        );
    }

    if (mediaType === 'image') {
        return (
            <img
                key={src}
                src={src}
                alt="Gallery snippet"
                onError={onError}
                loading="lazy"
                className={`${className} object-cover`}
            />
        );
    }

    return <div className={`${className} bg-muted animate-pulse`} />;
};

// --- Live URL Editor ---
const GalleryLiveEditor = ({ initialValue, onSave, onLivePreview }) => {
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

    const isDirty = val !== initialValue;

    return (
        <div className="flex items-center gap-1 bg-black/60 rounded-lg border border-white/20 p-1 w-full transition-colors focus-within:border-primary/50">
            <input
                className="bg-transparent text-white text-xs w-full outline-none px-1.5 py-1 placeholder:text-white/40"
                value={val}
                onChange={handleChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
                placeholder="Paste image or video URL..."
            />
            {isDirty && (
                <div className="flex items-center gap-1 pr-0.5 animate-in fade-in zoom-in duration-200">
                    <button
                        onClick={handleSave}
                        className="text-green-400 hover:scale-110 transition-transform p-1 bg-green-400/10 rounded"
                        title="Lock in this URL"
                    >
                        <Check size={14} />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-red-400 hover:scale-110 transition-transform p-1 bg-red-400/10 rounded"
                        title="Cancel"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Gallery Grid Item ---
const GalleryItem = ({ src, idx, isFirst, isSuperAdmin, isMobile, onSave, onDelete, onImageError }) => {
    const [livePreviewSrc, setLivePreviewSrc] = useState(src);

    useEffect(() => { setLivePreviewSrc(src); }, [src]);

    return (
        <div className={`relative overflow-hidden rounded-2xl group border border-border/40 shadow-xs ${isFirst ? 'md:col-span-2 md:row-span-2' : ''}`}>
            <div className="aspect-4/3 md:aspect-auto md:h-full w-full bg-muted relative">
                <GalleryMedia
                    src={livePreviewSrc}
                    onError={onImageError}
                    className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                {isSuperAdmin && !isMobile && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col justify-center items-center gap-3 p-3">
                        <div className="w-11/12 max-w-xs">
                            <GalleryLiveEditor
                                initialValue={src}
                                onLivePreview={setLivePreviewSrc}
                                onSave={(val) => onSave(idx, val)}
                            />
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(idx)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Default Configuration ---
const defaultSettings = {
    tagline: "CURATED JOURNEYS, UNFORGETTABLE MEMORIES",
    heroTitle: "Journeys crafted for the way you travel",
    heroSubtitle: "Handpicked tour packages across breathtaking destinations.",
    heroVideoUrl: "/nepal-landscape.mp4",
    heroVideoMobileUrl: "/nepal-portrait.mp4",
    whyUsTitle: "Why Travel With Us?",
    whyUsCards: [
        { _id: "temp1", icon: "Compass", title: "Handcrafted itineraries", body: "Every trip is designed around what you love." },
        { _id: "temp2", icon: "ShieldCheck", title: "Trusted since 2015", body: "Thousands of travelers, five-star reviews." },
        { _id: "temp3", icon: "Heart", title: "Local partners", body: "We work with local guides and hosts." }
    ],
    galleryTagline: "Through our lens",
    galleryTitle: "Glimpses of Nepal",
    galleryPreview: [
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=800&auto=format&fit=crop"
    ],
    testimonialsTagline: "Kind words",
    testimonialsTitle: "Loved by travelers",
    showCtaCard: true,
    ctaSubtitle: "Know before you go",
    ctaTitle: "Haven't decided where to go yet? Let's fix that.",
    ctaBody: "Explore local trivia, practical travel insights, and discover the perfect destination based on your vibe."
};

export default function Home() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isSuperAdmin = isAuthenticated && user?.role === "SuperAdmin";

    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
    const [testimonials, setTestimonials] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [settings, setSettings] = useState(defaultSettings);

    // WhatsApp State
    const [whatsappNumber, setWhatsappNumber] = useState("");

    // Modal State
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const desktopVideoRef = useRef(null);
    const mobileVideoRef = useRef(null);

    const handleImageError = (e) => {
        e.target.src = "https://placehold.co/800x600/e2e8f0/64748b?text=Image+Unavailable";
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (desktopVideoRef.current) desktopVideoRef.current.load();
    }, [settings.heroVideoUrl]);

    useEffect(() => {
        if (mobileVideoRef.current) mobileVideoRef.current.load();
    }, [settings.heroVideoMobileUrl]);

    useEffect(() => {
        document.title = "Nepal Trip — Premium Headless CMS Travel";
        const mountTimer = setTimeout(() => setIsMounted(true), 50);

        const fetchGlobalContent = async () => {
            try {
                const { data } = await api.get("/content/global");
                if (data) setSettings(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error("Layout fetch failure:", error.message);
            } finally {
                setIsLoadingContent(false);
            }
        };

        const fetchTestimonials = async () => {
            try {
                const { data } = await api.get("/content/testimonials");
                if (data && data.testimonials) {
                    setTestimonials(data.testimonials);
                }
            } catch (error) {
                console.error("Testimonials fetch failure:", error.message);
            } finally {
                setIsLoadingTestimonials(false);
            }
        };

        const fetchSocialInfo = async () => {
            try {
                const { data } = await api.get("/social");
                if (data && data.data && data.data.whatsapp) {
                    // Strip all spaces, dashes, and '+' signs
                    let cleanNum = data.data.whatsapp.replace(/[^0-9]/g, '');

                    // ✨ If the admin only typed a 10-digit number, automatically add '91' (India)
                    if (cleanNum.length === 10) {
                        cleanNum = '91' + cleanNum;
                    }

                    setWhatsappNumber(cleanNum);
                }
            } catch (error) {
                console.error("Social info fetch failure:", error.message);
            }
        };

        fetchGlobalContent();
        fetchTestimonials();
        fetchSocialInfo();
        return () => clearTimeout(mountTimer);
    }, []);

    const handleCMSFieldSave = async (fieldKey, updatedValue) => {
        setSettings(prev => ({ ...prev, [fieldKey]: updatedValue }));
        try {
            await api.put("/content/global", { [fieldKey]: updatedValue });
        } catch (error) {
            console.error(`Failed to save ${fieldKey}`);
        }
    };

    const renderEditableText = (fieldKey, type = "text") => {
        const displayValue = settings[fieldKey] || defaultSettings[fieldKey] || "";
        if (isMobile) return <>{displayValue}</>;
        return (
            <InlineEditor
                type={type}
                value={displayValue}
                onSave={(val) => handleCMSFieldSave(fieldKey, val)}
            />
        );
    };

    // --- Dynamic Arrays Handlers ---
    const updateWhyUsArray = async (newArray) => {
        setSettings(prev => ({ ...prev, whyUsCards: newArray }));
        await handleCMSFieldSave("whyUsCards", newArray);
    };
    const handleAddWhyUsCard = () => updateWhyUsArray([...settings.whyUsCards, { icon: "Compass", title: "New Feature", body: "Description goes here." }]);
    const handleDeleteWhyUsCard = (index) => updateWhyUsArray(settings.whyUsCards.filter((_, i) => i !== index));
    const handleUpdateWhyUsCard = (index, field, value) => {
        const newArray = [...settings.whyUsCards];
        newArray[index] = { ...newArray[index], [field]: value };
        updateWhyUsArray(newArray);
    };

    const updateGalleryArray = async (newArray) => {
        setSettings(prev => ({ ...prev, galleryPreview: newArray }));
        await handleCMSFieldSave("galleryPreview", newArray);
    };
    const handleAddGalleryImage = () => updateGalleryArray([...settings.galleryPreview, "https://placehold.co/800x600?text=Paste+Image+or+Video+URL"]);
    const handleDeleteGalleryImage = (index) => updateGalleryArray(settings.galleryPreview.filter((_, i) => i !== index));
    const handleUpdateGalleryImage = (index, value) => {
        const newArray = [...settings.galleryPreview];
        newArray[index] = value;
        updateGalleryArray(newArray);
    };
    const syncTestimonialsToDB = async (updatedTestimonials) => {
        setTestimonials(updatedTestimonials); // Update UI immediately
        try {
            await api.put("/content/testimonials", { testimonials: updatedTestimonials });
        } catch (error) {
            console.error("Failed to save testimonials:", error);
            toast.error("Failed to save review to database.");
        }
    };
    const handleAddTestimonial = () => {
        const newTestimonial = {
            _id: Date.now().toString(), // Temp ID, backend will replace it
            rating: 5,
            message: "New review message",
            name: "Name",
            location: "City"
        };
        syncTestimonialsToDB([...testimonials, newTestimonial]);
    };
    const handleDeleteTestimonial = (id) => {
        const filtered = testimonials.filter(t => t._id !== id);
        syncTestimonialsToDB(filtered);
    };
    const handleUpdateTestimonial = (id, field, value) => {
        const updated = testimonials.map(t =>
            t._id === id ? { ...t, [field]: value } : t
        );
        syncTestimonialsToDB(updated);
    };

    // --- Emergency Restore Feature ---
    const handleRestoreDefaults = async () => {
        setIsResetting(true);
        try {
            await api.put("/content/global", defaultSettings);
            setSettings(defaultSettings);
            toast.success("Home page dummy data restored successfully!");
            setShowResetModal(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Failed to restore defaults:", error);
            toast.error("Failed to restore default data.");
        } finally {
            setIsResetting(false);
        }
    };

    const showWhyUs = settings.whyUsCards.length > 0 || !isMobile;
    const showGallery = settings.galleryPreview.length > 0 || !isMobile;
    const showTestimonials = testimonials.length > 0 || !isMobile;

    return (
        <>
            {/* ✨ MAIN ANIMATED CONTAINER ✨ 
                This now wraps only the page sections, preventing the sticky buttons from breaking.
            */}
            <div className={`w-full transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

                {/* Hero Section */}
                <section className="relative isolate overflow-hidden min-h-[80vh] flex flex-col justify-center bg-black group">
                    {isSuperAdmin && !isMobile && (
                        <div className="absolute top-24 right-8 z-50 bg-black/80 p-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-3 border border-white/20">
                            <p className="text-white text-xs font-bold uppercase tracking-wider">Edit Background Videos</p>
                            <div className="flex flex-col gap-1 text-xs">
                                <span className="text-white/60">Desktop Video URL:</span>
                                <div className="bg-white/10 p-1 rounded min-w-62.5">
                                    <InlineEditor value={settings.heroVideoUrl || defaultSettings.heroVideoUrl} onSave={(val) => handleCMSFieldSave("heroVideoUrl", val)} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 text-xs">
                                <span className="text-white/60">Mobile Video URL:</span>
                                <div className="bg-white/10 p-1 rounded min-w-62.5">
                                    <InlineEditor value={settings.heroVideoMobileUrl || defaultSettings.heroVideoMobileUrl} onSave={(val) => handleCMSFieldSave("heroVideoMobileUrl", val)} />
                                </div>
                            </div>
                        </div>
                    )}

                    <video ref={desktopVideoRef} autoPlay loop muted playsInline className="absolute inset-0 -z-10 h-full w-full object-cover hidden md:block opacity-40">
                        <source src={settings.heroVideoUrl || defaultSettings.heroVideoUrl} type="video/mp4" />
                    </video>
                    <video ref={mobileVideoRef} autoPlay loop muted playsInline className="absolute inset-0 -z-10 h-full w-full object-cover block md:hidden opacity-40">
                        <source src={settings.heroVideoMobileUrl || defaultSettings.heroVideoMobileUrl} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/60 via-transparent to-black/80" />

                    <div className="mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8 lg:py-52 relative z-10">
                        {isLoadingContent ? (
                            <HeroContentSkeleton />
                        ) : (
                            <div className="max-w-2xl text-primary-foreground">
                                <span className="inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest backdrop-blur-md">
                                    {renderEditableText("tagline")}
                                </span>
                                <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl text-white">
                                    {renderEditableText("heroTitle")}
                                </h1>
                                <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg leading-relaxed">
                                    {renderEditableText("heroSubtitle", "textarea")}
                                </p>
                                <div className="mt-8 flex flex-wrap gap-4">
                                    <InquiryDialog
                                        source="Home Hero Section"
                                        trigger={
                                            <Button size="lg" className="bg-[#FA6D16] px-8 text-white hover:bg-[#E55B05] shadow-lg transition-transform active:scale-95 font-bold rounded-xl h-12">
                                                Plan my trip
                                            </Button>
                                        }
                                    />
                                    <Link to="/packages">
                                        <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 transition-transform active:scale-95 rounded-xl h-12">
                                            Browse packages <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Feature Grids */}
                {showWhyUs && (
                    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                        {settings.whyUsCards.length > 0 && (
                            <div className="mb-8">
                                <h2 className="font-serif text-2xl font-bold">{renderEditableText("whyUsTitle")}</h2>
                            </div>
                        )}
                        <div className="grid gap-8 md:grid-cols-3">
                            {settings.whyUsCards.map((card, idx) => (
                                <div key={card._id || idx} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                    {isSuperAdmin && !isMobile && (
                                        <button onClick={() => handleDeleteWhyUsCard(idx)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <DynamicIcon name={card.icon} className="h-8 w-8 text-[#FA6D16]" />
                                        {isSuperAdmin && !isMobile && (
                                            <div className="text-[11px] font-mono bg-muted/40 text-muted-foreground px-2 py-1 rounded border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                Icon: <InlineEditor value={card.icon || "Compass"} onSave={(val) => handleUpdateWhyUsCard(idx, "icon", val)} />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="mt-4 font-serif text-xl text-foreground font-semibold">
                                        {isMobile ? card.title : <InlineEditor value={card.title} onSave={(val) => handleUpdateWhyUsCard(idx, "title", val)} />}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                        {isMobile ? card.body : <InlineEditor type="textarea" value={card.body} onSave={(val) => handleUpdateWhyUsCard(idx, "body", val)} />}
                                    </p>
                                </div>
                            ))}
                            {isSuperAdmin && !isMobile && (
                                <div onClick={handleAddWhyUsCard} className="rounded-2xl border-2 border-dashed border-border/60 bg-transparent p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100 min-h-40">
                                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm font-medium text-muted-foreground">Add Feature Card</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Gallery Section */}
                {showGallery && (
                    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                        {settings.galleryPreview.length > 0 && (
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <p className="font-serif text-sm uppercase tracking-widest text-[#FA6D16] font-bold">
                                        {renderEditableText("galleryTagline")}
                                    </p>
                                    <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                        {renderEditableText("galleryTitle")}
                                    </h2>
                                </div>
                                <div className="flex gap-4">
                                    {isSuperAdmin && !isMobile && (
                                        <Button onClick={handleAddGalleryImage} variant="outline" className="font-bold rounded-full">
                                            <Plus className="mr-2 h-4 w-4" /> Add Media
                                        </Button>
                                    )}
                                    <Link to="/gallery">
                                        <Button variant="ghost" className="text-foreground hover:bg-muted font-bold rounded-full">
                                            View full gallery <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {settings.galleryPreview.map((src, idx) => (
                                <GalleryItem
                                    key={idx}
                                    src={src}
                                    idx={idx}
                                    isFirst={idx === 0}
                                    isSuperAdmin={isSuperAdmin}
                                    isMobile={isMobile}
                                    onSave={handleUpdateGalleryImage}
                                    onDelete={handleDeleteGalleryImage}
                                    onImageError={handleImageError}
                                />
                            ))}
                            {isSuperAdmin && !isMobile && settings.galleryPreview.length === 0 && (
                                <div onClick={handleAddGalleryImage} className="aspect-4/3 rounded-2xl border-2 border-dashed border-border/60 bg-transparent flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100">
                                    <ImageOff className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm font-medium text-muted-foreground">Gallery is empty. Click to add.</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Testimonials Block */}
                {isLoadingTestimonials ? (
                    <TestimonialsSkeleton />
                ) : showTestimonials && (
                    <section className="bg-muted/30 py-20 transition-opacity duration-500 relative">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="font-serif text-sm uppercase tracking-widest text-[#FA6D16] font-bold">
                                        {renderEditableText("testimonialsTagline")}
                                    </p>
                                    <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                        {renderEditableText("testimonialsTitle")}
                                    </h2>
                                </div>
                                {isSuperAdmin && !isMobile && (
                                    <Button onClick={handleAddTestimonial} variant="outline" className="rounded-full">
                                        <Plus className="mr-2 h-4 w-4" /> Add Review
                                    </Button>
                                )}
                            </div>

                            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {testimonials.map((t) => (
                                    <blockquote key={t._id} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                        {isSuperAdmin && !isMobile && (
                                            <button onClick={() => handleDeleteTestimonial(t._id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        <div className="flex gap-1 text-amber-500">
                                            {Array.from({ length: t.rating }).map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                        <p className="mt-3 text-sm leading-relaxed text-foreground font-medium">
                                            “{isMobile ? t.message : <InlineEditor type="textarea" value={t.message} onSave={(val) => handleUpdateTestimonial(t._id, "message", val)} />}”
                                        </p>
                                        <footer className="mt-4 text-xs font-semibold flex items-center gap-1">
                                            <span className="text-foreground">
                                                {isMobile ? t.name : <InlineEditor value={t.name} onSave={(val) => handleUpdateTestimonial(t._id, "name", val)} />}
                                            </span>
                                            <span className="text-muted-foreground"> · </span>
                                            <span className="text-muted-foreground">
                                                {isMobile ? t.location : <InlineEditor value={t.location} onSave={(val) => handleUpdateTestimonial(t._id, "location", val)} />}
                                            </span>
                                        </footer>
                                    </blockquote>
                                ))}
                                {isSuperAdmin && !isMobile && testimonials.length === 0 && (
                                    <div onClick={handleAddTestimonial} className="rounded-2xl border-2 border-dashed border-border/60 bg-transparent flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100 min-h-37.5">
                                        <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm font-medium text-muted-foreground">No reviews yet. Click to add one.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Bottom Funnel Call to Action Panel */}
                {settings.showCtaCard !== false ? (
                    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative group">
                        {isSuperAdmin && !isMobile && (
                            <button
                                onClick={() => handleCMSFieldSave("showCtaCard", false)}
                                className="absolute top-24 right-12 z-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-full shadow-lg"
                                title="Remove CTA Section"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                        <div className="relative overflow-hidden rounded-[2rem] bg-[#2A5244] px-8 py-16 text-white sm:px-16 sm:py-20 shadow-xl border border-[#2A5244]/20">
                            <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
                                <Map className="h-96 w-96 text-white" />
                            </div>
                            <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                                <div className="max-w-xl">
                                    <span className="font-serif text-sm uppercase tracking-widest text-[#FA6D16] font-bold inline-block bg-black/20 p-1 rounded">
                                        {renderEditableText("ctaSubtitle")}
                                    </span>
                                    <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl font-bold text-white">
                                        <div className="bg-black/10 rounded p-1">
                                            {renderEditableText("ctaTitle")}
                                        </div>
                                    </h2>
                                    <p className="mt-4 text-base text-white/80 sm:text-lg leading-relaxed">
                                        <div className="bg-black/10 rounded p-1">
                                            {renderEditableText("ctaBody", "textarea")}
                                        </div>
                                    </p>
                                </div>
                                <Link to="/discover" className="shrink-0">
                                    <Button size="lg" className="bg-[#FA6D16] hover:bg-[#E55B05] text-white font-bold rounded-xl h-14 text-base shadow-lg transition-transform active:scale-95 px-8">
                                        Discover Destinations
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                ) : (
                    isSuperAdmin && !isMobile && (
                        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                            <div onClick={() => handleCMSFieldSave("showCtaCard", true)} className="rounded-[2rem] border-2 border-dashed border-border/60 bg-transparent flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100 min-h-37.5">
                                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium text-muted-foreground">CTA Section is hidden. Click to add back.</span>
                            </div>
                        </section>
                    )
                )}

            </div>
            {/* ✨ END OF ANIMATED CONTAINER ✨ */}

            {/* ✨ FIXED ELEMENTS LIVE OUTSIDE THE TRANSFORMED DIV ✨ */}

            {/* WhatsApp Floating Button */}
            {whatsappNumber && (
                <a
                    href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent("Hello Nepal Trip! I'm interested in planning a journey and would love some more information.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-100 bg-[#25D366] hover:bg-[#1ebd5a] text-white p-3.5 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500"
                    aria-label="Chat on WhatsApp"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.005-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                    </svg>
                </a>
            )}

            {/* Floating Restore Button & Beautiful Dialog */}
            {isSuperAdmin && !isMobile && (
                <>
                    {/* ✨ MOVED to left-6 to prevent overlapping with the new WhatsApp button ✨ */}
                    <div className="fixed bottom-6 left-6 md:left-8 z-50">
                        <Button
                            onClick={() => setShowResetModal(true)}
                            variant="destructive"
                            className="shadow-2xl font-bold rounded-full px-6 flex items-center gap-2"
                        >
                            <Icons.RotateCcw className="h-4 w-4" /> Reset Data
                        </Button>
                    </div>

                    {showResetModal && (
                        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                            <div className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform animate-in zoom-in-95 duration-200">
                                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                    <Icons.AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Restore Default Data?</h3>
                                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                    This will overwrite the current live database with the original placeholder content. Any custom changes you've made to this page will be lost.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="outline" onClick={() => setShowResetModal(false)} disabled={isResetting} className="rounded-xl w-full">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleRestoreDefaults} disabled={isResetting} className="bg-red-500 hover:bg-red-600 text-white rounded-xl w-full flex items-center justify-center">
                                        {isResetting ? <Icons.Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Yes, Restore
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}