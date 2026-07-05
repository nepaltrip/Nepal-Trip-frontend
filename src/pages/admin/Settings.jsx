import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Settings() {
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm({
            brand_name: "NepalTrip",
            tagline: "Your Ultimate Gateway to the Himalayas",
            hero_title: "Explore Elegant Nepal Landscapes",
            hero_subtitle: "Book verified custom tour itineraries with local hospitality professionals.",
            hero_image: "",
            about_title: "Who We Are",
            about_body: "We are a trusted custom local tour advisory board...",
            contact_email: "info@nepaltrip.in",
            contact_phone: "+977-1-4000000",
            contact_address: "Thamel, Kathmandu, Nepal",
            instagram: "",
            facebook: "",
            whatsapp: ""
        });
        setLoading(false);
    }, []);

    function u(k, v) {
        setForm((f) => ({ ...f, [k]: v }));
    }

    async function save() {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            toast.success("Settings saved successfully");
        }, 500);
    }

    if (loading) return <p className="text-muted-foreground">Loading…</p>;

    return (
        <div>
            <h1 className="font-serif text-3xl">Site settings</h1>
            <div className="mt-6 grid gap-6">
                <Section title="Brand">
                    <Field label="Brand name" value={form.brand_name} onChange={(v) => u("brand_name", v)} />
                    <Field label="Tagline" value={form.tagline} onChange={(v) => u("tagline", v)} />
                </Section>

                <Section title="Homepage hero">
                    <Field label="Hero title" value={form.hero_title} onChange={(v) => u("hero_title", v)} />
                    <TextField label="Hero subtitle" value={form.hero_subtitle} onChange={(v) => u("hero_subtitle", v)} />
                    <Field label="Hero image URL (optional)" value={form.hero_image ?? ""} onChange={(v) => u("hero_image", v)} />
                </Section>

                <Section title="About">
                    <Field label="About title" value={form.about_title} onChange={(v) => u("about_title", v)} />
                    <TextField label="About body" value={form.about_body} onChange={(v) => u("about_body", v)} rows={6} />
                </Section>

                <Section title="Contact">
                    <Field label="Email" value={form.contact_email} onChange={(v) => u("contact_email", v)} />
                    <Field label="Phone" value={form.contact_phone} onChange={(v) => u("contact_phone", v)} />
                    <Field label="Address" value={form.contact_address} onChange={(v) => u("contact_address", v)} />
                    <Field label="Instagram URL" value={form.instagram ?? ""} onChange={(v) => u("instagram", v)} />
                    <Field label="Facebook URL" value={form.facebook ?? ""} onChange={(v) => u("facebook", v)} />
                    <Field label="WhatsApp URL" value={form.whatsapp ?? ""} onChange={(v) => u("whatsapp", v)} />
                </Section>

                <div className="flex justify-end">
                    <Button onClick={save} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {saving ? "Saving…" : "Save settings"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="font-serif text-xl">{title}</h2>
            <div className="mt-4 grid gap-4">{children}</div>
        </section>
    );
}

function Field({ label, value, onChange }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        </div>
    );
}

function TextField({ label, value, onChange, rows = 3 }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Textarea value={value ?? ""} rows={rows} onChange={(e) => onChange(e.target.value)} />
        </div>
    );
}