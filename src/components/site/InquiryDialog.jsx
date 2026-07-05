import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const schema = z.object({
    name: z.string().trim().min(2, "Name is required").max(100),
    email: z.string().trim().email("Invalid email").max(200),
    phone: z.string().trim().max(30).optional(),
    travel_date: z.string().optional(),
    travelers: z.string().optional(),
    message: z.string().trim().max(1000).optional(),
});

export function InquiryDialog({ packageId, packageTitle, trigger }) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const parsed = schema.safeParse(Object.fromEntries(fd));

        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
            return;
        }

        setSubmitting(true);
        const { name, email, phone, travel_date, travelers, message } = parsed.data;

        try {
            // 🌐 Hit your MERN Express Backend Server running on Render instead of Supabase
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inquiries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    package_id: packageId || null,
                    name,
                    email,
                    phone: phone || null,
                    travel_date: travel_date || null,
                    travelers: travelers ? parseInt(travelers, 10) : null,
                    message: message || null,
                }),
            });

            if (!response.ok) throw new Error("Server communication error");

            toast.success("Inquiry sent — we'll get back to you shortly!");
            setOpen(false);
        } catch (error) {
            toast.error("Could not send inquiry. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                        {packageTitle ? `Inquire about ${packageTitle}` : "Send us an inquiry"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" name="name" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="travel_date">Travel date</Label>
                            <Input id="travel_date" name="travel_date" type="date" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="travelers">Travelers</Label>
                            <Input id="travelers" name="travelers" type="number" min={1} defaultValue={2} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message (optional)</Label>
                        <Textarea id="message" name="message" rows={4} placeholder="Tell us about your dream trip..." />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {submitting ? "Sending..." : "Send inquiry"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}