import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, useInView, animate } from "framer-motion";
import * as Icons from "lucide-react";
import { Plus, Trash2, ImageOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { InlineEditor } from "../../components/admin/InlineEditor";
import api from "../../api/axios";
import { toast } from "react-toastify";
import SEO from "../../components/site/SEO";

// Helper to render Lucide icons dynamically
const DynamicIcon = ({ name, className, size = 24, strokeWidth = 2 }) => {
    if (!name) return <Icons.HelpCircle className={className} size={size} strokeWidth={strokeWidth} />;
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    const Icon = Icons[name] || Icons[formattedName] || Icons.HelpCircle;
    return <Icon className={className} size={size} strokeWidth={strokeWidth} />;
};

// --- Isolated Skeletons ---
const AboutHeroSkeleton = () => (
    <div className="relative w-full h-[40vh] min-h-75 md:h-[50vh] rounded-[2rem] bg-muted/60 animate-pulse flex flex-col items-center justify-center p-6">
        <div className="h-6 w-24 bg-muted-foreground/20 rounded-full mb-4" />
        <div className="h-10 md:h-14 lg:h-16 w-3/4 max-w-2xl bg-muted-foreground/20 rounded-xl mb-2" />
        <div className="h-10 md:h-14 lg:h-16 w-2/3 max-w-xl bg-muted-foreground/20 rounded-xl" />
    </div>
);

const AboutTextSkeleton = () => (
    <div className="animate-pulse flex flex-col items-center md:items-center text-left md:text-center w-full">
        <div className="h-8 md:h-10 w-3/4 max-w-md bg-muted rounded-xl mb-8 mx-auto" />
        <div className="space-y-3 w-full max-w-3xl">
            <div className="h-4 md:h-5 w-full bg-muted rounded-md" />
            <div className="h-4 md:h-5 w-full bg-muted rounded-md" />
            <div className="h-4 md:h-5 w-11/12 bg-muted rounded-md mx-auto md:mx-0" />
            <div className="h-4 md:h-5 w-full bg-muted rounded-md mt-6" />
            <div className="h-4 md:h-5 w-4/5 bg-muted rounded-md mx-auto md:mx-0" />
        </div>
    </div>
);

// Custom Animated Counter Component
const AnimatedCounter = ({ from = 0, to, duration = 2, suffix = "", label, iconName }) => {
    const nodeRef = useRef();
    const inView = useInView(nodeRef, { once: true, margin: "-50px" });
    const targetValue = Number(to) || 0;

    useEffect(() => {
        if (inView) {
            const controls = animate(from, targetValue, {
                duration: duration,
                ease: "easeOut",
                onUpdate(value) {
                    if (nodeRef.current) {
                        nodeRef.current.textContent = Math.floor(value);
                    }
                }
            });
            return () => controls.stop();
        }
    }, [inView, from, targetValue, duration]);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-card border border-border/50 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="p-3 bg-primary/10 text-primary rounded-full mb-4">
                <DynamicIcon name={iconName} size={24} />
            </div>
            <div className="font-serif text-4xl md:text-5xl text-foreground font-bold drop-shadow-sm flex items-center justify-center">
                <span ref={nodeRef}>{from}</span>
                <span>{suffix}</span>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-2 font-bold uppercase tracking-widest text-center">
                {label}
            </div>
        </div>
    );
};

// --- Default Configuration (Dummy Data) ---
const defaultSettings = {
    hero_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1920&auto=format&fit=crop",
    hero_tagline: "Our Story",
    hero_title: "We bring you closer to the roof of the world.",
    about_tagline: "Who We Are",
    about_title: "Crafting Unforgettable Himalayan Journeys",
    about_body: "We are a passionate team of travel curators helping thousands of travelers discover the world since 2015. \n\nBorn out of a deep love for the Himalayas, our mission is to connect travelers with the authentic heart of Nepal. We don't just book tours; we design experiences that challenge, inspire, and transform you.",
    stats: [
        { _id: "s1", to: "5000", suffix: "+", label: "Happy Travelers", icon: "Users" },
        { _id: "s2", to: "40", suffix: "+", label: "Unique Destinations", icon: "Map" },
        { _id: "s3", to: "9", suffix: " yrs", label: "Of Travel Craft", icon: "Star" }
    ],
    values_title: "Why Travel With Us?",
    values_subtitle: "We believe travel should be more than just checking boxes. It should be safe, sustainable, and deeply enriching.",
    values: [
        { _id: "v1", icon: "Compass", title: "Expert Local Guides", description: "Our guides are born and raised in the mountains, offering you untold stories and unmatched safety." },
        { _id: "v2", icon: "Heart", title: "Sustainable Travel", description: "We partner strictly with eco-friendly lodges and ensure a portion of our profits goes to local village schools." },
        { _id: "v3", icon: "Shield", title: "100% Financial Protection", description: "Your bookings are completely secure. We provide full transparency with zero hidden costs, ever." }
    ]
};

