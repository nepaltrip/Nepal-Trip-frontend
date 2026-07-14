import React, { useEffect, useState, useRef } from "react";
import { X, Camera, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

export function UpdateProfileModal({ isOpen, onClose, user, onUpdateSuccess }) {
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    // Track if the user explicitly deleted their picture
    const [removeProfilePic, setRemoveProfilePic] = useState(false);

    // Autofill using user.mobile (matching your DB schema) or user.phone
    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: user?.mobile || user?.phone || "",
        password: "",
        confirmPassword: "",
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profilePic || "");

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name || "",
                phone: user.mobile || user.phone || "",
                password: "",
                confirmPassword: "",
            });
            setPreviewUrl(user.profilePic || "");
            setSelectedFile(null);
            setRemoveProfilePic(false);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image must be less than 5MB");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setRemoveProfilePic(false); // Cancel any previous delete action
        }
    };

    const handleDeletePic = (e) => {
        e.stopPropagation(); // Prevents the file input from opening
        setPreviewUrl("");
        setSelectedFile(null);
        setRemoveProfilePic(true);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            let finalProfilePicUrl = user?.profilePic;

            // 1. Upload new profile picture to Cloudflare R2 if selected
            if (selectedFile) {
                const { data: presigned } = await api.get('/media/presigned-url', {
                    params: {
                        fileName: selectedFile.name,
                        fileType: selectedFile.type,
                        folder: 'profiles'
                    }
                });

                await fetch(presigned.presignedUrl, {
                    method: 'PUT',
                    body: selectedFile,
                    headers: { 'Content-Type': selectedFile.type }
                });

                finalProfilePicUrl = presigned.publicUrl;
            }

            // 2. Build Payload
            const payload = {
                name: formData.name,
                phone: formData.phone,
            };

            // Handle Profile Pic changes
            if (removeProfilePic) {
                payload.profilePic = ""; // Tell backend to wipe it
            } else if (finalProfilePicUrl !== user?.profilePic) {
                payload.profilePic = finalProfilePicUrl;
            }

            if (formData.password) {
                payload.password = formData.password;
            }

            // Ensure you are using the correct endpoint based on your previous 404 error
            const { data } = await api.put(`/user/${user.id || user._id}`, payload);

            toast.success("Profile updated successfully!");
            if (onUpdateSuccess) onUpdateSuccess(data.user);
            onClose();

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">

                    {/* Smooth Backdrop Transition */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Smooth Modal Transition */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md rounded-2xl bg-background border border-border/50 shadow-2xl overflow-hidden z-10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 bg-muted/20">
                            <h2 className="text-lg font-bold text-foreground">Update Profile</h2>
                            <button onClick={onClose} className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className="relative group">
                                    <div
                                        className="h-24 w-24 rounded-full overflow-hidden border-2 border-border/50 shadow-md group-hover:border-[#FA6D16] transition-colors cursor-pointer relative"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-muted flex items-center justify-center text-3xl font-black text-muted-foreground">
                                                {formData.name.charAt(0).toUpperCase() || "U"}
                                            </div>
                                        )}

                                        {/* Hover Overlay for Upload */}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white h-8 w-8" />
                                        </div>
                                    </div>

                                    {/* Delete Button (Only shows if a picture exists) */}
                                    {previewUrl && (
                                        <button
                                            type="button"
                                            onClick={handleDeletePic}
                                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-transform active:scale-90"
                                            title="Remove Photo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <p className="text-xs text-muted-foreground mt-3 font-medium">Click photo to change</p>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-[#FA6D16] focus:ring-1 focus:ring-[#FA6D16] outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Mobile Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter mobile number"
                                        className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-[#FA6D16] focus:ring-1 focus:ring-[#FA6D16] outline-none transition-all"
                                    />
                                </div>

                                <div className="pt-2 border-t border-border/40">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Leave blank to keep current"
                                        className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-[#FA6D16] focus:ring-1 focus:ring-[#FA6D16] outline-none transition-all mb-3"
                                    />

                                    {formData.password && (
                                        <motion.input
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm new password"
                                            required={!!formData.password}
                                            className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5 text-sm focus:border-[#FA6D16] focus:ring-1 focus:ring-[#FA6D16] outline-none transition-all"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FA6D16] text-white font-bold text-sm shadow-md hover:bg-[#E55B05] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                {isLoading ? "Saving Profile..." : "Save Changes"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}