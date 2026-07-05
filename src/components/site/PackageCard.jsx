import { Link } from "react-router-dom";
import { resolveImage } from "@/lib/images";
import { Clock, MapPin } from "lucide-react";

export function PackageCard({ pkg }) {
    if (!pkg) return null;

    return (
        <Link
            to="/packages/$slug"
            params={{ slug: pkg.slug }}
            className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="relative aspect-4/3 overflow-hidden">
                <img
                    src={resolveImage(pkg.cover_image)}
                    alt={pkg.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {pkg.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
                        {pkg.category}
                    </span>
                )}
            </div>
            <div className="p-5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {pkg.destination}
                </div>
                <h3 className="mt-2 font-serif text-xl leading-tight text-foreground group-hover:text-primary">
                    {pkg.title}
                </h3>
                {pkg.short_description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pkg.short_description}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {pkg.duration_days}D / {pkg.duration_nights}N
                    </span>
                    <span className="text-right">
                        <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">From</span>
                        <span className="font-serif text-lg text-primary">₹{Number(pkg.price_inr).toLocaleString("en-IN")}</span>
                    </span>
                </div>
            </div>
        </Link>
    );
}