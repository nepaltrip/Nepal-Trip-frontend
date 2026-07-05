import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer({ settings }) {
    // Safe fallback if settings object hasn't loaded yet from MongoDB
    if (!settings) return null;

    return (
        <footer className="mt-24 border-t border-border/60 bg-primary text-primary-foreground">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground text-primary font-serif text-lg">W</span>
                        <span className="font-serif text-xl">{settings.brand_name}</span>
                    </div>
                    <p className="mt-4 max-w-md text-sm text-primary-foreground/80">{settings.tagline}</p>
                </div>

                <div>
                    <h4 className="font-serif text-sm uppercase tracking-widest text-primary-foreground/60">Explore</h4>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><Link to="/packages" className="hover:text-accent">Packages</Link></li>
                        <li><Link to="/about" className="hover:text-accent">About</Link></li>
                        <li><Link to="/testimonials" className="hover:text-accent">Testimonials</Link></li>
                        <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-serif text-sm uppercase tracking-widest text-primary-foreground/60">Contact</h4>
                    <ul className="mt-4 space-y-2 text-sm text-primary-foreground/90">
                        <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5" /> {settings.contact_email}</li>
                        <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5" /> {settings.contact_phone}</li>
                        <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5" /> {settings.contact_address}</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
                © {new Date().getFullYear()} {settings.brand_name}. All rights reserved.
            </div>
        </footer>
    );
}