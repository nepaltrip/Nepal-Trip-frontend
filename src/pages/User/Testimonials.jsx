import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Star, Quote, Plus, Trash2, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { InlineEditor } from "../../components/admin/InlineEditor";
import { toast } from "react-toastify";
import api from "../../api/axios";
import SEO from "../../components/site/SEO";

// --- Isolated Skeleton ---
const TestimonialsMasonrySkeleton = () => (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 animate-pulse w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
                key={i}
                className={`break-inside-avoid relative overflow-hidden rounded-3xl border border-border/50 bg-card p-6 md:p-8 shadow-sm ${i % 2 === 0 ? 'h-64' : 'h-72'}`}
            >
                <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="h-4 w-4 rounded-sm bg-muted" />
                    ))}
                </div>
                <div className="space-y-3 mb-8">
                    <div className="h-4 w-full rounded-md bg-muted" />
                    <div className="h-4 w-full rounded-md bg-muted" />
                    <div className="h-4 w-4/5 rounded-md bg-muted" />
                    {i % 2 !== 0 && <div className="h-4 w-3/4 rounded-md bg-muted" />}
                </div>
                <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                        <div className="h-3 w-32 rounded-md bg-muted" />
                        <div className="h-2 w-24 rounded-md bg-muted" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// --- Default Configuration (Dummy Data) ---
const defaultSettings = {
    page_tagline: "Kind Words",
    page_title: "Traveler Stories",
    page_subtitle: "Don't just take our word for it. Read what our guests have to say about their Himalayan adventures with us.",
    testimonials: [
        {
            _id: "t1",
            rating: 5,
            message: "Our trip to Kathmandu and Pokhara was flawlessly planned. The mountain flight was an unforgettable memory! Every detail, from the airport pickups to the hotel check-ins, was handled with absolute professionalism.",
            name: "Aman Malhotra",
            location: "Delhi, India"
        },
        {
            _id: "t2",
            rating: 5,
            message: "Excellent customer service and highly experienced local guides. They understood our custom pacing perfectly and never rushed us during the treks.",
            name: "Priya Sharma",
            location: "Mumbai, India"
        },
        {
            _id: "t3",
            rating: 5,
            message: "Trekking to Everest Base Camp was a lifelong dream. The team ensured we were acclimatized properly and provided top-notch gear and support. I couldn't have asked for a better crew to guide me to the roof of the world.",
            name: "Rahul Verma",
            location: "Bangalore, India"
        },
        {
            _id: "t4",
            rating: 4,
            message: "The Chitwan jungle safari was thrilling! We spotted rhinos on our very first day. The eco-lodge they booked for us was stunning and extremely comfortable.",
            name: "Sneha Kapoor",
            location: "Pune, India"
        },
        {
            _id: "t5",
            rating: 5,
            message: "We booked our honeymoon with NepalTrip and it was magical. The private dinner overlooking the Annapurna range was a massive highlight. Highly recommended for couples looking for a mix of adventure and luxury.",
            name: "Vikram & Aditi",
            location: "Hyderabad, India"
        },
        {
            _id: "t6",
            rating: 5,
            message: "As a solo female traveler, safety was my biggest concern. The agency made me feel incredibly secure and paired me with a fantastic female guide. A truly empowering experience.",
            name: "Anjali Desai",
            location: "Ahmedabad, India"
        }
    ]
};

