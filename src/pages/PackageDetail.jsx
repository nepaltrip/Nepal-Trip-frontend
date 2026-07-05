import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, X, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InquiryDialog } from "@/components/InquiryDialog";
import { Button } from "@/components/ui/button";
import { resolveImage } from "@/lib/images";

export default function PackageDetail() {
    const { slug } = useParams();
    const [pkg, setPkg] = useState(null);
    const [settings, setSettings] = useState({ brand_name: "Wanderlust Travels" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🌐 MERN Backend Logic will go here:
        // fetch(`/api/packages/${slug}`).then...

        // Dummy fallback
        setTimeout(() => {
            setPkg({
                id: "1",
                title: "Santorini Sunset Honeymoon",
                category: "HONEYMOON",
                destination: "Santorini, Greece",
                duration_days: 6,
                duration_nights: 5,
                price_inr: 175000,
                cover_image: "pkg-santorini.jpg",
                description: "A romantic escape to Oia and Fira with private caldera views, wine tasting and a sailing catamaran cruise.",
                itinerary: [
                    { day: 1, title: "Arrival in Santorini", details: "Private transfer to cliffside villa." },
                    { day: 2, title: "Oia sunset", details: "Free day + iconic sunset." }
                ],
                inclusions: ["5 nights caldera-view villa", "Daily breakfast", "Airport transfers"],
                exclusions: ["International airfare", "Visa", "Dinners"]
            });
            setLoading(false);
        }, 500);
    }, [slug]);

    if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

    if (!pkg) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="font-serif text-3xl">Package not found</h1>
                    <Link to="/packages" className="mt-4 inline-block text-accent hover:underline">
                        Browse all packages
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header brand={settings.brand_name} />

            <section className="relative isolate overflow-hidden">
                <img
                    src={resolveImage(pkg.cover_image)}
                    alt={pkg.title}
                    width={1920}
                    height={800}
                    className="absolute inset-0 -z-10 h-full w-full object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/40 via-black/40 to-black/70" />
                <div className="mx-auto max-w-7xl px-4 py-24 text-primary-foreground sm:px-6 lg:px-8">
                    <Link to="/packages" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white">
                        <ArrowLeft className="h-4 w-4" /> Back to packages
                    </Link>
                    {pkg.category && (
                        <span className="mt-6 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest backdrop-blur">
                            {pkg.category}
                        </span>
                    )}
                    <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">{pkg.title}</h1>
                    <div className="mt-4 flex flex-wrap gap-6 text-sm">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {pkg.destination}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {pkg.duration_days} Days / {pkg.duration_nights} Nights</span>
                        <span>From ₹{Number(pkg.price_inr).toLocaleString("en-IN")} per person</span>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-10">
                        {pkg.description && (
                            <div>
                                <h2 className="font-serif text-2xl">Overview</h2>
                                <p className="mt-3 leading-relaxed text-muted-foreground">{pkg.description}</p>
                            </div>
                        )}

                        {pkg.itinerary?.length > 0 && (
                            <div>
                                <h2 className="font-serif text-2xl">Day-by-day itinerary</h2>
                                <ol className="mt-6 space-y-4 border-l-2 border-accent/40 pl-6">
                                    {pkg.itinerary.map((d) => (
                                        <li key={d.day} className="relative">
                                            <span className="absolute -left-8.25 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                                                {d.day}
                                            </span>
                                            <h3 className="font-serif text-lg">{d.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{d.details}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <div className="grid gap-8 sm:grid-cols-2">
                            {pkg.inclusions?.length > 0 && (
                                <div>
                                    <h3 className="font-serif text-xl">Inclusions</h3>
                                    <ul className="mt-3 space-y-2 text-sm">
                                        {pkg.inclusions.map((i, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <Check className="mt-0.5 h-4 w-4 text-primary" /> <span>{i}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {pkg.exclusions?.length > 0 && (
                                <div>
                                    <h3 className="font-serif text-xl">Exclusions</h3>
                                    <ul className="mt-3 space-y-2 text-sm">
                                        {pkg.exclusions.map((i, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <X className="mt-0.5 h-4 w-4 text-destructive" /> <span>{i}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:h-fit">
                        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Starting from</p>
                            <p className="mt-1 font-serif text-4xl text-primary">₹{Number(pkg.price_inr).toLocaleString("en-IN")}</p>
                            <p className="text-xs text-muted-foreground">per person, taxes extra</p>
                            <div className="mt-6 space-y-3">
                                <InquiryDialog
                                    packageId={pkg.id}
                                    packageTitle={pkg.title}
                                    trigger={
                                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                            Book / Inquire now
                                        </Button>
                                    }
                                />
                                <a href={`mailto:${settings.contact_email}?subject=Inquiry: ${pkg.title}`}>
                                    <Button variant="outline" className="w-full">Email us</Button>
                                </a>
                            </div>
                            <p className="mt-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                                Free itinerary tailoring · Trusted since 2015 · 24×7 on-trip support
                            </p>
                        </div>
                    </aside>
                </div>
            </section>

            <Footer settings={settings} />
        </div>
    );
}