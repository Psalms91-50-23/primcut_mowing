// pages/_app.tsx
import '../styles/globals.css'  // <-- this is your actual global styles file
import type { AppProps } from 'next/app'

function PrimCut({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />  // renders the current page
}

export default PrimCut