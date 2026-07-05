import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Messages() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setData([
            {
                id: "msg-1",
                name: "Rahul Verma",
                email: "rahul@example.com",
                phone: "+91 9998887776",
                created_at: new Date().toISOString(),
                subject: "B2B partnership inquiry",
                message: "Hi, we are an agency based out of Delhi and want to sell your tour inventory."
            }
        ]);
        setIsLoading(false);
    }, []);

    async function remove(id) {
        if (!confirm("Delete this message?")) return;
        setData(prev => prev.filter(m => m.id !== id));
        toast.success("Message deleted");
    }

    return (
        <div>
            <h1 className="font-serif text-3xl">Contact messages</h1>
            <div className="mt-8 space-y-3">
                {isLoading && <p className="text-muted-foreground">Loading…</p>}
                {!isLoading && data.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
                {data.map((m) => (
                    <div key={m.id} className="rounded-2xl border border-border/60 bg-card p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{m.name}</span>
                                    <span className="text-sm text-muted-foreground">· {m.email}</span>
                                    {m.phone && <span className="text-sm text-muted-foreground">· {m.phone}</span>}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                                {m.subject && <div className="mt-2 font-medium">{m.subject}</div>}
                                <p className="mt-2 text-sm whitespace-pre-line">{m.message}</p>
                            </div>
                            <div className="flex gap-2">
                                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "your message")}`}>
                                    <Button size="sm" variant="outline">Reply</Button>
                                </a>
                                <Button size="sm" variant="outline" onClick={() => remove(m.id)}>Delete</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}