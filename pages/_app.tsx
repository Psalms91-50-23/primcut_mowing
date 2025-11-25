// pages/_app.tsx
import '../styles/globals.css'  // <-- this is your actual global styles file
import type { AppProps } from 'next/app'
import NavBar from '../components/NavBar'

function PrimCut({ Component, pageProps }: AppProps) {
  return <>
    <NavBar/>
    <Component {...pageProps} />  
  </>
  
}

export default PrimCut