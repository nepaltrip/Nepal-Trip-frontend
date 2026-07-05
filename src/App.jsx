import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

// ==========================================
// 1. Lazy Load Public Pages
// ==========================================
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Packages = lazy(() => import('./pages/Packages'));
const PackageDetail = lazy(() => import('./pages/PackageDetail'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Auth = lazy(() => import('./pages/Auth'));

// ==========================================
// 2. Lazy Load Admin Pages
// ==========================================
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPackages = lazy(() => import('./pages/admin/AdminPackages'));
const AdminPackageEdit = lazy(() => import('./pages/admin/AdminPackageEdit'));
const Inquiries = lazy(() => import('./pages/admin/Inquiries'));
const Messages = lazy(() => import('./pages/admin/Messages'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));
const Users = lazy(() => import('./pages/admin/Users'));

// ==========================================
// 3. Fallback Loader (Shows while chunks download)
// ==========================================
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="font-serif text-xl text-muted-foreground animate-pulse">Loading...</div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Global Toaster for Notifications */}
      <Toaster position="top-center" richColors />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ----------------------------- */}
          {/* PUBLIC ROUTES                 */}
          {/* ----------------------------- */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:slug" element={<PackageDetail />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/auth" element={<Auth />} />

          {/* ----------------------------- */}
          {/* ADMIN ROUTES (Nested)         */}
          {/* ----------------------------- */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* The "index" route loads at exactly "/admin" */}
            <Route index element={<AdminDashboard />} />

            {/* Sub-routes load inside the Outlet in AdminLayout */}
            <Route path="packages" element={<AdminPackages />} />
            <Route path="packages/:id" element={<AdminPackageEdit />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="users" element={<Users />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={
            <div className="flex h-screen items-center justify-center font-serif text-2xl">
              404 - Page Not Found
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;