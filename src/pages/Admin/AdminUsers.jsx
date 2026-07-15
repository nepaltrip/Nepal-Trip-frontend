import React, { useEffect, useState, useMemo } from "react";
import { Users, Activity, Search, ShieldCheck, Mail, ChevronRight, Loader2 } from "lucide-react";
import { UserDetailModal } from "../../components/modal/UserDetailModal";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import api from "../../api/axios";
import { toast } from "react-toastify";

const formatLastSeen = (dateString, isOnline) => {
    if (isOnline) return "Online Now";
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((new Date() - date) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export default function AdminUsers() {
    const { user: currentUser } = useSelector((state) => state.auth);

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get("/admin/users");
                if (data.success) setUsers(data.users);
            } catch (error) {
                toast.error("Failed to load users list.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        const socket = io(baseUrl, { withCredentials: true });
        socket.emit('register', { id: currentUser.id || currentUser._id, role: currentUser.role });

        socket.on('user_presence_update', (data) => {
            setUsers(prevUsers => prevUsers.map(u => {
                if (u.id === data.userId) {
                    return { ...u, isOnline: data.isOnline, lastSeenAt: data.lastSeenAt, active24h: data.isOnline ? true : u.active24h };
                }
                return u;
            }));
        });
        return () => socket.disconnect();
    }, [currentUser]);

    const active24hCount = users.filter(u => u.active24h).length;

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filter === "all" ? true : user.active24h === true;
            return matchesSearch && matchesFilter;
        });
    }, [users, searchQuery, filter]);

    const handleUserUpdate = (updatedUser) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    const handleUserDelete = (deletedUserId) => {
        setUsers(prev => prev.filter(u => u.id !== deletedUserId));
        setSelectedUser(null);
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-12 font-sans">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">Verified Users</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Manage all registered accounts, view engagement profiles, and control access.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div onClick={() => setFilter("all")} className={`p-6 rounded-2xl border transition-all cursor-pointer ${filter === 'all' ? 'bg-[#2A5244] border-[#2A5244] text-white shadow-md' : 'bg-white border-border/40 hover:border-[#2A5244]/30'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-sm font-bold uppercase tracking-wider ${filter === 'all' ? 'text-white/80' : 'text-muted-foreground'}`}>Total Users</p>
                            <h3 className={`text-3xl font-black mt-1 ${filter === 'all' ? 'text-white' : 'text-foreground'}`}>{isLoading ? "-" : users.length}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${filter === 'all' ? 'bg-white/10' : 'bg-[#2A5244]/10'}`}><Users className={`h-6 w-6 ${filter === 'all' ? 'text-white' : 'text-[#2A5244]'}`} /></div>
                    </div>
                </div>

                <div onClick={() => setFilter("24h")} className={`p-6 rounded-2xl border transition-all cursor-pointer ${filter === '24h' ? 'bg-[#FA6D16] border-[#FA6D16] text-white shadow-md' : 'bg-white border-border/40 hover:border-[#FA6D16]/30'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`text-sm font-bold uppercase tracking-wider ${filter === '24h' ? 'text-white/80' : 'text-muted-foreground'}`}>Active (Last 24h)</p>
                            <h3 className={`text-3xl font-black mt-1 ${filter === '24h' ? 'text-white' : 'text-foreground'}`}>{isLoading ? "-" : active24hCount}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${filter === '24h' ? 'bg-white/10' : 'bg-[#FA6D16]/10'}`}><Activity className={`h-6 w-6 ${filter === '24h' ? 'text-white' : 'text-[#FA6D16]'}`} /></div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-border/40 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 md:p-6 border-b border-border/40 bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-[#2A5244]" /> {filter === '24h' ? "Recently Active Users" : "All Registered Users"}
                    </h2>
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30 focus:border-[#2A5244] transition-all placeholder:text-muted-foreground/60" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin text-[#2A5244]" /></div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-muted-foreground uppercase bg-[#FDFBF7] border-b border-border/40">
                                    <tr><th className="px-6 py-4 font-bold tracking-wider">User</th><th className="px-6 py-4 font-bold tracking-wider">Contact</th><th className="px-6 py-4 font-bold tracking-wider">Lead Status</th><th className="px-6 py-4 font-bold tracking-wider">Last Seen</th><th className="px-6 py-4 text-right font-bold tracking-wider">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                        <tr key={user.id} onClick={() => setSelectedUser(user)} className="hover:bg-[#FDFBF7] transition-colors cursor-pointer group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {user.profilePic ? <img src={user.profilePic} alt={user.name} className={`h-8 w-8 shrink-0 rounded-full object-cover border ${user.status === 'banned' ? 'border-red-500' : 'border-transparent'}`} /> : <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center font-bold text-white text-xs ${user.status === 'banned' ? 'bg-red-500' : 'bg-[#2A5244]'}`}>{user.name.charAt(0).toUpperCase()}</div>}
                                                        {user.isOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />}
                                                    </div>
                                                    <span className="font-bold text-foreground group-hover:text-[#2A5244] transition-colors">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-muted-foreground"><Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate max-w-37.5">{user.email}</span></div></td>
                                            <td className="px-6 py-4"><span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${user.leadScore === 'Hot' ? 'bg-[#FA6D16]/10 text-[#FA6D16] border-[#FA6D16]/20' : user.leadScore === 'Spam' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>{user.leadScore}</span></td>
                                            <td className={`px-6 py-4 font-medium ${user.isOnline ? 'text-emerald-600 font-bold' : 'text-muted-foreground'}`}>{formatLastSeen(user.lastSeenAt, user.isOnline)}</td>
                                            <td className="px-6 py-4 text-right"><div className="inline-flex items-center justify-center p-2 rounded-full text-muted-foreground group-hover:bg-[#2A5244]/10 group-hover:text-[#2A5244] transition-colors"><ChevronRight className="h-4 w-4" /></div></td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No users found matching your criteria.</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden flex flex-col gap-3 p-4 bg-muted/10">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <div key={user.id} onClick={() => setSelectedUser(user)} className="bg-white border border-border/60 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-[#2A5244]/50 active:scale-[0.98] transition-all cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                {user.profilePic ? <img src={user.profilePic} alt={user.name} className={`h-10 w-10 shrink-0 rounded-full object-cover border ${user.status === 'banned' ? 'border-red-500' : 'border-transparent'}`} /> : <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-white text-sm ${user.status === 'banned' ? 'bg-red-500' : 'bg-[#2A5244]'}`}>{user.name.charAt(0).toUpperCase()}</div>}
                                                {user.isOnline && <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-[2.5px] border-white shadow-sm" />}
                                            </div>
                                            <div className="flex flex-col"><span className="font-bold text-foreground text-sm leading-tight truncate max-w-35">{user.name}</span><span className={`text-[10px] font-medium mt-0.5 ${user.isOnline ? 'text-emerald-600' : 'text-muted-foreground'}`}>{formatLastSeen(user.lastSeenAt, user.isOnline)}</span></div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border shrink-0 ${user.leadScore === 'Hot' ? 'bg-[#FA6D16]/10 text-[#FA6D16] border-[#FA6D16]/20' : user.leadScore === 'Spam' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>{user.leadScore}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-[#FDFBF7] p-2.5 rounded-lg border border-border/40">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground min-w-0"><Mail className="h-3.5 w-3.5 shrink-0 text-[#2A5244]/60" /><span className="truncate">{user.email}</span></div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </div>
                                </div>
                            )) : <div className="text-center p-8 bg-white border border-dashed border-border/60 rounded-xl text-muted-foreground text-sm font-medium">No users found matching your search.</div>}
                        </div>
                    </>
                )}
            </div>

            <UserDetailModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} viewerRole={currentUser?.role} userData={selectedUser} onSave={handleUserUpdate} onDelete={handleUserDelete} />
        </div>
    );
}