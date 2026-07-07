import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function Contact() {
    const [submitting, setSubmitting] = useState(false);

    const [settings] = useState({
        contact_email: "info@nepaltrip.in",
        contact_phone: "+977-1-4000000",
        contact_address: "Thamel, Kathmandu, Nepal"
    });

    useEffect(() => {
        document.title = "Contact — NepalTrip";
    }, []);

    async function onSubmit(e) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const data = Object.fromEntries(fd);

        if (!data.name || data.name.trim().length < 2) return toast.error("Name must be at least 2 characters.");
        if (!data.email || !data.email.includes("@")) return toast.error("Please enter a valid email address.");
        if (!data.mobile || data.mobile.trim().length < 10) return toast.error("Please enter a valid mobile number.");
        if (!data.message || data.message.trim().length < 5) return toast.error("Message must be at least 5 characters.");

        setSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Message sent! We'll be in touch soon.");
            e.target.reset();
        } catch (error) {
            toast.error("Could not send message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="w-full bg-background min-h-[calc(100dvh-4rem)] py-12 md:py-20 font-sans">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <p className="font-serif text-xs uppercase tracking-widest text-primary mb-3">Say hello</p>
                    <h1 className="font-serif text-4xl sm:text-6xl font-bold text-foreground">Let's plan your journey</h1>
                    <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                        Tell us a bit about the trip you have in mind and we'll get back within one business day.
                    </p>
                </div>

                <div className="grid gap-12 lg:grid-cols-12 items-start">

                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm">
                            <h3 className="font-serif text-2xl font-bold mb-6">Contact Details</h3>
                            <div className="space-y-6">
                                {/* Email: Opens default Mail App */}
                                <a href={`mailto:${settings.contact_email}`} className="flex gap-4 group">
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Email Us</p>
                                        <p className="text-foreground font-medium">{settings.contact_email}</p>
                                    </div>
                                </a>

                                {/* Phone: Opens default Phone/Dialer App */}
                                <a href={`tel:${settings.contact_phone.replace(/[^0-9+]/g, '')}`} className="flex gap-4 group">
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Call Us</p>
                                        <p className="text-foreground font-medium">{settings.contact_phone}</p>
                                    </div>
                                </a>

                                {/* Map: Opens Google Maps */}
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contact_address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex gap-4 group"
                                >
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Our Office</p>
                                        <p className="text-foreground font-medium">{settings.contact_address}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onSubmit={onSubmit}
                        className="lg:col-span-7 space-y-6 bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-xl"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="John Doe" className="h-12" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="john@example.com" className="h-12" required />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="mobile">Mobile No.</Label>
                                <Input id="mobile" name="mobile" type="tel" placeholder="+977 0000000000" className="h-12" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject (Optional)</Label>
                                <Input id="subject" name="subject" placeholder="What is this regarding?" className="h-12" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" rows={6} placeholder="How can we help you plan your trip?" className="resize-none" required />
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-14 rounded-xl text-lg font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center gap-2"
                        >
                            {submitting ? (
                                <><Loader2 className="animate-spin" /> Sending...</>
                            ) : (
                                <><Send size={18} /> Send message</>
                            )}
                        </Button>
                    </motion.form>
                </div>
            </div>
        </div>
    );
}