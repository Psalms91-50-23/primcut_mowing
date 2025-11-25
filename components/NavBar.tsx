import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery ";

const NavBar =  () => {
  
    const isMobile = useMediaQuery("(max-width: 510px)");
    const [menuOpen, setMenuOpen] = useState(false);
    return (
    <>
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center p-6 bg-green-500 text-white z-50 shadow-md">
        <h1 className="font-bold text-xl">PrimCut Mowing</h1>
        {!isMobile && (
          <ul className="flex flex-row space-x-6 text-base">
            <li className="font-bold"><Link href="/">Home</Link></li>
            <li className="font-bold"><Link href="/about">About</Link></li>
            <li className="font-bold"><Link href="/services">Services</Link></li>
            <li className="font-bold"><Link href="/contact">Contact</Link></li>
          </ul>
        )}
        {isMobile && (
          <button onClick={() => setMenuOpen(true)} className="text-white text-3xl">
            ☰
          </button>
        )}
        <div
          className={`
            fixed top-0 left-0 h-full w-2/3 max-w-[250px] bg-green-500 text-white 
            transform transition-transform duration-300 z-50
            ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex justify-between items-center p-4 border-b border-green-600">
            <div className="flex flex-col">
              <h1 className="font-bold text-xl">PrimCut Mowing</h1>
              <h2 className="text-xl font-bold">Menu</h2>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-3xl leading-none"
            >
              ✕
            </button>
          </div>
          <ul className="flex flex-col p-4 space-y-4 text-lg">
            <li onClick={() => setMenuOpen(false)} className="font-bold"><Link href="/">Home</Link></li>
            <li onClick={() => setMenuOpen(false)} className="font-bold"><Link href="/about">About</Link></li>
            <li onClick={() => setMenuOpen(false)} className="font-bold"><Link href="/services">Services</Link></li>
            <li onClick={() => setMenuOpen(false)} className="font-bold"><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
  

export default NavBar