import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("signin");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Document layout dynamic title header fallback
        document.title = "Admin sign in — Wanderlust Travels";

        // Future integration checklist point:
        // If user token exists inside local storage or Firebase Context, push directly to admin
        // if (user) navigate("/admin");
    }, [navigate]);

    async function onSubmit(e) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const { email, password } = Object.fromEntries(fd);

        // Simplistic standalone field verification fallback layer
        if (!email || !password) {
            return toast.error("Please fill in all standard credentials.");
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters.");
        }

        setLoading(true);

        try {
            if (mode === "signup") {
                // Future Firebase Context/Express endpoint payload integration:
                // await signUpWithEmail(email, password);
                console.log("Registering admin account payload...", { email });

                toast.success("Account created — sign in to continue.");
                setMode("signin");
            } else {
                // Future login token validation step simulation:
                // await signInWithEmail(email, password);
                console.log("Verifying administrator auth payload...", { email });

                toast.success("Welcome back!");
                navigate("/admin");
            }
        } catch (error) {
            toast.error(error.message || "An authentication exception occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
                <Link to="/" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">
                    ← Back home
                </Link>
                <h1 className="font-serif text-3xl">
                    {mode === "signin" ? "Admin sign in" : "Create admin account"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {mode === "signin" ? "Access the site admin panel." : "First account is claimed as superadmin."}
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required minLength={6} />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
                    </Button>
                </form>

                <button
                    type="button"
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                >
                    {mode === "signin" ? "Need to create an account?" : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
    );
}