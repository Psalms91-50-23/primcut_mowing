// pages/_app.tsx
import '../styles/globals.css'  // <-- this is your actual global styles file
import type { AppProps } from 'next/app'
import { useEffect } from "react";
import NavBar from '../components/NavBar'
import { AuthProvider } from '../context/AuthContext'
import { UIProvider, useUI } from '../context/UIContext'
import { Toaster } from "react-hot-toast";
import { setupShadowDOMStyling } from "../lib/gmpShadowStyling";
import Script from "next/script";

function GlobalImageModal() {
  const { activeImage, closeImage } = useUI();

  if (!activeImage) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
      onClick={closeImage}
    >
      <button
        className="fixed top-4 right-4 text-white text-4xl font-bold cursor-pointer hover:scale-150 transition"
        onClick={closeImage}
      >
        ×
      </button>
      <img
        src={activeImage}
        alt="Full size"
        className="w-auto h-auto
              max-w-[90vw] max-h-[90vh]
              md:w-full md:h-full
              object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function HappyLawns({ Component, pageProps }: AppProps) {
   useEffect(() => {
    setupShadowDOMStyling();
  }, []);
  
  return (
    <AuthProvider>
      <UIProvider>
        <Script
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}`}
            strategy="beforeInteractive"
          />
          <div className="flex justify-center">
            <NavBar />
            <div
              className="w-full max-w-[1600px] mx-auto"
              style={{ paddingTop: "var(--nav-height)" }}
            >
            <main>
                <Component {...pageProps} />
              </main>
            </div>
          </div>
        <Toaster position="top-center" toastOptions={{duration: 5000}} />
        <GlobalImageModal />
      </UIProvider>
    </AuthProvider>
  )
}

export default HappyLawns