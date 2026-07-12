import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar } from './components/site/Navbar';
import { Footer } from './components/site/Footer';
import { AdminLayout } from './components/admin/AdminLayout';
import './App.css';
import RegisteredUsers from './pages/Admin/RegisteredUsers';
import { SuperAdminLayout } from './components/superadmin/SuperAdminLayout';

import { useDispatch, useSelector } from 'react-redux'; // ✨ Added useSelector
import { setCredentials, logOutState } from './store/slices/authSlice';
import { setUploadJob } from './store/slices/uploadSlice';
import FloatingUploadManager from './components/Gallery/FloatingUploadManager';
import api from './api/axios';

// PWA Virtual Register Hook
import { useRegisterSW } from 'virtual:pwa-register/react';

// ==========================================
// Web Push Utility
// ==========================================
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// ==========================================
// Lazy Load Public Pages
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
// Lazy Load Admin Pages
// ==========================================
const AdminAnalytics = lazy(() => import('./pages/Admin/AdminAnalytics'));
const InquiryDesk = lazy(() => import('./pages/Admin/InquiryDesk'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));

// ==========================================
// Lazy Load Super Admin Pages
// ==========================================
const SuperAdminAnalytics = lazy(() => import('./pages/SuperAdmin/SuperAdminAnalytics'));
const SuperAdminInquiries = lazy(() => import('./pages/SuperAdmin/SuperAdminInquiries'));
const SuperAdminUsers = lazy(() => import('./pages/SuperAdmin/SuperAdminUsers'));
const SuperAdminSettings = lazy(() => import('./pages/SuperAdmin/SuperAdminSettings'));

// ==========================================
// Global Scroll To Top
// ==========================================
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// ==========================================
// PWA Update Notification Component
// ==========================================
function UpdateNotification() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-100 bg-white p-4 rounded-xl shadow-xl border border-border/40 flex items-center gap-4">
      <span className="text-sm font-semibold text-slate-800">New version available!</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-[#2A5244] hover:bg-[#1f3f34] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
      >
        Reload
      </button>
    </div>
  );
}

// ==========================================
// Fallback Loader
// ==========================================
const PageLoader = () => (
  <div className="fixed inset-0 z-100 flex h-screen w-full flex-col items-center justify-center bg-[#FDFBF7]">
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center h-32 w-32 md:h-40 md:w-40 rounded-full bg-linear-to-r from-slate-300 via-slate-100 to-slate-300 bg-size-[400%_100%] animate-[shimmer_1.5s_infinite_linear]">
        <div className="flex items-center justify-center h-[calc(100%-12px)] w-[calc(100%-12px)] rounded-full bg-[#FDFBF7]">
          <span className="text-6xl md:text-7xl font-sans font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-slate-300 via-slate-100 to-slate-300 bg-size-[400%_100%] animate-[shimmer_1.5s_infinite_linear]">
            N
          </span>
        </div>
      </div>
      <div>
        <span className="text-sm md:text-base font-sans font-extrabold tracking-[0.3em] uppercase text-transparent bg-clip-text bg-linear-to-r from-slate-300 via-slate-100 to-slate-300 bg-size-[400%_100%] animate-[shimmer_1.5s_infinite_linear]">
          Nepal Trip
        </span>
      </div>
    </div>
  </div>
);

// ==========================================
// Global Public Layout
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
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer settings={settings} />
      </div>
    </div>
  );
}

// ==========================================
// Main App Component
// ==========================================
function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth); // ✨ Pull auth state
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const verifyUserSession = async () => {
      try {
        const { data } = await api.post('/auth/refresh-token');
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      } catch (error) {
        dispatch(logOutState());
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyUserSession();
  }, [dispatch]);

  useEffect(() => {
    // Fire the traffic metric exactly ONCE per hard app load
    const logTrafficHit = async () => {
      try {
        // ✨ 1. Check if this browser already has a permanent ID
        let visitorId = localStorage.getItem('nt_visitor_id');

        // ✨ 2. If not, generate one and save it forever
        if (!visitorId) {
          visitorId = window.crypto?.randomUUID ? window.crypto.randomUUID() : `v_${Date.now()}_${Math.random()}`;
          localStorage.setItem('nt_visitor_id', visitorId);
        }

        // ✨ 3. Send that exact ID to the backend
        await api.post('/analytics/hit', { visitorId });
      } catch (err) {
        console.error("Traffic log failed", err);
      }
    };

    logTrafficHit();
  }, []);

  // ✨ Web Push Subscription Logic
  useEffect(() => {
    const subscribeToWebPush = async () => {
      // Run only if logged in and browser supports Service Workers
      if (isAuthenticated && 'serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;

          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) return;

          // Ensure permissions are granted before subscribing
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;

          const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });

          await api.post('/notifications/subscribe-push', subscription);

        } catch (error) {
          console.error('Web Push Subscription Failed:', error);
        }
      }
    };

    subscribeToWebPush();
  }, [isAuthenticated]);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <UpdateNotification />

      <FloatingUploadManager />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        closeButton={false}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
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
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminAnalytics />} />
            <Route path="users" element={<RegisteredUsers />} />
            <Route path="inquiries" element={<InquiryDesk />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminAnalytics />} />
            <Route path="inquiries" element={<SuperAdminInquiries />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>
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