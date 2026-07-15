import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export function InlineEditor({
    value,
    onSave,
    as: Component = "span",
    type = "text", // 'text' or 'textarea'
    className = ""
}) {
    // 1. Check if the user is a Superadmin via Redux
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isSuperAdmin = isAuthenticated && user?.role === "SuperAdmin";

    const [isEditing, setIsEditing] = useState(false);
    const [draftValue, setDraftValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);

    // Keep draft synced if external value changes
    useEffect(() => {
        setDraftValue(value);
    }, [value]);

    const handleSave = async () => {
        if (draftValue === value) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(draftValue);
            setIsEditing(false);
            toast.success("Content updated successfully!");
        } catch (error) {
            toast.error("Failed to save changes.");
            setDraftValue(value); // Revert on failure
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setDraftValue(value);
        setIsEditing(false);
    };

    // 2. If NOT Superadmin, render normal view mode seamlessly
    if (!isSuperAdmin) {
        return <Component className={className}>{value}</Component>;
    }

    // 3. EDIT MODE UI
    if (isEditing) {
        return (
            <div className="relative inline-block w-full max-w-full">
                {type === "textarea" ? (
                    <textarea
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        className={`w-full p-3 bg-white border-2 border-[#FA6D16] outline-hidden rounded-md text-foreground shadow-lg ${className}`}
                        rows={4}
                        autoFocus
                    />
                ) : (
                    <input
                        type="text"
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        className={`w-full p-2 bg-white border-2 border-[#FA6D16] outline-hidden rounded-md text-foreground shadow-lg ${className}`}
                        autoFocus
                    />
                )}

                {/* Save/Cancel Action Buttons */}
                <div className="flex gap-2 mt-2 justify-end w-full">
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors min-w-9 flex items-center justify-center"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    </button>
                </div>
            </div>
        );
    }

    // 4. SUPERADMIN VIEW MODE (Hover to Edit)
    return (
        <div className="group relative inline-block w-full">
            <Component className={`transition-all duration-200 group-hover:opacity-80 group-hover:blur-[1px] ${className}`}>
                {value}
            </Component>

            <button
                onClick={() => setIsEditing(true)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#FA6D16] text-white p-2 rounded-full shadow-xl hover:scale-110"
                title="Edit Content"
            >
                <Edit2 size={18} />
            </button>
        </div>
    );
}