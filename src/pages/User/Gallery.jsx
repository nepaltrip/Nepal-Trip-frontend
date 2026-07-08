import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search, Filter, X, Eye, MapPin, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["All", "Mountains", "Culture", "Wildlife", "Lakes", "Honeymoon"];

// --- Isolated Skeleton ---
const GalleryMasonrySkeleton = () => (
    <div className="w-full animate-pulse">
        {/* Desktop Skeleton */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
            {[1, 2, 3].map((col) => (
                <div key={col} className="flex flex-col gap-6">
                    <div className={`w-full rounded-2xl bg-muted/60 ${col === 2 ? 'h-96' : 'h-64'}`} />
                    <div className={`w-full rounded-2xl bg-muted/60 ${col === 2 ? 'h-64' : 'h-80'}`} />
                </div>
            ))}
        </div>
        {/* Tablet Skeleton */}
        <div className="hidden sm:grid lg:hidden grid-cols-2 gap-5">
            {[1, 2].map((col) => (
                <div key={col} className="flex flex-col gap-5">
                    <div className={`w-full rounded-2xl bg-muted/60 ${col === 1 ? 'h-72' : 'h-96'}`} />
                    <div className={`w-full rounded-2xl bg-muted/60 ${col === 1 ? 'h-96' : 'h-64'}`} />
                </div>
            ))}
        </div>
        {/* Mobile Skeleton */}
        <div className="grid sm:hidden grid-cols-1 gap-4">
            {[1, 2, 3].map((item) => (
                <div key={item} className="w-full h-64 rounded-xl bg-muted/60" />
            ))}
        </div>
    </div>
);

export default function Gallery() {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [isMounted, setIsMounted] = useState(false);

    // UI state configurations
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeLightbox, setActiveLightbox] = useState(null);

    const filterMenuRef = useRef(null);

    useEffect(() => {
        document.title = "Gallery — NepalTrip";

        const params = new URLSearchParams(location.search);
        const externalDestination = params.get("destination");
        if (externalDestination) {
            setSearchQuery(decodeURIComponent(externalDestination));
        }

        // Simulate fetching gallery
        setTimeout(() => {
            setImages([
                { id: "g1", src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop", title: "Everest Base Camp Ridge", category: "Mountains", location: "Everest Region" },
                { id: "g2", src: "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?q=80&w=600&auto=format&fit=crop", title: "Boudhanath Stupa Prayer Flags", category: "Culture", location: "Kathmandu Valley" },
                { id: "g3", src: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?q=80&w=800&h=1000&auto=format&fit=crop", title: "Santorini Sunset Horizon", category: "Honeymoon", location: "Santorini, Greece" },
                { id: "g4", src: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=800&h=600&auto=format&fit=crop", title: "Fewa Lake Paragliding View", category: "Lakes", location: "Pokhara Lakeside" },
                { id: "g5", src: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=600&h=800&auto=format&fit=crop", title: "Majestic Ama Dablam Trail", category: "Mountains", location: "Everest Region" },
                { id: "g6", src: "https://images.unsplash.com/photo-1585675100414-22d71f11cb23?q=80&w=800&h=1200&auto=format&fit=crop", title: "One-Horned Rhino Safari", category: "Wildlife", location: "Chitwan National Park" },
                { id: "g7", src: "https://images.unsplash.com/photo-1544735716-95cb4d5ef130?q=80&w=800&auto=format&fit=crop", title: "Mighty Annapurna South Face", category: "Mountains", location: "Annapurna Region" }
            ]);
            setIsLoading(false);
        }, 1500);
    }, [location]);

    useEffect(() => {
        const checkOutsideClick = (e) => {
            if (isFilterOpen && filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", checkOutsideClick);
        return () => document.removeEventListener("mousedown", checkOutsideClick);
    }, [isFilterOpen]);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 50);
        return () => clearTimeout(timer); // Clean up
    }, []);

    useEffect(() => {
        if (activeLightbox) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [activeLightbox]);

    const filteredImages = useMemo(() => {
        return images.filter((img) => {
            const matchesCategory = selectedCategory === "All" || img.category === selectedCategory;
            const normalizedQuery = searchQuery.toLowerCase();
            const matchesSearch = img.title.toLowerCase().includes(normalizedQuery) || img.location.toLowerCase().includes(normalizedQuery) || img.category.toLowerCase().includes(normalizedQuery);
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory, images]);

    const masonryColumns = useMemo(() => {
        const cols = { desktop: [[], [], []], tablet: [[], []], mobile: [[]] };
        filteredImages.forEach((img, idx) => {
            cols.desktop[idx % 3].push(img);
            cols.tablet[idx % 2].push(img);
            cols.mobile[0].push(img);
        });
        return cols;
    }, [filteredImages]);

    return (
        <>
            <div className={`w-full transition-all duration-1000 ease-out transform ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="w-full bg-background min-h-[calc(100dvh-4rem)] pt-4 pb-16 font-sans">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        {/* Static title bar loads instantly */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6 mb-8 gap-4">
                            <div>
                                <p className="font-serif text-xs uppercase tracking-widest text-primary mb-0.5">Visual Journey</p>
                                <h1 className="font-serif text-3xl md:text-4xl font-black text-foreground tracking-tight">The Beauty of Nepal</h1>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto max-w-md relative" ref={filterMenuRef}>
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search places, sights..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-11 pl-10 pr-8 text-sm bg-card border border-border rounded-full outline-hidden focus:border-primary transition-colors text-foreground font-medium"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className={`h-11 px-4 border shadow-2xs rounded-full flex items-center gap-2 text-sm font-semibold transition-all ${isFilterOpen || selectedCategory !== "All"
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card text-foreground border-border hover:bg-muted"
                                            }`}
                                    >
                                        <Filter size={16} />
                                        <span className="hidden sm:inline">
                                            {selectedCategory === "All" ? "Filter" : selectedCategory}
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {isFilterOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }}
                                                className="absolute top-13 right-0 w-56 bg-card border border-border p-3 rounded-2xl shadow-xl flex flex-col gap-1 z-50 origin-top-right"
                                            >
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1 block">Categories</span>
                                                {CATEGORIES.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                                                        className={`text-left w-full px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Shimmer Gallery when loading */}
                        {isLoading ? (
                            <GalleryMasonrySkeleton />
                        ) : (
                            <div className="w-full animate-in fade-in duration-700">
                                {filteredImages.length === 0 && (
                                    <div className="w-full text-center py-20 text-muted-foreground flex flex-col items-center">
                                        <Info className="w-12 h-12 opacity-20 mb-3" />
                                        <p className="text-lg font-bold text-foreground">No media files match your criteria</p>
                                        <p className="text-sm mt-0.5">Try altering keywords or cleaning out parameters.</p>
                                    </div>
                                )}

                                {/* Desktop Layout */}
                                <div className="hidden lg:grid grid-cols-3 gap-6">
                                    {masonryColumns.desktop.map((col, colIdx) => (
                                        <div key={colIdx} className="flex flex-col gap-6">
                                            {col.map((img) => <ImageTile key={img.id} img={img} onOpen={setActiveLightbox} />)}
                                        </div>
                                    ))}
                                </div>

                                {/* Tablet Layout */}
                                <div className="hidden sm:grid lg:hidden grid-cols-2 gap-5">
                                    {masonryColumns.tablet.map((col, colIdx) => (
                                        <div key={colIdx} className="flex flex-col gap-5">
                                            {col.map((img) => <ImageTile key={img.id} img={img} onOpen={setActiveLightbox} />)}
                                        </div>
                                    ))}
                                </div>

                                {/* Mobile Layout */}
                                <div className="grid sm:hidden grid-cols-1 gap-4">
                                    {masonryColumns.mobile[0].map((img) => (
                                        <ImageTile key={img.id} img={img} onOpen={setActiveLightbox} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox full-view immersive slide portal modal layer */}
            <AnimatePresence>
                {activeLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveLightbox(null)}
                        // Full screen fixed container with extremely high z-index
                        className="fixed inset-0 h-dvh w-full bg-black/95 backdrop-blur-md z-9999"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setActiveLightbox(null)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors z-110 cursor-pointer border border-white/10"
                        >
                            <X size={24} />
                        </button>

                        {/* Image Container - Takes exactly 100% of the screen, forcing true center */}
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} transition={{ type: "spring", damping: 25 }}
                            // absolute inset-0 guarantees the exact mathematical center
                            className="absolute inset-0 flex items-center justify-center p-4 md:p-12"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={activeLightbox.src}
                                alt={activeLightbox.title}
                                className="max-w-full max-h-[85vh] md:max-h-full object-contain rounded-xl shadow-2xl"
                            />
                        </motion.div>

                        {/* Text Container - Floating at the absolute bottom */}
                        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 text-center text-white px-4 z-110 pointer-events-none">
                            <h3 className="font-serif text-lg md:text-xl font-bold tracking-wide drop-shadow-lg">
                                {activeLightbox.title}
                            </h3>
                            <p className="text-white/80 text-xs md:text-sm flex items-center justify-center gap-1.5 mt-1 font-medium drop-shadow-lg">
                                <MapPin size={14} className="text-primary" /> {activeLightbox.location}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function ImageTile({ img, onOpen }) {
    return (
        <div onClick={() => onOpen(img)} className="w-full relative group overflow-hidden rounded-xl md:rounded-2xl cursor-zoom-in bg-muted">
            <img src={img.src} alt={img.title} className="w-full h-auto object-cover transform transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-5 pointer-events-none">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-white">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5">{img.category}</p>
                        <h3 className="font-serif text-sm md:text-base font-semibold leading-tight tracking-wide">{img.title}</h3>
                        <p className="text-white/60 text-[11px] flex items-center gap-1 mt-1 font-medium">
                            <MapPin size={10} /> {img.location}
                        </p>
                    </div>
                    <div className="p-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white shrink-0 hidden sm:block shadow-lg">
                        <Eye size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
}