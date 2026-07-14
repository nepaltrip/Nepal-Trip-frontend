import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Globe, User, Lock, Smartphone, Save, Image as ImageIcon,
    ShieldCheck, MapPin, Edit2, X, Mail, Phone, Loader2, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { updateUser } from "../../store/slices/authSlice";

// ==========================================
// CUSTOM SVG ICONS
// ==========================================
const YoutubeIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.17 1 12 1 12s0 3.83.54 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.83 23 12 23 12s0-3.83-.54-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);
const InstagramIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const FacebookIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const TwitterIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
);
const WhatsAppIcon = ({ className }) => (
    <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

// ==========================================
// REUSABLE COMPONENTS (MOVED OUTSIDE)
// ==========================================
const FormInput = ({ label, type = "text", icon: Icon, ...props }) => (
    <div className="space-y-1.5 w-full">
        <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2A5244]/60">
                    <Icon className="h-4 w-4" />
                </div>
            )}
            <input
                type={type}
                className={`w-full py-3 bg-[#FDFBF7] border border-border/60 rounded-xl text-sm font-medium text-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2A5244]/30 focus:border-[#2A5244] transition-all placeholder:text-muted-foreground/60 shadow-sm ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
                {...props}
            />
        </div>
    </div>
);

const SubmitButton = ({ isSaving, defaultText, onClick }) => (
    <button
        type="submit"
        onClick={onClick}
        disabled={isSaving}
        className="relative overflow-hidden inline-flex items-center justify-center gap-2 bg-[#2A5244] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-[#214136] transition-all active:scale-95 disabled:opacity-80 disabled:pointer-events-none min-w-40"
    >
        <AnimatePresence>
            {isSaving && (
                <motion.div
                    className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-12"
                    initial={{ x: '-150%' }}
                    animate={{ x: '150%' }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
            )}
        </AnimatePresence>
        <span className="relative z-10 flex items-center gap-2">
            {defaultText} <Save className="h-4 w-4" />
        </span>
    </button>
);

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function SuperAdminSettings() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState("site");
    const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    // Saving States
    const [isSavingSite, setIsSavingSite] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    const [isSavingSecurity, setIsSavingSecurity] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Site Settings State
    const [siteDetails, setSiteDetails] = useState({
        email: "", phone: "", address: "", youtube: "",
        instagram: "", facebook: "", twitter: "", whatsapp: ""
    });

    // Account Settings State
    const [accountDetails, setAccountDetails] = useState({
        name: user?.name || "",
        email: user?.email || "",
        profilePic: user?.profilePic || ""
    });

    // Password State (Removed Current Password)
    const [passwordDetails, setPasswordDetails] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    // Sync account details if Redux user changes externally
    useEffect(() => {
        if (user) {
            setAccountDetails({
                name: user.name || "",
                email: user.email || "",
                profilePic: user.profilePic || ""
            });
        }
    }, [user]);

    const handleSiteChange = (e) => setSiteDetails({ ...siteDetails, [e.target.name]: e.target.value });
    const handleAccountChange = (e) => setAccountDetails({ ...accountDetails, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordDetails({ ...passwordDetails, [e.target.name]: e.target.value });

    // ✨ FETCH INITIAL SITE DATA
    useEffect(() => {
        const fetchSiteConfig = async () => {
            try {
                const { data } = await api.get('/social');
                if (data?.data) {
                    setSiteDetails(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch global config:", error);
            }
        };
        fetchSiteConfig();
    }, []);

    // ✨ CLOUDFLARE R2 PRESIGNED UPLOAD LOGIC
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingPhoto(true);
        try {
            const { data } = await api.get(`/media/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&folder=profiles`);

            await fetch(data.presignedUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file
            });

            setAccountDetails((prev) => ({ ...prev, profilePic: data.publicUrl }));
            toast.success("Photo uploaded successfully. Don't forget to click 'Update Profile' to save it.");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setIsUploadingPhoto(false);
            e.target.value = null;
        }
    };

    // ✨ MODAL: Save Site Config
    const handleSaveSite = async (e) => {
        e.preventDefault();
        setIsSavingSite(true);
        try {
            const { data } = await api.put('/social', siteDetails);
            setSiteDetails(data.data);
            setIsSiteModalOpen(false);
            toast.success("Site configuration updated globally.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update site config.");
        } finally {
            setIsSavingSite(false);
        }
    };

    // ✨ PROFILE UPDATE
    const handleSaveAccount = async (e) => {
        e.preventDefault();
        setIsSavingAccount(true);
        try {
            const { data } = await api.put('/superadmin/profile', {
                name: accountDetails.name,
                email: accountDetails.email,
                profilePic: accountDetails.profilePic
            });

            dispatch(updateUser(data.user));
            toast.success("SuperAdmin profile updated successfully!");
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSavingAccount(false);
        }
    };

    // ✨ PASSWORD UPDATE
    const handleSaveSecurity = async (e) => {
        e.preventDefault();

        if (passwordDetails.newPassword !== passwordDetails.confirmPassword) {
            return toast.error("Passwords do not match.");
        }

        setIsSavingSecurity(true);
        try {
            await api.put('/superadmin/password', {
                newPassword: passwordDetails.newPassword,
                confirmPassword: passwordDetails.confirmPassword
            });

            toast.success("Password set securely!");

            setPasswordDetails({
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Password update error:", error);
            toast.error(error.response?.data?.message || "Failed to update password.");
        } finally {
            setIsSavingSecurity(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-12 font-sans">
            {/* Header */}
            <div className="px-2 md:px-0">
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground tracking-tight">Settings</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">Manage your global site configuration and account security.</p>
            </div>

            {/* Tabs */}
            <div className="flex w-full border-b border-border/40">
                <button
                    onClick={() => setActiveTab("site")}
                    className={`flex-1 md:flex-none pb-3 text-[11px] sm:text-sm font-bold transition-all border-b-2 px-1 sm:px-4 flex items-center justify-center md:justify-start gap-1.5 ${activeTab === "site" ? "border-[#2A5244] text-[#2A5244]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                >
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">Global Site Details</span>
                </button>
                <button
                    onClick={() => setActiveTab("account")}
                    className={`flex-1 md:flex-none pb-3 text-[11px] sm:text-sm font-bold transition-all border-b-2 px-1 sm:px-4 flex items-center justify-center md:justify-start gap-1.5 ${activeTab === "account" ? "border-[#2A5244] text-[#2A5244]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                >
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">Account & Security</span>
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="relative min-h-75">
                <AnimatePresence mode="wait">
                    {/* GLOBAL SITE DETAILS TAB */}
                    {activeTab === "site" && (
                        <motion.div
                            key="tab-site"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="bg-white border border-border/40 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden"
                        >
                            <div className="p-6 md:p-10">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 md:mb-8">
                                    <h3 className="text-xl md:text-2xl font-bold font-serif text-foreground flex items-center gap-2">
                                        <Globe className="h-5 w-5 md:h-6 md:w-6 text-[#2A5244] shrink-0" />
                                        Site Configuration
                                    </h3>
                                    <button
                                        onClick={() => setIsSiteModalOpen(true)}
                                        className="flex items-center justify-center gap-2 text-sm font-bold text-[#2A5244] bg-[#2A5244]/10 hover:bg-[#2A5244]/20 px-4 py-2.5 sm:py-2 rounded-lg transition-colors active:scale-95 w-full sm:w-auto shrink-0"
                                    >
                                        <Edit2 className="h-4 w-4 shrink-0" /> Edit Configuration
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-border/40 pt-8">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FA6D16] mb-4">Contact Information</h4>
                                        <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                                            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#2A5244]" /> {siteDetails.email || "Not set"}</li>
                                            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#2A5244]" /> {siteDetails.phone || "Not set"}</li>
                                            <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-[#2A5244] mt-0.5 shrink-0" /> <span className="leading-relaxed">{siteDetails.address || "Not set"}</span></li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FA6D16] mb-4">Social Media Presence</h4>
                                        <ul className="space-y-4 text-sm font-medium text-muted-foreground w-full overflow-hidden">
                                            <li className="flex items-center gap-3">
                                                <YoutubeIcon className="h-4 w-4 text-[#FF0000] shrink-0" />
                                                <a href={siteDetails.youtube} target="_blank" rel="noreferrer" className="hover:text-[#2A5244] truncate">{siteDetails.youtube || "Not set"}</a>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <InstagramIcon className="h-4 w-4 text-[#E1306C] shrink-0" />
                                                <a href={siteDetails.instagram} target="_blank" rel="noreferrer" className="hover:text-[#2A5244] truncate">{siteDetails.instagram || "Not set"}</a>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <FacebookIcon className="h-4 w-4 text-[#1877F2] shrink-0" />
                                                <a href={siteDetails.facebook} target="_blank" rel="noreferrer" className="hover:text-[#2A5244] truncate">{siteDetails.facebook || "Not set"}</a>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <WhatsAppIcon className="h-4 w-4 text-[#25D366] shrink-0" />
                                                <span className="truncate">{siteDetails.whatsapp || "Not set"}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ACCOUNT & SECURITY TAB */}
                    {activeTab === "account" && (
                        <motion.div
                            key="tab-account"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="space-y-6 md:space-y-8"
                        >
                            <motion.form variants={itemVariants} onSubmit={handleSaveAccount} className="bg-white border border-border/40 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden">
                                <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                                    <h3 className="text-lg md:text-xl font-bold font-serif text-foreground flex items-center gap-2">
                                        <User className="h-5 w-5 text-[#2A5244]" /> Profile Management
                                    </h3>

                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                        <div className="flex flex-col items-center gap-4 shrink-0">
                                            <div className="relative group">
                                                <div
                                                    className="h-28 w-28 rounded-full bg-linear-to-br from-[#2A5244] to-[#1a332a] flex items-center justify-center border-4 border-white shadow-lg overflow-hidden cursor-pointer relative"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    {accountDetails.profilePic ? (
                                                        <img src={accountDetails.profilePic} alt={accountDetails.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-white font-serif text-4xl font-bold">{accountDetails.name.charAt(0) || "S"}</span>
                                                    )}

                                                    {/* Hover Overlay for Upload */}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ImageIcon className="text-white h-8 w-8" />
                                                    </div>
                                                </div>

                                                {/* Delete Button (Only shows if a picture exists) */}
                                                {accountDetails.profilePic && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevents triggering the file upload click
                                                            setAccountDetails(prev => ({ ...prev, profilePic: "" }));
                                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                                        }}
                                                        className="absolute -top-1 -right-1 z-10 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-transform active:scale-90"
                                                        title="Remove Photo"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handlePhotoUpload}
                                            />
                                            <button
                                                type="button"
                                                disabled={isUploadingPhoto}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-xs font-bold text-[#2A5244] hover:text-[#FA6D16] transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-[#2A5244]/5 rounded-full disabled:opacity-50 mt-1"
                                            >
                                                {isUploadingPhoto ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                )}
                                                {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                                            </button>
                                        </div>

                                        <div className="flex-1 w-full space-y-5 md:pt-2">
                                            <FormInput label="Full Name" name="name" value={accountDetails.name} onChange={handleAccountChange} />
                                            <FormInput label="Login Email Address" type="email" name="email" value={accountDetails.email} onChange={handleAccountChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#FDFBF7] px-5 py-4 md:px-8 md:py-5 border-t border-border/40 flex justify-end">
                                    <SubmitButton isSaving={isSavingAccount} defaultText="Update Profile" />
                                </div>
                            </motion.form>

                            <motion.form variants={itemVariants} onSubmit={handleSaveSecurity} className="bg-white border border-border/40 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden">
                                <div className="p-5 md:p-8 space-y-6">
                                    <h3 className="text-lg md:text-xl font-bold font-serif text-foreground flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-[#2A5244]" /> Set / Update Password
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 md:max-w-4xl">
                                        <FormInput
                                            label="New Password"
                                            type="password"
                                            name="newPassword"
                                            value={passwordDetails.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <FormInput
                                            label="Confirm New Password"
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordDetails.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="bg-[#FDFBF7] px-5 py-4 md:px-8 md:py-5 border-t border-border/40 flex justify-end">
                                    <SubmitButton isSaving={isSavingSecurity} defaultText="Save Password" />
                                </div>
                            </motion.form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MODAL: SITE CONFIGURATION */}
            <AnimatePresence>
                {isSiteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsSiteModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] w-full max-w-3xl z-10 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
                        >
                            <div className="px-6 py-5 border-b border-border/40 bg-[#FDFBF7] flex items-center justify-between">
                                <h3 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-[#2A5244]" /> Edit Site Configuration
                                </h3>
                                <button type="button" onClick={() => setIsSiteModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-wider text-[#2A5244] mb-4 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Contact Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormInput label="Official Email" type="email" name="email" value={siteDetails.email} onChange={handleSiteChange} />
                                        <FormInput label="Contact Phone" name="phone" value={siteDetails.phone} onChange={handleSiteChange} />
                                        <div className="md:col-span-2">
                                            <FormInput label="Physical Office Address" name="address" value={siteDetails.address} onChange={handleSiteChange} />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-border/40" />

                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-wider text-[#2A5244] mb-4 flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" /> Social Media Presence
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormInput label="WhatsApp Number" type="tel" name="whatsapp" icon={WhatsAppIcon} value={siteDetails.whatsapp} onChange={handleSiteChange} />
                                        <FormInput label="YouTube Channel URL" type="url" name="youtube" icon={YoutubeIcon} value={siteDetails.youtube} onChange={handleSiteChange} />
                                        <FormInput label="Instagram Profile URL" type="url" name="instagram" icon={InstagramIcon} value={siteDetails.instagram} onChange={handleSiteChange} />
                                        <FormInput label="Facebook Page URL" type="url" name="facebook" icon={FacebookIcon} value={siteDetails.facebook} onChange={handleSiteChange} />
                                        <FormInput label="Twitter / X URL" type="url" name="twitter" icon={TwitterIcon} value={siteDetails.twitter} onChange={handleSiteChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-5 bg-[#FDFBF7] border-t border-border/40 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSiteModalOpen(false)}
                                    className="px-6 py-2.5 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <SubmitButton isSaving={isSavingSite} defaultText="Save Configuration" onClick={handleSaveSite} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}