export default function About() {
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

        const fetchAboutContent = async () => {
            try {
                const { data } = await api.get("/content/about");
                if (data) setSettings(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error("About page fetch failure:", error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAboutContent();
        return () => clearTimeout(mountTimer);
    }, []);

    const handleCMSFieldSave = async (fieldKey, updatedValue) => {
        setSettings(prev => ({ ...prev, [fieldKey]: updatedValue }));
        try {
            await api.put("/content/about", { [fieldKey]: updatedValue });
        } catch (error) {
            console.error(`Failed to save ${fieldKey}`);
        }
    };

    const renderEditableText = (fieldKey, type = "text") => {
        const displayValue = settings[fieldKey] || defaultSettings[fieldKey] || "";
        if (isMobile) return <>{displayValue}</>;
        return <InlineEditor type={type} value={displayValue} onSave={(val) => handleCMSFieldSave(fieldKey, val)} />;
    };

    // --- Array Handlers ---
    const updateStatsArray = async (newArray) => {
        setSettings(prev => ({ ...prev, stats: newArray }));
        await handleCMSFieldSave("stats", newArray);
    };
    const handleAddStat = () => updateStatsArray([...settings.stats, { _id: Date.now().toString(), to: "100", suffix: "+", label: "New Stat", icon: "Star" }]);
    const handleDeleteStat = (index) => updateStatsArray(settings.stats.filter((_, i) => i !== index));
    const handleUpdateStat = (index, field, value) => {
        const newArray = [...settings.stats];
        newArray[index] = { ...newArray[index], [field]: value };
        updateStatsArray(newArray);
    };

    const updateValuesArray = async (newArray) => {
        setSettings(prev => ({ ...prev, values: newArray }));
        await handleCMSFieldSave("values", newArray);
    };
    const handleAddValue = () => updateValuesArray([...settings.values, { _id: Date.now().toString(), icon: "Star", title: "New Value", description: "Description goes here." }]);
    const handleDeleteValue = (index) => updateValuesArray(settings.values.filter((_, i) => i !== index));
    const handleUpdateValue = (index, field, value) => {
        const newArray = [...settings.values];
        newArray[index] = { ...newArray[index], [field]: value };
        updateValuesArray(newArray);
    };

    // --- Emergency Restore Feature ---
    const handleRestoreDefaults = async () => {
        setIsResetting(true);
        try {
            await api.put("/content/about", defaultSettings);
            setSettings(defaultSettings);
            toast.success("About page dummy data restored successfully!");
            setShowResetModal(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Failed to restore defaults:", error);
            toast.error("Failed to restore default data.");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <>
            {/* ✨ NEW SEO COMPONENT ✨ */}
            <SEO
                title={`${settings.about_title || "About Us"} | Nepal Trip`}
                description="Learn about our passion for travel and how we craft unforgettable Himalayan journeys."
                url="https://nepaltrip.in/about"
            />

            <div className={`w-full transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="w-full bg-background min-h-screen pb-20 font-sans relative">

                    {/* Cinematic Hero Section */}
                    <section className="px-4 pt-6 pb-12 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {isLoading ? (
                            <AboutHeroSkeleton />
                        ) : (
                            <div className="relative w-full h-[40vh] min-h-75 md:h-[50vh] rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in duration-700 group">
                                {isSuperAdmin && !isMobile && (
                                    <div className="absolute top-4 right-4 z-50 bg-black/80 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 border border-white/20">
                                        <span className="text-white/60 text-xs font-bold uppercase">Edit Hero Image URL:</span>
                                        <div className="bg-white/10 p-1 rounded min-w-62.5 text-white">
                                            <InlineEditor value={settings.hero_image} onSave={(val) => handleCMSFieldSave("hero_image", val)} />
                                        </div>
                                    </div>
                                )}

                                <img src={settings.hero_image} alt="Himalayan landscape" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                    <motion.span
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="inline-block bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30 mb-4"
                                    >
                                        {renderEditableText("hero_tagline")}
                                    </motion.span>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                        className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-3xl leading-tight drop-shadow-lg"
                                    >
                                        {renderEditableText("hero_title")}
                                    </motion.h1>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Dynamic Stats Section */}
                    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {settings.stats.map((stat, idx) => (
                                <div key={stat._id || idx} className="relative group">
                                    {isSuperAdmin && !isMobile && (
                                        <div className="absolute -top-3 -right-3 z-50 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeleteStat(idx)} className="bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}

                                    {isSuperAdmin && !isMobile && (
                                        <div className="absolute top-2 left-2 z-40 text-[10px] font-mono bg-background/80 backdrop-blur text-muted-foreground px-2 py-1 rounded border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                            <span>Icon: <InlineEditor value={stat.icon} onSave={(val) => handleUpdateStat(idx, "icon", val)} /></span>
                                            <span>Target #: <InlineEditor value={stat.to} onSave={(val) => handleUpdateStat(idx, "to", val)} /></span>
                                        </div>
                                    )}

                                    <AnimatedCounter
                                        to={stat.to}
                                        iconName={stat.icon}
                                        suffix={isMobile ? stat.suffix : <InlineEditor value={stat.suffix} onSave={(val) => handleUpdateStat(idx, "suffix", val)} />}
                                        label={isMobile ? stat.label : <InlineEditor value={stat.label} onSave={(val) => handleUpdateStat(idx, "label", val)} />}
                                    />
                                </div>
                            ))}

                            {isSuperAdmin && !isMobile && (
                                <div onClick={handleAddStat} className="rounded-3xl border-2 border-dashed border-border/60 bg-card/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100 min-h-32">
                                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm font-medium text-muted-foreground">Add Stat block</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Core About Content */}
                    <section className="max-w-4xl mx-auto px-4 py-16 md:py-24 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                        <p className="font-serif text-sm uppercase tracking-widest text-primary mb-3">
                            {renderEditableText("about_tagline")}
                        </p>
                        {isLoading ? (
                            <AboutTextSkeleton />
                        ) : (
                            <div className="animate-in fade-in duration-700 w-full">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-8">
                                    {renderEditableText("about_title")}
                                </h2>
                                <div className="text-base md:text-lg text-muted-foreground leading-relaxed text-left md:text-center">
                                    {isMobile ? (
                                        settings.about_body.split('\n\n').map((paragraph, idx) => (
                                            <p key={idx} className="mb-4">{paragraph}</p>
                                        ))
                                    ) : (
                                        <InlineEditor type="textarea" value={settings.about_body} onSave={(val) => handleCMSFieldSave("about_body", val)} />
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Core Values / Why Travel With Us */}
                    <section className="bg-muted/30 py-16 md:py-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    {renderEditableText("values_title")}
                                </h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto">
                                    {renderEditableText("values_subtitle", "textarea")}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                                {settings.values.map((value, idx) => (
                                    <motion.div
                                        key={value._id || idx}
                                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: idx * 0.15 }}
                                        className="relative flex flex-col items-center text-center p-6 rounded-3xl bg-card border border-border/50 shadow-sm group"
                                    >
                                        {isSuperAdmin && !isMobile && (
                                            <button onClick={() => handleDeleteValue(idx)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}

                                        <div className="flex items-center gap-3 relative">
                                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 transform -rotate-3 transition-transform hover:rotate-0">
                                                <DynamicIcon name={value.icon} size={32} strokeWidth={1.5} />
                                            </div>
                                            {isSuperAdmin && !isMobile && (
                                                <div className="absolute -right-24 top-0 text-[10px] font-mono bg-muted/80 backdrop-blur text-muted-foreground px-2 py-1 rounded border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Icon: <InlineEditor value={value.icon} onSave={(val) => handleUpdateValue(idx, "icon", val)} />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                                            {isMobile ? value.title : <InlineEditor value={value.title} onSave={(val) => handleUpdateValue(idx, "title", val)} />}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {isMobile ? value.description : <InlineEditor type="textarea" value={value.description} onSave={(val) => handleUpdateValue(idx, "description", val)} />}
                                        </p>
                                    </motion.div>
                                ))}

                                {isSuperAdmin && !isMobile && (
                                    <div onClick={handleAddValue} className="rounded-3xl border-2 border-dashed border-border/60 bg-transparent flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100 min-h-64">
                                        <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm font-medium text-muted-foreground">Add Value Card</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Floating Restore Button & Beautiful Dialog */}
                    {isSuperAdmin && (
                        <>
                            <div className="fixed bottom-6 right-6 z-50">
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
                </div>
            </div>
        </>
    );
}