import React, { useState, useEffect } from "react";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";

export default function About() {
    const [settings, setSettings] = useState({
        brand_name: "Wanderlust Travels",
        about_title: "About us",
        about_body: "We are a passionate team of travel curators helping thousands of travelers discover the world since 2015.",
    });

    useEffect(() => {
        // fetch('/api/settings').then(res => res.json()).then(setSettings);
    }, []);

    return (
        <div className="min-h-screen">
            <Header brand={settings.brand_name} />
            <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
                <p className="font-serif text-sm uppercase tracking-widest text-accent">Who we are</p>
                <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{settings.about_title}</h1>
                <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
                    {settings.about_body}
                </p>
                <div className="mt-12 grid gap-8 sm:grid-cols-3">
                    {[
                        { n: "5000+", l: "happy travelers" },
                        { n: "40+", l: "destinations" },
                        { n: "9 yrs", l: "of craft" },
                    ].map((s) => (
                        <div key={s.l}>
                            <div className="font-serif text-3xl text-primary">{s.n}</div>
                            <div className="text-sm text-muted-foreground">{s.l}</div>
                        </div>
                    ))}
                </div>
            </section>
            <Footer settings={settings} />
        </div>
    );
}