export default function Testimonials() {
    // Auth Check
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isSuperAdmin = isAuthenticated && user?.role === "SuperAdmin";

    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [settings, setSettings] = useState(defaultSettings);

    // Modal State
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        // ✨ REMOVED document.title from here
        const mountTimer = setTimeout(() => setIsMounted(true), 50);

        const fetchTestimonialContent = async () => {
            try {
                const { data } = await api.get("/content/testimonials");
                if (data) setSettings(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error("Testimonials page fetch failure:", error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestimonialContent();
        return () => clearTimeout(mountTimer);
    }, []);

    const handleCMSFieldSave = async (fieldKey, updatedValue) => {
        setSettings(prev => ({ ...prev, [fieldKey]: updatedValue }));
        try {
            await api.put("/content/testimonials", { [fieldKey]: updatedValue });
        } catch (error) {
            console.error(`Failed to save ${fieldKey}`);
        }
    };

    const renderEditableText = (fieldKey, type = "text") => {
        const displayValue = settings[fieldKey] || defaultSettings[fieldKey] || "";
        if (isMobile) return <>{displayValue}</>;
        return <InlineEditor type={type} value={displayValue} onSave={(val) => handleCMSFieldSave(fieldKey, val)} />;
    };

    // --- Array Handlers for Testimonials ---
    const updateTestimonialsArray = async (newArray) => {
        setSettings(prev => ({ ...prev, testimonials: newArray }));
        await handleCMSFieldSave("testimonials", newArray);
    };

    const handleAddTestimonial = () => {
        updateTestimonialsArray([
            {
                _id: Date.now().toString(),
                rating: 5,
                message: "New review message goes here. Tap to edit.",
                name: "Traveler Name",
                location: "City, Country"
            },
            ...settings.testimonials // Prepend new review to the top
        ]);
    };

    const handleDeleteTestimonial = (index) => {
        updateTestimonialsArray(settings.testimonials.filter((_, i) => i !== index));
    };

    const handleUpdateTestimonial = (index, field, value) => {
        const newArray = [...settings.testimonials];
        newArray[index] = { ...newArray[index], [field]: value };
        updateTestimonialsArray(newArray);
    };

    // --- Emergency Restore Feature ---
    const handleRestoreDefaults = async () => {
        setIsResetting(true);
        try {
            await api.put("/content/testimonials", defaultSettings);
            setSettings(defaultSettings);
            toast.success("Testimonials dummy data restored successfully!");
            setShowResetModal(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Failed to restore defaults:", error);
            toast.error("Failed to restore default data.");
        } finally {
            setIsResetting(false);
        }
    };

    // Helper to get initials safely
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <>
            {/* ✨ NEW SEO COMPONENT ✨ */}
            <SEO
                title={`${settings.page_title || "Traveler Stories"} | Nepal Trip`}
                description={settings.page_subtitle || "Read what our guests have to say about their Himalayan adventures with Nepal Trip."}
                url="https://nepaltrip.in/testimonials"
            />

            <div className={`w-full transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="w-full bg-background min-h-[calc(100dvh-4rem)] pt-6 pb-20 font-sans relative">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        {/* Header Section */}
                        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                            <p className="font-serif text-xs md:text-sm uppercase tracking-widest text-primary mb-2 font-bold">
                                {renderEditableText("page_tagline")}
                            </p>
                            <h1 className="font-serif text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
                                {renderEditableText("page_title")}
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base">
                                {renderEditableText("page_subtitle", "textarea")}
                            </p>
                        </div>

                        {/* Masonry Layout for varied-height cards */}
                        {isLoading ? (
                            <TestimonialsMasonrySkeleton />
                        ) : (
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 animate-in fade-in duration-700">

                                {/* SuperAdmin Add New Card (Placed at the top of the masonry) */}
                                {isSuperAdmin && !isMobile && (
                                    <div
                                        onClick={handleAddTestimonial}
                                        className="break-inside-avoid relative overflow-hidden rounded-3xl border-2 border-dashed border-border/60 bg-transparent flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100 min-h-64 mb-6"
                                    >
                                        <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm font-medium text-muted-foreground">Add New Review</span>
                                    </div>
                                )}

                                {settings.testimonials.map((t, idx) => (
                                    <motion.div
                                        key={t._id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.5, delay: (idx % 3) * 0.15 }}
                                        className="break-inside-avoid relative overflow-hidden rounded-3xl border border-border/50 bg-card p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow group"
                                    >
                                        {/* SuperAdmin Controls */}
                                        {isSuperAdmin && !isMobile && (
                                            <>
                                                <button
                                                    onClick={() => handleDeleteTestimonial(idx)}
                                                    className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-background/50 backdrop-blur p-1.5 rounded-full"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>

                                                <div className="absolute top-4 left-4 z-20 text-[10px] font-mono bg-background/80 backdrop-blur text-muted-foreground px-2 py-1 rounded border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 shadow-sm">
                                                    <span>Stars (1-5): <InlineEditor value={t.rating} onSave={(val) => handleUpdateTestimonial(idx, "rating", Number(val))} /></span>
                                                </div>
                                            </>
                                        )}

                                        {/* Watermark Quote Icon */}
                                        <Quote className="absolute -top-4 -right-4 h-24 w-24 text-muted/20 -rotate-12 pointer-events-none" />

                                        <div className="relative z-10 mt-4 md:mt-2">
                                            {/* Rating Stars */}
                                            <div className="flex gap-1 text-amber-500 mb-4">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={i < (t.rating || 5) ? "fill-amber-500 text-amber-500" : "fill-muted text-muted"}
                                                    />
                                                ))}
                                            </div>

                                            {/* Review Text */}
                                            <p className="leading-relaxed text-foreground text-sm md:text-base font-medium mb-6">
                                                “{isMobile ? t.message : <InlineEditor type="textarea" value={t.message} onSave={(val) => handleUpdateTestimonial(idx, "message", val)} />}”
                                            </p>

                                            {/* Traveler Profile Footer */}
                                            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                                                    {getInitials(t.name)}
                                                </div>
                                                <div className="flex flex-col w-full">
                                                    <span className="font-bold text-sm text-foreground">
                                                        {isMobile ? t.name : <InlineEditor value={t.name} onSave={(val) => handleUpdateTestimonial(idx, "name", val)} />}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {isMobile ? t.location : <InlineEditor value={t.location} onSave={(val) => handleUpdateTestimonial(idx, "location", val)} />}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Floating Restore Button & Beautiful Dialog */}
                    {isSuperAdmin && (
                        <>
                            <div className="fixed bottom-6 right-6 z-50">
                                <Button
                                    onClick={() => setShowResetModal(true)}
                                    variant="destructive"
                                    className="shadow-2xl font-bold rounded-full px-6 flex items-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" /> Reset Data
                                </Button>
                            </div>

                            {showResetModal && (
                                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                    <div className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform animate-in zoom-in-95 duration-200">
                                        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                            <AlertTriangle className="h-8 w-8 text-red-500" />
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
                                                {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Yes, Restore
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}