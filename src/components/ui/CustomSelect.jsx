import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({
    name,
    options,
    placeholder = "Select an option...",
    required,
    value,
    onChange,
    theme = "orange" // Dynamic Theme Prop
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSelected, setInternalSelected] = useState("");
    const [dropDirection, setDropDirection] = useState("down");

    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    const isControlled = value !== undefined && onChange !== undefined;
    const currentValue = isControlled ? value : internalSelected;

    const parsedOptions = Array.isArray(options)
        ? options
        : (typeof options === 'string'
            ? options.split(',').filter(Boolean).map(o => ({ value: o.trim(), label: o.trim() }))
            : []);

    const currentLabel = parsedOptions.find(opt => opt.value === currentValue)?.label || currentValue;

    // Handle outside clicks to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Smart logic to open the dropdown UPWARDS if space below is limited
    const handleToggle = () => {
        if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;

            // If there is less than 160px of space below the trigger, force it to drop UP
            if (spaceBelow < 160) {
                setDropDirection("up");
            } else {
                setDropDirection("down");
            }
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (val) => {
        if (isControlled) {
            onChange({ target: { name, value: val } });
        } else {
            setInternalSelected(val);
        }
        setIsOpen(false);
    };

    // Dynamic Theme Configuration
    const themeConfig = {
        orange: {
            trigger: "bg-background border-input hover:border-primary/50 text-foreground h-10 md:h-12 px-3 md:px-4",
            triggerActive: "border-primary ring-2 ring-primary/20",
            dropdown: "bg-card border-border/50 shadow-xl",
            itemBase: "text-foreground text-sm",
            itemActive: "bg-primary text-white font-bold",
            itemHover: "hover:bg-primary/10 hover:text-primary",
            icon: "text-muted-foreground",
            scrollbar: "scrollbar-thumb-primary/50"
        },
        emerald: {
            // Made the trigger ultra-compact to fit your newly sized God Mode boxes
            trigger: "bg-black/60 border-white/20 hover:border-emerald-500/50 text-white text-[10px] md:text-xs h-7 md:h-8 px-2",
            triggerActive: "border-emerald-500 ring-1 ring-emerald-500/50",
            dropdown: "bg-[#1a1a1a] border-white/20 shadow-2xl",
            itemBase: "text-white/90 text-[10px] md:text-xs",
            itemActive: "bg-emerald-600 text-white font-bold",
            itemHover: "hover:bg-emerald-500/20 hover:text-emerald-400",
            icon: "text-white/70",
            scrollbar: "scrollbar-thumb-emerald-500/50"
        }
    };

    const activeTheme = themeConfig[theme] || themeConfig.orange;

    // Dynamic positioning classes based on viewport calculations
    const dropClass = dropDirection === 'up'
        ? "bottom-[calc(100%+4px)] origin-bottom slide-in-from-bottom-2"
        : "top-[calc(100%+4px)] origin-top slide-in-from-top-2";

    return (
        <div className="relative w-full min-w-0" ref={containerRef}>
            <input type="hidden" name={name} value={currentValue} required={required} />

            <div
                ref={triggerRef}
                onClick={handleToggle}
                className={`w-full min-w-0 rounded-lg border flex items-center justify-between cursor-pointer transition-all duration-200 
                ${isOpen ? activeTheme.triggerActive : activeTheme.trigger} 
                ${!currentValue && theme === 'orange' ? "text-muted-foreground" : ""}`}
            >
                <span className="truncate pr-2 flex-1 text-left">{currentLabel || placeholder}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${activeTheme.icon} ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <ul className={`absolute z-9999 w-full ${dropClass} border rounded-xl py-1 animate-in fade-in duration-200 max-h-32 overflow-y-auto ${activeTheme.dropdown} scrollbar-thin scrollbar-track-transparent ${activeTheme.scrollbar}`}>
                    {parsedOptions.map((opt, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelect(opt.value)}
                            className={`px-2 py-1.5 md:px-3 md:py-2 cursor-pointer transition-colors duration-150 truncate ${activeTheme.itemBase} ${currentValue === opt.value
                                ? activeTheme.itemActive
                                : activeTheme.itemHover
                                }`}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}