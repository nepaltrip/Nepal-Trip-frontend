import React, { useState, useEffect } from "react";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";
import { PackageCard } from "../components/site/PackageCard";
import { Input } from "../components/ui/input";

const CATEGORIES = ["All", "Mountains", "Beach", "Nature", "Honeymoon", "Heritage", "Culture"];

export default function Packages() {
    const [settings] = useState({ brand_name: "Wanderlust Travels" });
    const [packages, setPackages] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        // 🌐 MERN Backend Logic: fetch('/api/packages').then...

        // Dummy fallback data matching your mockups
        setPackages([
            {
                id: "1", slug: "ladakh-adventure", title: "Ladakh Himalayan Adventure",
                category: "Mountains", destination: "Ladakh, India", duration_days: 7, duration_nights: 6,
                price_inr: 45000, cover_image: "pkg-ladakh.jpg", short_description: "A high-altitude journey through monasteries, deep valleys and turquoise lakes."
            },
            {
                id: "2", slug: "maldives-escape", title: "Maldives Overwater Escape",
                category: "Beach", destination: "Maldives", duration_days: 5, duration_nights: 4,
                price_inr: 120000, cover_image: "pkg-maldives.jpg", short_description: "Overwater villas, coral reefs and endless turquoise horizons."
            },
            {
                id: "3", slug: "kerala-backwaters", title: "Kerala Backwaters & Beaches",
                category: "Nature", destination: "Kerala, India", duration_days: 6, duration_nights: 5,
                price_inr: 32000, cover_image: "pkg-kerala.jpg", short_description: "Houseboats, spice hills and the calm rhythm of Gods Own Country."
            }
        ]);
    }, []);

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.destination.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || pkg.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen flex flex-col bg-background/50">
            <Header brand={settings.brand_name} />

            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                    {/* Filters Bar */}
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <Input
                            type="search"
                            placeholder="Search destination or trip..."
                            className="max-w-sm bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === cat
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-white text-foreground border hover:bg-muted"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Package Grid */}
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredPackages.map((p) => (
                            <PackageCard key={p.id} pkg={p} />
                        ))}

                        {filteredPackages.length === 0 && (
                            <div className="col-span-full py-20 text-center text-muted-foreground">
                                No packages found matching your criteria.
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <Footer settings={settings} />
        </div>
    );
}