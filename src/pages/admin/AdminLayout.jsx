import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, MessageSquare, Star, Inbox, Settings, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/packages", label: "Packages", icon: Package },
    { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
    { to: "/admin/testimonials", label: "Testimonials", icon: Star },
    { to: "/admin/messages", label: "Messages", icon: Inbox },
    { to: "/admin/settings", label: "Site settings", icon: Settings },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    // Temporary local mock layout state. 
    // Once Firebase Auth Context is ready, you will pull this from useAuth()
    const loading = false;
    const isAdmin = true;
    const isSuperadmin = true;
    const user = { email: "admin@nepaltrip.in" };

    const handleSignOut = async () => {
        // Future Firebase Auth sign out method placeholder
        console.log("Signing out user...");
        navigate("/auth");
    };

    if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
                <div className="max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
                    <h1 className="font-serif text-2xl">No admin access</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Signed in as <b>{user?.email}</b>, but this account has no admin role. Ask a superadmin to grant you access.
                    </p>
                    <Button className="mt-6" onClick={handleSignOut}>
                        Sign out
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-secondary/30">
            <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-card md:flex md:flex-col">
                <div className="border-b border-border/60 px-5 py-4">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-serif">W</span>
                        <span className="font-serif text-lg">Admin</span>
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">
                        {isSuperadmin ? "Superadmin" : "Admin"}
                    </div>
                </div>
                <nav className="flex-1 space-y-1 p-3">
                    {nav.map((n) => {
                        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                        return (
                            <Link
                                key={n.to}
                                to={n.to}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                                    }`}
                            >
                                <n.icon className="h-4 w-4" /> {n.label}
                            </Link>
                        );
                    })}
                    {isSuperadmin && (
                        <Link
                            to="/admin/users"
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${pathname.startsWith("/admin/users") ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                                }`}
                        >
                            <Users className="h-4 w-4" /> Team & roles
                        </Link>
                    )}
                </nav>
                <div className="border-t border-border/60 p-3 text-xs">
                    <div className="mb-2 truncate text-muted-foreground">{user?.email}</div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleSignOut}
                    >
                        <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
                    </Button>
                </div>
            </aside>

            <main className="flex-1 overflow-x-hidden">
                {/* mobile top bar */}
                <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 md:hidden">
                    <Link to="/" className="font-serif">Admin</Link>
                    <Button size="sm" variant="outline" onClick={handleSignOut}>
                        Sign out
                    </Button>
                </div>
                <div className="mx-auto max-w-6xl p-6 lg:p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}