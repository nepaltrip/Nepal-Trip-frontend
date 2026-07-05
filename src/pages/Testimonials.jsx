import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function Testimonials() {
    const [settings, setSettings] = useState({ brand_name: "NepalTrip" });
    const [items, setItems] = useState([]);

    useEffect(() => {
        document.title = "Testimonials — Wanderlust Travels";

        // Simulating initial fetch load array configurations
        setItems([
            {
                id: "t1",
                rating: 5,
                message: "Our trip to Kathmandu and Pokhara was flawlessly planned. The mountain flight was an unforgettable memory!",
                name: "Aman Malhotra",
                location: "Delhi, India"
            },
            {
                id: "t2",
                rating: 5,
                message: "Excellent customer service and highly experienced local guides. Understood our custom pacing perfectly.",
                name: "Priya Sharma",
                location: "Mumbai, India"
            }
        ]);
    }, []);

    return (
        <div className="min-h-screen">
            <Header brand={settings.brand_name} />

            <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <p className="font-serif text-sm uppercase tracking-widest text-accent">Kind words</p>
                <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Traveler stories</h1>

                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((t) => (
                        <blockquote key={t.id} className="rounded-2xl border border-border/60 bg-card p-6">
                            <div className="flex gap-1 text-accent">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>
                            <p className="mt-3 leading-relaxed text-foreground">“{t.message}”</p>
                            <footer className="mt-4 text-sm">
                                <span className="font-medium">{t.name}</span>
                                {t.location && <span className="text-muted-foreground"> · {t.location}</span>}
                            </footer>
                        </blockquote>
                    ))}
                </div>
            </section>

            <Footer settings={settings} />
        </div>
    );
}