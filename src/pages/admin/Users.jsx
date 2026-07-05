import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Users() {
    const [team, setTeam] = useState([]);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("admin");

    useEffect(() => {
        setTeam([
            {
                id: "r1",
                role: "superadmin",
                created_at: new Date().toISOString(),
                profiles: { email: "superadmin@nepaltrip.in", full_name: "Super Administrator" }
            },
            {
                id: "r2",
                role: "admin",
                created_at: new Date().toISOString(),
                profiles: { email: "moderator@nepaltrip.in", full_name: "Tour Manager" }
            }
        ]);
    }, []);

    async function grant() {
        if (!email) return;

        const newRole = {
            id: Math.random().toString(),
            role: role,
            created_at: new Date().toISOString(),
            profiles: { email: email.trim().toLowerCase(), full_name: "Pending Invite" }
        };

        setTeam(prev => [...prev, newRole]);
        setEmail("");
        toast.success("Role granted context updated");
    }

    async function revoke(id) {
        if (!confirm("Remove this role?")) return;
        setTeam(prev => prev.filter(r => r.id !== id));
        toast.success("Role access updated");
    }

    return (
        <div>
            <h1 className="font-serif text-3xl">Team & roles</h1>
            <p className="mt-1 text-sm text-muted-foreground">Grant admin access to the client and other trusted users.</p>

            <div className="mt-6 grid gap-3 rounded-2xl border border-border/60 bg-card p-6 sm:grid-cols-[1fr_140px_auto]">
                <div className="grid gap-2">
                    <Label>User email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
                </div>
                <div className="grid gap-2">
                    <Label>Role</Label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <Button onClick={grant} className="bg-accent text-accent-foreground hover:bg-accent/90">Grant role</Button>
                </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-4 py-3 font-medium">User</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Since</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.map((r) => (
                            <tr key={r.id} className="border-t border-border/60">
                                <td className="px-4 py-3">
                                    <div className="font-medium">{r.profiles?.email ?? r.user_id}</div>
                                    {r.profiles?.full_name && <div className="text-xs text-muted-foreground">{r.profiles.full_name}</div>}
                                </td>
                                <td className="px-4 py-3 capitalize">{r.role}</td>
                                <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-right">
                                    <Button size="sm" variant="outline" onClick={() => revoke(r.id)}>Revoke</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}