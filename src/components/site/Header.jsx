import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth"; // We will link this hook to Firebase Auth later

const links = [
    { to: "/", label: "Home" },
    { to: "/packages", label: "Packages" },
    { to: "/about", label: "About" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/contact", label: "Contact" },
];

export function Header({ brand = "Wanderlust" }) {
    const [open, setOpen] = useState(false);
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const { user, isAdmin, isSuperAdmin } = useAuth(); // Destructure access roles cleanly

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-serif text-lg">W</span>
                    <span className="font-serif text-xl tracking-tight">{brand}</span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {links.map((l) => {
                        const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
                        return (
                            <Link
                                key={l.to}
                                to={l.to}
                                className={`rounded-md px-3 py-2 text-sm transition-colors ${active
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {l.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-4">
                    {/* 📊 Admin View Link Toggle */}
                    {isAdmin && (
                        <Link to="/admin" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline">
                            Admin Panel
                        </Link>
                    )}

                    {/* ⚡ Superadmin Management View Link Toggle */}
                    {isSuperAdmin && (
                        <Link to="/management" className="hidden text-sm font-medium text-red-600 hover:text-red-700 md:inline">
                            Management
                        </Link>
                    )}

                    <Link to="/contact" className="hidden md:inline-flex">
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                            Inquire Now
                        </Button>
                    </Link>

                    <button
                        className="rounded-md p-2 md:hidden"
                        onClick={() => setOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dynamic Dropdown */}
            {open && (
                <div className="border-t border-border/60 bg-background md:hidden">
                    <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
                        {links.map((l) => (
                            <Link
                                key={l.to}
                                to={l.to}
                                onClick={() => setOpen(false)}
                                className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                            >
                                {l.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link to="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
                                Admin Panel
                            </Link>
                        )}
                        {isSuperAdmin && (
                            <Link to="/management" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-red-600">
                                Management
                            </Link>
                        )}
                        <Link to="/contact" onClick={() => setOpen(false)} className="mt-2">
                            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Inquire Now</Button>
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}