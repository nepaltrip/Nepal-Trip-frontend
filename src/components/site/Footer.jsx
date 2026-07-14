import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import api from "../../api/axios";

// ==========================================
// CUSTOM SVG ICONS FOR SOCIAL MEDIA
// ==========================================
const YoutubeIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.17 1 12 1 12s0 3.83.54 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.83 23 12 23 12s0-3.83-.54-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);
const InstagramIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const FacebookIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const TwitterIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
);
const WhatsAppIcon = ({ className }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

export function Footer() {
    const [settings, setSettings] = useState(null);

    // ✨ FETCH SOCIAL DATA ON COMPONENT MOUNT
    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const { data } = await api.get('/social');
                if (data?.success && data?.data) {
                    setSettings(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch footer config:", error);
            }
        };

        fetchFooterData();
    }, []);

    // If data hasn't loaded yet, you can return a minimal fallback or null
    if (!settings) {
        return (
            <footer className="mt-24 border-t border-border/60 bg-primary text-primary-foreground py-16">
                <div className="text-center opacity-50">Loading footer...</div>
            </footer>
        );
    }

    return (
        <footer className="mt-24 border-t border-border/60 bg-primary text-primary-foreground">
            <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8 text-center md:text-left">

                {/* Brand Section */}
                <div className="md:col-span-2 flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground text-primary font-serif text-lg">
                            {settings.brand_name ? settings.brand_name.charAt(0) : "N"}
                        </span>
                        <span className="font-serif text-xl">{settings.brand_name || "NepalTrip"}</span>
                    </div>
                    {settings.tagline && (
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/80">
                            {settings.tagline}
                        </p>
                    )}

                    {/* Social Media Links (Rendered Conditionally) */}
                    <div className="mt-6 flex items-center gap-5">
                        {settings.facebook && (
                            <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 transition-colors hover:text-accent">
                                <FacebookIcon className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </a>
                        )}
                        {settings.instagram && (
                            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 transition-colors hover:text-accent">
                                <InstagramIcon className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                        )}
                        {settings.twitter && (
                            <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 transition-colors hover:text-accent">
                                <TwitterIcon className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </a>
                        )}
                        {settings.youtube && (
                            <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 transition-colors hover:text-accent">
                                <YoutubeIcon className="h-5 w-5" />
                                <span className="sr-only">YouTube</span>
                            </a>
                        )}
                        {settings.whatsapp && (
                            <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 transition-colors hover:text-accent">
                                <WhatsAppIcon className="h-5 w-5" />
                                <span className="sr-only">WhatsApp</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Explore Section */}
                <div className="flex flex-col items-center md:items-start">
                    <h4 className="font-serif text-sm uppercase tracking-widest text-primary-foreground/60">Explore</h4>
                    <ul className="mt-4 flex flex-col items-center md:items-start space-y-3 text-sm">
                        <li><Link to="/" className="transition-colors hover:text-accent">Home</Link></li>
                        <li><Link to="/packages" className="transition-colors hover:text-accent">Packages</Link></li>
                        <li><Link to="/discover" className="transition-colors hover:text-accent">Discover</Link></li>
                        <li><Link to="/about" className="transition-colors hover:text-accent">About</Link></li>
                        <li><Link to="/gallery" className="transition-colors hover:text-accent">Gallery</Link></li>
                        <li><Link to="/testimonials" className="transition-colors hover:text-accent">Testimonials</Link></li>
                        <li><Link to="/contact" className="transition-colors hover:text-accent">Contact</Link></li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div className="flex flex-col items-center md:items-start">
                    <h4 className="font-serif text-sm uppercase tracking-widest text-primary-foreground/60">Contact</h4>
                    <ul className="mt-4 flex flex-col items-center md:items-start space-y-6 text-sm text-primary-foreground/90">

                        {/* Email */}
                        {settings.email && (
                            <li className="flex flex-col items-center md:items-start gap-1.5 group">
                                <div className="flex items-center gap-1.5 text-primary-foreground/60">
                                    <Mail className="h-4 w-4 shrink-0 transition-colors group-hover:text-accent" />
                                    <span className="text-xs uppercase tracking-wider">Email</span>
                                </div>
                                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-accent">
                                    {settings.email}
                                </a>
                            </li>
                        )}

                        {/* Phone */}
                        {settings.phone && (
                            <li className="flex flex-col items-center md:items-start gap-1.5 group">
                                <div className="flex items-center gap-1.5 text-primary-foreground/60">
                                    <Phone className="h-4 w-4 shrink-0 transition-colors group-hover:text-accent" />
                                    <span className="text-xs uppercase tracking-wider">Phone</span>
                                </div>
                                <a href={`tel:${settings.phone}`} className="transition-colors hover:text-accent">
                                    {settings.phone}
                                </a>
                            </li>
                        )}

                        {/* Address */}
                        {settings.address && (
                            <li className="flex flex-col items-center md:items-start gap-1.5 group">
                                <div className="flex items-center gap-1.5 text-primary-foreground/60">
                                    <MapPin className="h-4 w-4 shrink-0 transition-colors group-hover:text-accent" />
                                    <span className="text-xs uppercase tracking-wider">Address</span>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="max-w-50 leading-relaxed transition-colors hover:text-accent text-center md:text-left"
                                >
                                    {settings.address}
                                </a>
                            </li>
                        )}

                    </ul>
                </div>
            </div>

            <div className="border-t border-primary-foreground/10 py-6 text-center text-xs text-primary-foreground/60">
                © {new Date().getFullYear()} {settings.brand_name || "NepalTrip"}. All rights reserved.
            </div>
        </footer>
    );
}