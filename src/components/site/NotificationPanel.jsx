import React, { useState, useEffect } from "react";
import { X, Bell, Trash2, CheckCircle2, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";

export function NotificationPanel({ isOpen, onClose, newNotification }) {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth); // ✨ Get user role for routing

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);

            const hasUnread = data.some(n => !n.isRead);
            if (hasUnread) {
                await api.put('/notifications/mark-all-read');
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error("Failed to load notifications");
        }
    };

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen]);

    useEffect(() => {
        if (newNotification) {
            setNotifications(prev => {
                const exists = prev.find(n => n._id === newNotification._id);
                if (exists) return prev;
                return [newNotification, ...prev];
            });
        }
    }, [newNotification]);

    const markAsRead = async (id) => {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        await api.put(`/notifications/${id}/read`);
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n._id !== id));
        await api.delete(`/notifications/${id}`);
    };

    const clearAll = async () => {
        setNotifications([]);
        await api.delete(`/notifications/clear/all`);
    };

    // ✨ NEW: Deep Linking Click Handler
    const handleNotificationClick = (n) => {
        if (!n.isRead) markAsRead(n._id);

        onClose(); // Close the panel

        // Navigate based on role if an inquiryId exists
        if (n.inquiryId) {
            if (user?.role === 'SuperAdmin') {
                navigate(`/superadmin/inquiries?id=${n.inquiryId}`);
            } else if (user?.role === 'Admin') {
                navigate(`/admin/inquiries?id=${n.inquiryId}`);
            }
            // If it's a standard user, you could navigate them to a user-profile inquiry page if you build one later!
        }
    };

    return (
        <div className={`fixed inset-0 z-120 transition-opacity duration-300 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`fixed right-0 top-0 h-full w-full max-w-sm bg-card shadow-2xl border-l border-border/40 transition-transform duration-300 ease-in-out transform flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                        <Bell className="h-5 w-5 text-[#FA6D16]" /> Notifications
                    </h2>
                    <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                            <button onClick={clearAll} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-500/10 px-2 py-1 rounded">
                                Clear All
                            </button>
                        )}
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {notifications.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center opacity-70">
                            <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-500" />
                            <p className="text-sm font-semibold">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={() => handleNotificationClick(n)}
                                className={`relative group p-4 rounded-xl border transition-all cursor-pointer ${n.isRead ? "bg-background border-border/40 opacity-75 hover:bg-muted/50" : "bg-[#FA6D16]/5 border-[#FA6D16]/30 shadow-sm"}`}
                            >
                                {!n.isRead && <span className="absolute top-4 left-2 h-2 w-2 rounded-full bg-[#FA6D16]" />}
                                <div className="pl-3 pr-6">
                                    <h4 className="text-sm font-bold text-foreground mb-1">{n.title}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{n.message}</p>

                                    {/* ✨ NEW: Rich Context Rendering */}
                                    {n.payload && (n.payload.inquiryText || n.payload.replyText) && (
                                        <div className="mt-2 space-y-2 border-t border-border/40 pt-2">
                                            {n.payload.inquiryText && (
                                                <div className="bg-muted/50 p-2 rounded-lg border border-border/50 text-xs italic text-muted-foreground line-clamp-2">
                                                    "{n.payload.inquiryText}"
                                                </div>
                                            )}
                                            {n.payload.replyText && (
                                                <div className="flex items-start gap-2 bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-xs text-emerald-800">
                                                    <MessageSquareText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                                    <span className="line-clamp-2">{n.payload.replyText}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => deleteNotification(e, n._id)}
                                    className="absolute top-3 right-3 p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}