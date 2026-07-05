import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2, Eye, EyeOff, Star as StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setPackages([
            {
                id: "p1",
                title: "Everest Base Camp Trek",
                slug: "everest-base-camp",
                destination: "Solukhumbu",
                price_inr: 45000,
                published: true,
                featured: true
            },
            {
                id: "p2",
                title: "Pokhara Luxury Escape",
                slug: "pokhara-luxury",
                destination: "Pokhara",
                price_inr: 22000,
                published: false,
                featured: false
            }
        ]);
        setIsLoading(false);
    }, []);

    async function toggle(id, field, value) {
        setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
        toast.success(`Package updated`);
    }

    async function remove(id) {
        if (!confirm("Delete this package? This cannot be undone.")) return;
        setPackages(prev => prev.filter(p => p.id !== id));
        toast.success("Deleted");
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-3xl">Packages</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Create and manage your tour packages.</p>
                </div>
                <Link to="/admin/packages/new">
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Plus className="mr-1 h-4 w-4" /> New package
                    </Button>
                </Link>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium">Destination</th>
                            <th className="px-4 py-3 font-medium">Price (₹)</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
                        )}
                        {!isLoading && packages.length === 0 && (
                            <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No packages yet.</td></tr>
                        )}
                        {packages.map((p) => (
                            <tr key={p.id} className="border-t border-border/60">
                                <td className="px-4 py-3">
                                    <div className="font-medium">{p.title}</div>
                                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                                </td>
                                <td className="px-4 py-3">{p.destination}</td>
                                <td className="px-4 py-3">₹{Number(p.price_inr).toLocaleString("en-IN")}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggle(p.id, "published", !p.published)}
                                            title={p.published ? "Published — click to unpublish" : "Draft — click to publish"}
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${p.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                                        >
                                            {p.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                            {p.published ? "Published" : "Draft"}
                                        </button>
                                        <button
                                            onClick={() => toggle(p.id, "featured", !p.featured)}
                                            title="Toggle featured"
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${p.featured ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}
                                        >
                                            <StarIcon className="h-3 w-3" /> {p.featured ? "Featured" : "—"}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link to={`/admin/packages/${p.id}`}>
                                            <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
                                        </Link>
                                        <Button variant="outline" size="sm" onClick={() => remove(p.id)}>
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}