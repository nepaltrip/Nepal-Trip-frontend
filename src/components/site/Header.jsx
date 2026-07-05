import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({ brand = "Wanderlust Travels" }) {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;

    const nav = [
        { label: "Home", to: "/" },
        { label: "Packages", to: "/packages" },
        { label: "About", to: "/about" },
        { label: "Testimonials", to: "/testimonials" },
        { label: "Contact", to: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-2">
                    <span className="font-serif text-xl font-medium tracking-tight text-foreground">
                        {brand}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-6 md:flex">
                    {nav.map((n) => (
                        <Link
                            key={n.to}
                            to={n.to}
                            className={`text-sm font-medium transition-colors hover:text-foreground ${pathname === n.to ? "text-foreground" : "text-muted-foreground"
                                }`}
                        >
                            {n.label}
                        </Link>
                    ))}
                    {/* Temporary placeholder until Auth Context is ready */}
                    <Link to="/auth">
                        <Button size="sm" variant="outline">Admin</Button>
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-foreground"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {open && (
                <div className="border-b border-border/40 bg-background md:hidden">
                    <nav className="flex flex-col space-y-4 px-4 py-6">
                        {nav.map((n) => (
                            <Link
                                key={n.to}
                                to={n.to}
                                onClick={() => setOpen(false)}
                                className={`text-base font-medium ${pathname === n.to ? "text-foreground" : "text-muted-foreground"
                                    }`}
                            >
                                {n.label}
                            </Link>
                        ))}
                        <Link to="/auth" onClick={() => setOpen(false)}>
                            <Button size="sm" variant="outline" className="w-full mt-2">Admin</Button>
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}