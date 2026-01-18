// pages/_app.tsx
import '../styles/globals.css'  // <-- this is your actual global styles file
import type { AppProps } from 'next/app'
import NavBar from '../components/NavBar'

function PrimCut({ Component, pageProps }: AppProps) {
   return <div className='w-full max-w-[1600px] mx-auto'>
      <NavBar/>
      <Component {...pageProps} />  
  </div>
  
}

export default PrimCut