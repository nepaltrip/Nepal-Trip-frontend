import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import api from "../../api/axios";
import { setCredentials } from "../../store/slices/authSlice";

export function LoginModal({ trigger }) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({ name: "", mobile: "", email: "", password: "" });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (errors[e.target.id]) {
            setErrors({ ...errors, [e.target.id]: "" });
        }
        if (errors.general) setErrors({ ...errors, general: "" });
    };

    const resetForm = () => {
        setFormData({ name: "", mobile: "", email: "", password: "" });
        setErrors({});
        setShowPassword(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
            setTimeout(() => {
                setIsLogin(true);
                resetForm();
            }, 300);
        }
    };

    const validate = () => {
        const newErrors = {};

        // Proper Email Regex to prevent inputs like "df" from reaching the backend
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!formData.password) {
            newErrors.password = "Your password must contain between 4 and 60 characters.";
        } else if (!isLogin && formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
        }

        if (!isLogin) {
            if (!formData.name) newErrors.name = "Name is required.";
            if (!formData.mobile) newErrors.mobile = "Mobile number is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            if (isLogin) {
                const { data } = await api.post("/auth/login", {
                    email: formData.email,
                    password: formData.password
                });
                dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
                toast.success(data.message || "Welcome back!");
                handleOpenChange(false);
            } else {
                const { data } = await api.post("/auth/signup", formData);
                dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
                toast.success(data.message || "Account created successfully!");
                handleOpenChange(false);
            }
        } catch (error) {
            // If the server is completely unreachable (e.g., backend not running)
            if (!error.response) {
                setErrors({ general: "Network error. Please check your connection." });
                setLoading(false);
                return;
            }

            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";

            if (isLogin) {
                // Force exact wording for ANY login failure to ensure Netflix-style security
                setErrors({ general: "Invalid User credentials" });
            } else {
                // Detailed errors for signup (e.g., "Email already exists")
                if (errorMessage.toLowerCase().includes("exists")) {
                    setErrors({ email: errorMessage });
                } else {
                    setErrors({ general: errorMessage });
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-120 translate-x-[-50%] translate-y-[-50%] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-border/50 bg-background px-8 py-6 sm:px-10 sm:py-8 shadow-2xl transition-all duration-300">

                <div className="flex flex-col items-center text-center mb-5">
                    <img src="/logo.svg" alt="Nepal Trip Logo" className="h-12 w-12 rounded-full object-cover shadow-sm mb-3" />
                    <h2 className="text-[32px] leading-tight font-bold tracking-[-0.04em] text-foreground font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
                        Welcome to Nepal Trip
                    </h2>
                </div>

                <Button type="button" disabled={loading} className="w-full h-11 rounded-full font-semibold border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors duration-200">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </Button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60" /></div>
                    <div className="relative flex justify-center text-xs font-bold"><span className="bg-background px-3 text-muted-foreground">OR</span></div>
                </div>

                <form onSubmit={handleSubmit} noValidate>

                    {/* FIXED SPACE: General Error Container */}
                    <div className="h-10 w-full shrink-0 mb-2">
                        {errors.general && (
                            <div className="h-full flex items-center justify-center px-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-in fade-in duration-200">
                                {errors.general}
                            </div>
                        )}
                    </div>

                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${!isLogin ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                            <div className="flex flex-col">

                                {/* FIXED SPACE: Name Field */}
                                <div className="relative pb-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name" className="text-[13px] font-semibold pl-1">Name</Label>
                                        <Input id="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={`h-11 rounded-2xl transition-all ${errors.name ? 'border-red-500 focus-visible:ring-red-500/20' : 'hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20'}`} />
                                    </div>
                                    {errors.name && <span className="absolute bottom-0.5 left-1 text-[11px] leading-tight text-red-500 font-medium">{errors.name}</span>}
                                </div>

                                {/* FIXED SPACE: Mobile Field */}
                                <div className="relative pb-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="mobile" className="text-[13px] font-semibold pl-1">Mobile No.</Label>
                                        <Input id="mobile" type="tel" value={formData.mobile} onChange={handleChange} placeholder="+1 (555) 000-0000" className={`h-11 rounded-2xl transition-all ${errors.mobile ? 'border-red-500 focus-visible:ring-red-500/20' : 'hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20'}`} />
                                    </div>
                                    {errors.mobile && <span className="absolute bottom-0.5 left-1 text-[11px] leading-tight text-red-500 font-medium">{errors.mobile}</span>}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* FIXED SPACE: Email Field */}
                    <div className="relative pb-5">
                        <div className="grid gap-1.5">
                            <Label htmlFor="email" className="text-[13px] font-semibold pl-1">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" className={`h-11 rounded-2xl transition-all ${errors.email ? 'border-red-500 focus-visible:ring-red-500/20' : 'hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20'}`} />
                        </div>
                        {errors.email && <span className="absolute bottom-0.5 left-1 text-[11px] leading-tight text-red-500 font-medium">{errors.email}</span>}
                    </div>

                    {/* FIXED SPACE: Password Field */}
                    <div className="relative pb-5">
                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="text-[13px] font-semibold pl-1">Password</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Password" className={`h-11 rounded-2xl pr-10 transition-all ${errors.password ? 'border-red-500 focus-visible:ring-red-500/20' : 'hover:border-[#FA6D16]/50 focus:border-[#FA6D16] focus-visible:ring-[#FA6D16]/20'}`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        {errors.password && <span className="absolute -bottom-1 left-1 text-[11px] leading-tight text-red-500 font-medium whitespace-nowrap">{errors.password}</span>}
                    </div>

                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isLogin ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                            <div className="flex w-full pb-2 pl-1">
                                <button type="button" className="text-[13px] font-bold text-foreground hover:underline hover:text-[#FA6D16] transition-colors">
                                    Forgot your password?
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FIXED TEXT: Anti-jerk button text */}
                    <Button type="submit" disabled={loading} className="w-full h-11 mt-1 relative flex items-center justify-center rounded-full bg-[#FA6D16] text-white font-semibold text-base hover:bg-[#E55B05] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:hover:scale-100">
                        {loading && <Loader2 className="absolute h-5 w-5 animate-spin text-white" />}
                        <span className={`transition-opacity duration-200 ${loading ? "opacity-0" : "opacity-100"}`}>
                            {isLogin ? "Log in" : "Sign up"}
                        </span>
                    </Button>
                </form>

                <div className="mt-5 text-center text-sm">
                    {isLogin ? (
                        <p className="text-muted-foreground">New here? <button onClick={() => { setIsLogin(false); resetForm(); }} className="font-bold text-foreground hover:underline hover:text-[#FA6D16] transition-colors">Sign Up</button></p>
                    ) : (
                        <p className="text-muted-foreground">Already a member? <button onClick={() => { setIsLogin(true); resetForm(); }} className="font-bold text-foreground hover:underline hover:text-[#FA6D16] transition-colors">Log in</button></p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}