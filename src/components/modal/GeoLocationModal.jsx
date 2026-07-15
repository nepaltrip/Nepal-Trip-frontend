import React, { useState, useEffect } from "react";
import { MapPin, RefreshCw, X, Lock, CheckCircle2 } from "lucide-react";

export function GeoLocationModal({ isOpen, onClose, locationData, permissionStatus, onLocateMe, isLoading }) {
    const [isPWA, setIsPWA] = useState(false);

    // States to control smooth mounting/unmounting
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        const checkPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
        setIsPWA(!!checkPWA);
    }, []);

    // ✨ AUTO-CLOSE LOGIC
    useEffect(() => {
        if (isOpen && locationData && !isLoading && permissionStatus !== "denied") {
            // Give the user 1.5 seconds to see their location before closing smoothly
            const timer = setTimeout(() => {
                onClose();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, locationData, isLoading, permissionStatus, onClose]);

    // 60fps smooth mount/unmount logic
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimateIn(true);
                });
            });
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    const isSuccess = !!locationData && !isLoading;

    return (
        <div
            className={`fixed inset-0 z-120 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md transition-all duration-300 ease-out ${animateIn ? "opacity-100" : "opacity-0"
                }`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 transition-all duration-300 ease-out transform ${animateIn ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {permissionStatus === "denied" ? (
                    <div className="text-center mt-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm border border-red-100">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-slate-800">Enable Location</h3>
                        <p className="mt-2 text-sm text-slate-500 mb-6 px-2 leading-relaxed">
                            We need your location to enhance your experience. Please update your device settings.
                        </p>

                        {isPWA ? (
                            <div className="space-y-2.5 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-slate-700">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-white font-bold text-xs shadow-sm">1</span>
                                    <p>Open device <strong>Settings → Apps</strong></p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-white font-bold text-xs shadow-sm">2</span>
                                    <p>Select the <strong>Nepal Trip</strong> app</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500 text-white font-bold text-xs shadow-sm">3</span>
                                    <p>Turn on <strong>Location Permission</strong></p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-slate-700">
                                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                                    <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                                    <p>Click the <strong>Padlock</strong> icon in your URL bar.</p>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium text-slate-600">Location</span>
                                    </div>
                                    <div className="h-5 w-9 rounded-full bg-emerald-500 p-0.5 flex justify-end shadow-inner">
                                        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 text-center mt-1">Toggle slider to <strong>Allowed</strong>.</p>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="mt-6 w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-700 active:scale-[0.98] transition-all shadow-md"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <div className="text-center mt-2">
                        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm border transition-colors duration-500 ${isSuccess ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                            {isSuccess ? <CheckCircle2 className="h-7 w-7" /> : <MapPin className="h-7 w-7" />}
                        </div>
                        <h3 className="font-serif text-xl font-bold text-slate-800">
                            {isSuccess ? "Location Verified" : "Your Location"}
                        </h3>

                        <div className="my-6 min-h-15 flex items-center justify-center">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
                                    <span className="text-sm font-medium text-slate-500">Acquiring satellite signal...</span>
                                </div>
                            ) : (
                                <div className={`flex flex-col items-center px-4 py-3 rounded-2xl border transition-all duration-500 ${isSuccess ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Current Area</span>
                                    <p className="text-lg font-black text-slate-700">
                                        {locationData ? `${locationData.district}, ${locationData.state}` : "Unknown Area"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={isLoading || isSuccess}
                            onClick={() => onLocateMe(true)}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 py-3 text-sm font-bold text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            {isSuccess ? "Auto-closing..." : "Refresh Location"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}