import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Mail, Phone, MapPin, Send, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { InlineEditor } from "../../components/admin/InlineEditor";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

// --- Default Configuration (Form building elements completely removed) ---
const defaultSettings = {
    page_tagline: "Say hello",
    page_title: "Let's plan your journey",
    page_subtitle: "Tell us a bit about the trip you have in mind and we'll get back within one business day.",
    contact_email: "info@nepaltrip.in",
    contact_phone: "+977-1-4000000",
    contact_address: "Thamel, Kathmandu, Nepal",
};

export default function Contact() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // Ensure SuperAdmin functions only show on Desktop
    const [isDesktop, setIsDesktop] = useState(true);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const activeGodMode = isAuthenticated && user?.role === "SuperAdmin" && isDesktop;

    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState(defaultSettings);

    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        document.title = "Contact — NepalTrip";
        const timer = setTimeout(() => setIsMounted(true), 50);

        const fetchContactContent = async () => {
            try {
                const { data } = await api.get("/content/contact");
                if (data) setSettings(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error("Contact page fetch failure:", error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContactContent();
        return () => clearTimeout(timer);
    }, []);

    const handleCMSFieldSave = async (fieldKey, updatedValue) => {
        setSettings(prev => ({ ...prev, [fieldKey]: updatedValue }));
        try {
            await api.put("/content/contact", { [fieldKey]: updatedValue });
        } catch (error) {
            console.error(`Failed to save ${fieldKey}`);
        }
    };

    const renderEditableText = (fieldKey, type = "text") => {
        const displayValue = settings[fieldKey] || defaultSettings[fieldKey] || "";
        return activeGodMode ? (
            <InlineEditor type={type} value={displayValue} onSave={(val) => handleCMSFieldSave(fieldKey, val)} />
        ) : (
            <span>{displayValue}</span>
        );
    };

    // --- Unified Form Submission Handler ---
    const onSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        // Assemble matching object structure
        const formData = {
            name: fd.get("name"),
            email: fd.get("email"),
            phone: fd.get("phone"),
            travel_date: fd.get("travel_date"),
            travelers: fd.get("travelers"),
            message: fd.get("message")
        };

        setSubmitting(true);
        try {
            // Sending payload mapped exactly to backend expectations with the source
            await api.post("/inquiries", {
                formData,
                source: "Contact Page" // Hardcoded origin
            });
            toast.success("Message sent! We'll be in touch soon.");
            e.target.reset();
        } catch (error) {
            toast.error("Could not send message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRestoreDefaults = async () => {
        setIsResetting(true);
        try {
            await api.put("/content/contact", defaultSettings);
            setSettings(defaultSettings);
            toast.success("Contact page restored successfully!");
            setShowResetModal(false);
        } catch (error) {
            toast.error("Failed to restore default data.");
        } finally {
            setIsResetting(false);
        }
    };

    // --- Shimmer UI Loader ---
    if (isLoading) return (
        <div className="w-full bg-background min-h-[calc(100dvh-4rem)] py-12 md:py-20 animate-pulse">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 flex flex-col items-center">
                    <div className="h-4 w-24 bg-muted rounded-full mb-4"></div>
                    <div className="h-10 sm:h-14 w-3/4 max-w-md bg-muted rounded-xl mb-6"></div>
                    <div className="h-6 w-full max-w-xl bg-muted rounded-lg"></div>
                </div>
                <div className="grid gap-12 lg:grid-cols-12 items-start">
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-card p-8 rounded-3xl border border-border/50 h-80 flex flex-col gap-6">
                            <div className="h-8 w-1/2 bg-muted rounded-md mb-2"></div>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="h-11 w-11 rounded-xl bg-muted shrink-0"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 w-16 bg-muted rounded"></div>
                                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-7 bg-card p-8 md:p-10 rounded-3xl border border-border/50 h-125"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`w-full transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="w-full bg-background min-h-[calc(100dvh-4rem)] py-12 md:py-20 font-sans relative">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="text-center mb-16">
                        <p className="font-serif text-xs uppercase tracking-widest text-primary mb-3 font-bold">
                            {renderEditableText("page_tagline")}
                        </p>
                        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-foreground">
                            {renderEditableText("page_title")}
                        </h1>
                        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                            {renderEditableText("page_subtitle", "textarea")}
                        </p>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-12 items-start">
                        {/* Contact Details Card */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="font-serif text-2xl font-bold mb-6 text-foreground">Contact Details</h3>
                                <div className="space-y-6">

                                    <a href={`mailto:${settings.contact_email}`} className="flex items-start gap-4 group">
                                        <div className="p-3 shrink-0 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Email Us</p>
                                            <p className="text-foreground font-medium">{renderEditableText("contact_email")}</p>
                                        </div>
                                    </a>

                                    <a href={`tel:${settings.contact_phone.replace(/[^0-9+]/g, '')}`} className="flex items-start gap-4 group">
                                        <div className="p-3 shrink-0 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Call Us</p>
                                            <p className="text-foreground font-medium">{renderEditableText("contact_phone")}</p>
                                        </div>
                                    </a>

                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contact_address)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                                        <div className="p-3 shrink-0 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Our Office</p>
                                            <p className="text-foreground font-medium">{renderEditableText("contact_address")}</p>
                                        </div>
                                    </a>

                                </div>
                            </div>
                        </div>

                        {/* Standardized Form (Matches Inquiry Dialog Fields) */}
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            onSubmit={onSubmit}
                            className="lg:col-span-7 space-y-4 bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-xl"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-sm font-medium">Full name <span className="text-primary">*</span></Label>
                                <Input id="name" name="name" required placeholder="John Doe" className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email <span className="text-primary">*</span></Label>
                                    <Input id="email" name="email" type="email" required placeholder="john@example.com" className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                                    <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="travel_date" className="text-sm font-medium">Travel date</Label>
                                    <Input id="travel_date" name="travel_date" type="date" className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="travelers" className="text-sm font-medium">Travelers</Label>
                                    <Input id="travelers" name="travelers" type="number" min={1} defaultValue={2} className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="message" className="text-sm font-medium">Message (optional)</Label>
                                <Textarea id="message" name="message" rows={3} placeholder="Tell us about your dream trip..." className="rounded-2xl resize-none transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full h-14 rounded-full text-lg font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 bg-primary text-white hover:bg-primary/90">
                                {submitting ? <><Loader2 className="animate-spin" /> Sending...</> : <><Send size={18} /> Send message</>}
                            </Button>
                        </motion.form>
                    </div>
                </div>

                {/* --- SuperAdmin Reset Modal --- */}
                {activeGodMode && (
                    <>
                        <div className="fixed bottom-6 right-6 z-50">
                            <Button onClick={() => setShowResetModal(true)} variant="destructive" className="shadow-2xl font-bold rounded-full px-6 flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" /> Reset Layout
                            </Button>
                        </div>

                        <AnimatePresence>
                            {showResetModal && (
                                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center"
                                    >
                                        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                            <AlertTriangle className="h-8 w-8 text-red-500" />
                                        </div>
                                        <h3 className="font-serif text-2xl font-bold mb-2">Restore Default Layout?</h3>
                                        <p className="text-muted-foreground text-sm mb-6">This overwrites the live database with placeholder content.</p>
                                        <div className="flex gap-3 justify-center">
                                            <Button variant="outline" onClick={() => setShowResetModal(false)} disabled={isResetting} className="w-full font-bold rounded-xl">Cancel</Button>
                                            <Button onClick={handleRestoreDefaults} disabled={isResetting} className="bg-red-500 hover:bg-red-600 text-white w-full font-bold rounded-xl">
                                                {isResetting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Yes, Restore"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}