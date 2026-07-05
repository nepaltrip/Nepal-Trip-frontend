import React, { useState, useEffect } from "react";
import { Package, MessageSquare, Star, Inbox } from "lucide-react";

export default function AdminDashboard() {
    // Temporary state to hold our dashboard counts.
    // This will eventually be populated by your Express/MongoDB backend.
    const [statsData, setStatsData] = useState({
        packages: "...",
        inquiries: "...",
        newInquiries: null,
        testimonials: "...",
        messages: "...",
    });

    useEffect(() => {
        // Simulate fetching data from your upcoming API
        const fetchDashboardStats = async () => {
            try {
                // Future API call: 
                // const response = await fetch('/api/admin/dashboard-stats');
                // const data = await response.json();

                // Simulating a slight network delay with dummy data
                setTimeout(() => {
                    setStatsData({
                        packages: 12,
                        inquiries: 45,
                        newInquiries: 3,
                        testimonials: 28,
                        messages: 15,
                    });
                }, 500);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            }
        };

        fetchDashboardStats();
    }, []);

    const stats = [
        { label: "Packages", value: statsData.packages, icon: Package },
        {
            label: "Total inquiries",
            value: statsData.inquiries,
            icon: MessageSquare,
            sub: statsData.newInquiries ? `${statsData.newInquiries} new` : undefined
        },
        { label: "Testimonials", value: statsData.testimonials, icon: Star },
        { label: "Contact messages", value: statsData.messages, icon: Inbox },
    ];

    return (
        <div>
            <h1 className="font-serif text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Overview of your site activity.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{s.label}</span>
                            <s.icon className="h-4 w-4 text-accent" />
                        </div>
                        <div className="mt-3 font-serif text-3xl">{String(s.value)}</div>
                        {s.sub && <div className="mt-1 text-xs text-accent">{s.sub}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}