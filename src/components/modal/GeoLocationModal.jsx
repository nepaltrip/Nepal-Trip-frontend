import React, { useState, useEffect } from "react";
import { MapPin, RefreshCw, X, Lock } from "lucide-react";

export function GeoLocationModal({ isOpen, onClose, locationData, permissionStatus, onLocateMe, isLoading }) {
    const [isPWA, setIsPWA] = useState(false);

    // States to control smooth mounting/unmounting
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        const checkPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
        setIsPWA(!!checkPWA);
    }, []);

    // 60fps smooth mount/unmount logic
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Double requestAnimationFrame ensures the initial invisible state is painted
            // BEFORE the transition classes are applied, completely eliminating the jerk.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimateIn(true);
                });
            });
        } else {
            setAnimateIn(false);
            // Wait for the transition duration before removing from DOM
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-120 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm transition-opacity duration-300 ease-out ${animateIn ? "opacity-100" : "opacity-0"
                }`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl border border-border/50 transition-all duration-300 ease-out transform ${animateIn ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {permissionStatus === "denied" ? (
                    <div className="text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <h3 className="font-serif text-lg font-medium text-foreground">Enable Location</h3>
                        <p className="mt-1 text-xs text-muted-foreground mb-5">Please update your access settings:</p>

                        {isPWA ? (
                            <div className="space-y-2 text-xs bg-muted/50 p-3 rounded-xl border text-left text-foreground">
                                <div className="flex items-center gap-2.5 py-1">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-foreground text-background font-bold text-[10px]">1</span>
                                    <p>Open device <strong>Settings → Apps</strong></p>
                                </div>
                                <div className="flex items-center gap-2.5 py-1">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-foreground text-background font-bold text-[10px]">2</span>
                                    <p>Select <strong>Nepal Trip</strong> app</p>
                                </div>
                                <div className="flex items-center gap-2.5 py-1">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-white font-bold text-[10px]">3</span>
                                    <p>Turn on <strong>Location Permission</strong></p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 text-xs bg-muted/60 p-3 rounded-xl border text-left text-foreground">
                                <div className="flex items-center gap-2.5 border-b border-border/40 pb-2">
                                    <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                    <p>Click the <strong>Padlock</strong> icon in your URL address bar.</p>
                                </div>
                                <div className="flex items-center justify-between py-1 bg-background/50 px-2 rounded-lg border border-border/30">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                        <span className="font-medium">Location</span>
                                    </div>
                                    <div className="h-4 w-7 rounded-full bg-primary p-0.5 flex justify-end">
                                        <span className="h-3 w-3 rounded-full bg-white shadow-xs" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center mt-1">Toggle the Location slider to <strong>Allowed</strong>.</p>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="mt-5 w-full rounded-xl bg-foreground py-2 text-xs font-semibold text-background hover:opacity-90 active:scale-98 transition-all"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-[#FA6D16]">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <h3 className="font-serif text-lg font-medium text-foreground">Your Verified Location</h3>

                        <div className="my-3 min-h-9 flex items-center justify-center">
                            {isLoading ? (
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs animate-pulse">
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#FA6D16]" /> Syncing tracking array...
                                </div>
                            ) : (
                                <p className="text-base font-bold text-foreground bg-muted/50 px-4 py-1.5 rounded-xl border">
                                    {locationData ? `${locationData.district}, ${locationData.state}` : "Unknown Area"}
                                </p>
                            )}
                        </div>

                        <button
                            disabled={isLoading}
                            onClick={() => onLocateMe(true)}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FA6D16] py-2 text-xs font-semibold text-white hover:bg-[#E55B05] transition-all active:scale-98 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh Location
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}