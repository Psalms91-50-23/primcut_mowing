// pages/_app.tsx
import '../styles/globals.css'  // <-- this is your actual global styles file
import type { AppProps } from 'next/app'
import { useEffect } from "react";
import NavBar from '../components/NavBar'
import { AuthProvider } from '../context/AuthContext'
import { Toaster } from "react-hot-toast";
import { setupShadowDOMStyling } from "../lib/gmpShadowStyling";
import Script from "next/script";

function PrimCut({ Component, pageProps }: AppProps) {
   useEffect(() => {
    setupShadowDOMStyling();
  }, []);
  
  return (
    <AuthProvider>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}`}
        strategy="beforeInteractive"
      />

      <div className="flex justify-center">
        <NavBar />
        <div className="w-full max-w-[1600px] mx-auto py-15">
          <Component {...pageProps} />
        </div>
      </div>
      <Toaster
      position="top-center" toastOptions={{duration: 5000}}
    />
    </AuthProvider>
  )
}

export default PrimCut