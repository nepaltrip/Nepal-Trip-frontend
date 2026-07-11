import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { MapPin } from "lucide-react";

const schema = z.object({
    name: z.string().trim().min(2, "Name is required").max(100),
    email: z.string().trim().email("Invalid email").max(200),
    phone: z.string().trim().max(30).optional(),
    travel_date: z.string().optional(),
    travelers: z.string().optional(),
    message: z.string().trim().max(1000).optional(),
});

// ✨ Added `source` prop with a fallback default
export function InquiryDialog({ packageId, packageTitle, source = "General", trigger, open: controlledOpen, onOpenChange: setControlledOpen }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
    const currentOpen = isControlled ? controlledOpen : internalOpen;
    const [submitting, setSubmitting] = useState(false);

    const handleOpenChangeWrapper = (newOpen) => {
        if (isControlled) {
            setControlledOpen(newOpen);
        } else {
            setInternalOpen(newOpen);
        }
    };

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    package_id: packageId || null,
                    source, // ✨ Sending the source tracker to backend
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
            handleOpenChangeWrapper(false);
        } catch (error) {
            toast.error("Could not send inquiry. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={currentOpen} onOpenChange={handleOpenChangeWrapper}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 p-0 overflow-hidden rounded-3xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-[0.98] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border">

                    <div className="bg-muted/30 px-6 py-5 border-b border-border/40">
                        <DialogTitle className="flex items-center gap-2 font-serif text-2xl tracking-tight">
                            <MapPin className="h-5 w-5 text-[#FA6D16]" />
                            {packageTitle ? `Inquire about ${packageTitle}` : "Send us an inquiry"}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1.5">
                            Fill out the form below and our travel experts will get in touch with you.
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
                            <Input id="name" name="name" required placeholder="John Doe" className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                <Input id="email" name="email" type="email" required placeholder="john@example.com" className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                                <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="travel_date" className="text-sm font-medium">Travel date</Label>
                                <Input id="travel_date" name="travel_date" type="date" className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="travelers" className="text-sm font-medium">Travelers</Label>
                                <Input id="travelers" name="travelers" type="number" min={1} defaultValue={2} className="h-11 rounded-2xl transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="message" className="text-sm font-medium">Message (optional)</Label>
                            <Textarea id="message" name="message" rows={2} placeholder="Tell us about your dream trip..." className="rounded-2xl resize-none transition-all hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20" />
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full h-11 mt-4 rounded-full bg-[#FA6D16] text-white hover:bg-[#E55B05] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                            {submitting ? "Sending inquiry..." : "Send inquiry"}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}