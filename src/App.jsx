import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/site/Navbar';
import { Footer } from './components/site/Footer';
import { AdminLayout } from './components/admin/AdminLayout'; // Adjust path as needed
import './App.css';
import RegisteredUsers from './pages/Admin/RegisteredUsers';

// ==========================================
// 1. Lazy Load Public Pages
// ==========================================
const Home = lazy(() => import('./pages/User/Home'));
const About = lazy(() => import('./pages/User/About'));
const Contact = lazy(() => import('./pages/User/Contact'));
const Packages = lazy(() => import('./pages/User/Packages'));
const PackageDetail = lazy(() => import('./pages/User/PackageDetail'));
const Testimonials = lazy(() => import('./pages/User/Testimonials'));
const Gallery = lazy(() => import('./pages/User/Gallery'));
const Discover = lazy(() => import('./pages/User/Discover'));

// ==========================================
// 2. Lazy Load Admin Pages
// ==========================================
const AdminAnalytics = lazy(() => import('./pages/Admin/AdminAnalytics'));
const InquiryDesk = lazy(() => import('./pages/Admin/InquiryDesk'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));
// ==========================================
// 3. Global Scroll To Top
// ==========================================
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// ==========================================
// 4. Fallback Loader
// ==========================================
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#FDFBF7]">
    <div className="font-serif text-xl text-muted-foreground animate-pulse">Loading...</div>
  </div>
);

// ==========================================
// 5. Global Public Layout (Using Outlet)
// ==========================================
function PublicLayout() {
  const [settings] = useState({
    brand_name: "Nepal Trip",
    tagline: "CURATED JOURNEYS, UNFORGETTABLE MEMORIES",
    contact_email: "ankitpandey78600@gmail.com",
    contact_phone: "+91 8318538918",
    contact_address: "721/1 Sri Ram Nagar Civil Line 1 Sultanpur"
  });

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-[#FDFBF7] to-[#EAE9E6] text-foreground">
      <Navbar brand={settings.brand_name} />
      <main className="flex-1 animate-in fade-in duration-700">
        <Outlet /> {/* Child routes render here */}
      </main>
      <Footer settings={settings} />
    </div>
  );
}

// ==========================================
// 6. Main App Component
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" richColors />

      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* --- PUBLIC ROUTES --- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:slug" element={<PackageDetail />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/discover" element={<Discover />} />
          </Route>

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* The "index" route maps to exactly "/admin" */}
            <Route index element={<AdminAnalytics />} />
            <Route path="users" element={<RegisteredUsers />} />
            <Route path="inquiries" element={<InquiryDesk />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* --- 404 NOT FOUND --- */}
          <Route path="*" element={
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FDFBF7] font-serif text-2xl text-foreground">
              404 - Page Not Found
            </div>
          } />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;