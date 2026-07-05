import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Contact() {
    const [submitting, setSubmitting] = useState(false);

    // Temporary local state for site settings.
    // This will later be fetched from your Express/MongoDB backend.
    const [settings, setSettings] = useState({
        brand_name: "NepalTrip",
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

        // Basic frontend validation to replace Zod
        if (!data.name || data.name.trim().length < 2) {
            return toast.error("Name must be at least 2 characters.");
        }
        if (!data.email || !data.email.includes("@")) {
            return toast.error("Please enter a valid email address.");
        }
        if (!data.message || data.message.trim().length < 5) {
            return toast.error("Message must be at least 5 characters.");
        }

        setSubmitting(true);

        // Simulating an API POST request to your upcoming Express backend
        try {
            // Future fetch logic:
            // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
            console.log("Submitting contact message payload:", data);

            setTimeout(() => {
                setSubmitting(false);
                toast.success("Message sent! We'll be in touch soon.");
                e.target.reset(); // Clears the form fields automatically
            }, 800);

        } catch (error) {
            setSubmitting(false);
            toast.error("Could not send message. Please try again.");
        }
    }

    return (
        <div className="min-h-screen">
            <Header brand={settings.brand_name} />
            <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="grid gap-16 md:grid-cols-2">

                    {/* Contact Information Side */}
                    <div>
                        <p className="font-serif text-sm uppercase tracking-widest text-accent">Say hello</p>
                        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Let's plan your journey</h1>
                        <p className="mt-4 text-muted-foreground">
                            Tell us a bit about the trip you have in mind and we'll get back within one business day.
                        </p>
                        <ul className="mt-8 space-y-4 text-sm">
                            <li className="flex gap-3">
                                <Mail className="mt-0.5 h-4 w-4 text-accent" /> {settings.contact_email}
                            </li>
                            <li className="flex gap-3">
                                <Phone className="mt-0.5 h-4 w-4 text-accent" /> {settings.contact_phone}
                            </li>
                            <li className="flex gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 text-accent" /> {settings.contact_address}
                            </li>
                        </ul>
                    </div>

                    {/* Contact Form Side */}
                    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <Input id="phone" name="phone" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subject (Optional)</Label>
                            <Input id="subject" name="subject" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" rows={5} required />
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            {submitting ? "Sending..." : "Send message"}
                        </Button>
                    </form>

                </div>
            </section>
            <Footer settings={settings} />
        </div>
    );
}