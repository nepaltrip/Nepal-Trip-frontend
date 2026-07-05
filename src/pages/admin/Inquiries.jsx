import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statuses = ["new", "contacted", "closed"];

export default function Inquiries() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Stubbing dummy local database values
        setData([
            {
                id: "inq-1",
                name: "Ankit Sharma",
                email: "ankit@example.com",
                phone: "+91 9876543210",
                created_at: new Date().toISOString(),
                packages: { title: "Classic Kathmandu & Pokhara Tour" },
                travel_date: "2026-10-15",
                travelers: 2,
                message: "Looking for a premium private tour with an English-speaking guide.",
                status: "new"
            }
        ]);
        setIsLoading(false);
    }, []);

    async function setStatus(id, status) {
        setData(prev => prev.map(item => item.id === id ? { ...item, status } : item));
        toast.success(`Status updated to ${status}`);
    }

    async function remove(id) {
        if (!confirm("Delete this inquiry?")) return;
        setData(prev => prev.filter(item => item.id !== id));
        toast.success("Inquiry removed");
    }

    return (
        <div>
            <h1 className="font-serif text-3xl">Inquiries</h1>
            <p className="mt-1 text-sm text-muted-foreground">Booking and trip planning requests from your visitors.</p>
            <div className="mt-8 space-y-3">
                {isLoading && <p className="text-muted-foreground">Loading…</p>}
                {!isLoading && data.length === 0 && <p className="text-muted-foreground">No inquiries yet.</p>}
                {data.map((i) => (
                    <div key={i.id} className="rounded-2xl border border-border/60 bg-card p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{i.name}</span>
                                    <span className="text-sm text-muted-foreground">· {i.email}</span>
                                    {i.phone && <span className="text-sm text-muted-foreground">· {i.phone}</span>}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {new Date(i.created_at).toLocaleString()} · Package: {i.packages?.title ?? "General inquiry"}
                                    {i.travel_date && ` · Date: ${i.travel_date}`}
                                    {i.travelers && ` · ${i.travelers} travelers`}
                                </div>
                                {i.message && <p className="mt-3 text-sm">{i.message}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <select
                                    value={i.status}
                                    onChange={(e) => setStatus(i.id, e.target.value)}
                                    className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                                >
                                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="flex gap-2">
                                    <a href={`mailto:${i.email}?subject=Re: your inquiry`}><Button size="sm" variant="outline">Reply</Button></a>
                                    <Button size="sm" variant="outline" onClick={() => remove(i.id)}>Delete</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}