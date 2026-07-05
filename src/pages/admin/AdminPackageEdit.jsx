import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const emptyForm = {
    slug: "",
    title: "",
    destination: "",
    duration_days: 1,
    duration_nights: 0,
    price_inr: 0,
    short_description: "",
    description: "",
    cover_image: "",
    category: "",
    featured: false,
    published: true,
    itinerary: [],
    inclusions: [],
    exclusions: [],
};

function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminPackageEdit() {
    const { id } = useParams();
    const isNew = id === "new";
    const navigate = useNavigate();
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew) {
            // Future backend fetch simulation
            setTimeout(() => {
                setForm({
                    ...emptyForm,
                    id: id,
                    title: "Everest Base Camp Trek",
                    slug: "everest-base-camp",
                    destination: "Solukhumbu",
                    duration_days: 12,
                    duration_nights: 11,
                    price_inr: 45000,
                    short_description: "Trek to the base of the world's highest peak.",
                    description: "Full descriptive text here...",
                    cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
                    category: "Mountain Adventure",
                    featured: true,
                    published: true,
                    itinerary: [{ day: 1, title: "Arrival in Kathmandu", details: "Transfer to hotel." }],
                    inclusions: ["Airport pickups", "Teahouse accommodation"],
                    exclusions: ["Travel insurance", "Personal gear"]
                });
                setLoading(false);
            }, 300);
        }
    }, [id, isNew]);

    function update(k, v) {
        setForm((f) => ({ ...f, [k]: v }));
    }

    async function onSave() {
        if (!form.title || !form.destination) return toast.error("Title and destination are required");
        const slug = form.slug || slugify(form.title);
        setSaving(true);

        console.log("Saving entity payload: ", { ...form, slug });

        setTimeout(() => {
            setSaving(false);
            toast.success("Saved successfully");
            navigate("/admin/packages");
        }, 500);
    }

    if (loading) return <div className="text-muted-foreground">Loading…</div>;

    return (
        <div>
            <Link to="/admin/packages" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to packages
            </Link>
            <h1 className="font-serif text-3xl">{isNew ? "New package" : "Edit package"}</h1>

            <div className="mt-8 space-y-8">
                <section className="grid gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:grid-cols-2">
                    <div className="grid gap-2 sm:col-span-2">
                        <Label>Title</Label>
                        <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Slug (URL)</Label>
                        <Input value={form.slug} placeholder={slugify(form.title)} onChange={(e) => update("slug", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Destination</Label>
                        <Input value={form.destination} onChange={(e) => update("destination", e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Category</Label>
                        <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Beach, Mountain, Heritage…" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Price (₹ per person)</Label>
                        <Input type="number" value={form.price_inr} onChange={(e) => update("price_inr", Number(e.target.value))} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Days</Label>
                        <Input type="number" value={form.duration_days} onChange={(e) => update("duration_days", Number(e.target.value))} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Nights</Label>
                        <Input type="number" value={form.duration_nights} onChange={(e) => update("duration_nights", Number(e.target.value))} />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label>Cover image URL</Label>
                        <Input value={form.cover_image} onChange={(e) => update("cover_image", e.target.value)} placeholder="https://…" />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label>Short description (shown on cards)</Label>
                        <Textarea value={form.short_description} onChange={(e) => update("short_description", e.target.value)} rows={2} />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label>Full description</Label>
                        <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                        <Label>Published</Label>
                        <Switch checked={form.published} onCheckedChange={(v) => update("published", v)} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
                        <Label>Featured on home</Label>
                        <Switch checked={form.featured} onCheckedChange={(v) => update("featured", v)} />
                    </div>
                </section>

                <section className="rounded-2xl border border-border/60 bg-card p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-serif text-xl">Itinerary</h2>
                        <Button size="sm" variant="outline" onClick={() => update("itinerary", [...form.itinerary, { day: form.itinerary.length + 1, title: "", details: "" }])}>
                            <Plus className="mr-1 h-3.5 w-3.5" /> Add day
                        </Button>
                    </div>
                    <div className="mt-4 space-y-3">
                        {form.itinerary.map((d, idx) => (
                            <div key={idx} className="grid gap-2 rounded-md border border-border/60 p-3 sm:grid-cols-[80px_1fr_2fr_auto]">
                                <Input type="number" value={d.day} onChange={(e) => {
                                    const it = [...form.itinerary]; it[idx] = { ...d, day: Number(e.target.value) }; update("itinerary", it);
                                }} />
                                <Input placeholder="Title" value={d.title} onChange={(e) => {
                                    const it = [...form.itinerary]; it[idx] = { ...d, title: e.target.value }; update("itinerary", it);
                                }} />
                                <Input placeholder="Details" value={d.details} onChange={(e) => {
                                    const it = [...form.itinerary]; it[idx] = { ...d, details: e.target.value }; update("itinerary", it);
                                }} />
                                <Button size="sm" variant="outline" onClick={() => update("itinerary", form.itinerary.filter((_, i) => i !== idx))}>
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>

                <ListEditor title="Inclusions" items={form.inclusions} onChange={(v) => update("inclusions", v)} />
                <ListEditor title="Exclusions" items={form.exclusions} onChange={(v) => update("exclusions", v)} />

                <div className="flex justify-end gap-2">
                    <Link to="/admin/packages"><Button variant="outline">Cancel</Button></Link>
                    <Button onClick={onSave} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {saving ? "Saving…" : "Save package"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Inner Component
function ListEditor({ title, items, onChange }) {
    const [draft, setDraft] = useState("");
    return (
        <section className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="font-serif text-xl">{title}</h2>
            <div className="mt-3 flex gap-2">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add an item and press Enter" onKeyDown={(e) => {
                    if (e.key === "Enter" && draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); e.preventDefault(); }
                }} />
                <Button variant="outline" onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
                {items.map((i, idx) => (
                    <li key={idx} className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
                        {i}
                        <button onClick={() => onChange(items.filter((_, k) => k !== idx))} className="text-muted-foreground hover:text-destructive">×</button>
                    </li>
                ))}
            </ul>
        </section>
    );
}