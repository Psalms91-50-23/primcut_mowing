import type { NextPage } from "next";
import Link from "next/link";

const NavBar =  () => (
  <nav className="flex w-full justify-between items-center p-4 bg-green-700 text-white">
    <h1 className="font-bold text-xl title">PrimCut Mowing</h1>
    <ul className="flex flex-row space-x-4 list-none text-base xs:text-sm font-size-change">
      <li className="nav-link"><Link href="/">Home</Link></li>
      <li className="nav-link"><Link href="/about">About</Link></li>
      <li className="nav-link"><Link href="/services">Services</Link></li>
      <li className="nav-link"><Link href="/pricing">Pricing</Link></li>
      <li className="nav-link"><Link href="/contact">Contact</Link></li>
    </ul>

  </nav>
);

export default NavBar