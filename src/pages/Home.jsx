import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Heart, ShieldCheck, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { PackageCard } from "../components/site/PackageCard";
import { InquiryDialog } from "../components/site/InquiryDialog";
import { heroImage } from "../lib/images";

export default function Home() {
    // Temporary fallback data to keep the UI beautiful before the backend connects
    const [settings, setSettings] = useState({
        brand_name: "Wanderlust Travels",
        tagline: "CURATED JOURNEYS, UNFORGETTABLE MEMORIES",
        hero_title: "Journeys crafted for the way you travel",
        hero_subtitle: "Handpicked tour packages across breathtaking destinations. Tell us where you dream of going — we handle the rest.",
    });
    const [packages, setPackages] = useState([]);
    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        // 🌐 Future backend connection point
        // fetch('/api/settings').then(res => res.json()).then(setSettings);
        // fetch('/api/packages/featured').then(res => res.json()).then(setPackages);
        // fetch('/api/testimonials').then(res => res.json()).then(setTestimonials);
    }, []);

    return (
        <div className="min-h-screen">
            <Header brand={settings.brand_name} />

            {/* Hero */}
            <section className="relative isolate overflow-hidden">
                <img
                    src={settings.hero_image || heroImage}
                    alt="Travel destination"
                    width={1920}
                    height={1280}
                    className="absolute inset-0 -z-10 h-full w-full object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
                <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8 lg:py-52">
                    <div className="max-w-2xl text-primary-foreground">
                        <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest backdrop-blur">
                            {settings.tagline}
                        </span>
                        <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                            {settings.hero_title}
                        </h1>
                        <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
                            {settings.hero_subtitle}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/packages">
                                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                                    Browse packages <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                            <InquiryDialog
                                trigger={
                                    <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                                        Plan my trip
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why us */}
            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        { icon: Compass, title: "Handcrafted itineraries", body: "Every trip is designed around what you love — no cookie-cutter tours." },
                        { icon: ShieldCheck, title: "Trusted since 2015", body: "Thousands of travelers, five-star reviews and full on-trip support." },
                        { icon: Heart, title: "Local partners", body: "We work with local guides and hosts so your money reaches the community." },
                    ].map((f) => (
                        <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6">
                            <f.icon className="h-8 w-8 text-accent" />
                            <h3 className="mt-4 font-serif text-xl">{f.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured packages */}
            <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="font-serif text-sm uppercase tracking-widest text-accent">Featured journeys</p>
                        <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Where our travelers are going</h2>
                    </div>
                    <Link to="/packages" className="hidden text-sm text-primary hover:underline sm:inline">
                        View all →
                    </Link>
                </div>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.map((p) => (
                        <PackageCard key={p.id} pkg={p} />
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <section className="bg-secondary/40 py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <p className="font-serif text-sm uppercase tracking-widest text-accent">Kind words</p>
                        <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Loved by travelers</h2>
                        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {testimonials.slice(0, 3).map((t) => (
                                <blockquote key={t.id} className="rounded-2xl border border-border/60 bg-card p-6">
                                    <div className="flex gap-1 text-accent">
                                        {Array.from({ length: t.rating }).map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-foreground">“{t.message}”</p>
                                    <footer className="mt-4 text-sm">
                                        <span className="font-medium">{t.name}</span>
                                        {t.location && <span className="text-muted-foreground"> · {t.location}</span>}
                                    </footer>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-primary px-8 py-14 text-primary-foreground sm:px-14">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="max-w-xl font-serif text-3xl sm:text-4xl">Have somewhere in mind? Let's plan it together.</h2>
                            <p className="mt-3 text-primary-foreground/80">Tell us where you dream of going and we'll build a trip around it.</p>
                        </div>
                        <InquiryDialog
                            trigger={
                                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                                    Start planning
                                </Button>
                            }
                        />
                    </div>
                </div>
            </section>

            <Footer settings={settings} />
        </div>
    );
}