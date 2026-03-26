import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery";
import { useAuth, roleRedirectMap } from "../context/AuthContext";
import { formatFullName } from "../utils/utils";

const NavBar = () => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 510px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user, logout } = useAuth();

  const dropdownRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const handleLogout = async () => {
    console.log("Logging out...");
    await logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/auth");
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "";
  };

  const initials = getInitials();

  // ---------------------------
  // Click outside listener
  // ---------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setDropdownOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    const setNavHeight = () => {
      const height = navRef.current!.offsetHeight;
      document.documentElement.style.setProperty(
        "--nav-height",
        `${height}px`
      );
    };

    setNavHeight();
    window.addEventListener("resize", setNavHeight);

    return () => window.removeEventListener("resize", setNavHeight);
  }, []);

  return (
    <nav className="fixed top-0 flex w-full justify-between items-center p-4 bg-green-900 text-white z-50 shadow-md max-w-[1600px]"
    ref={navRef}
    >
      <h1 className="flex font-bold text-xl m-0 p-0 items-center"><span className="text-3xl m-0 p-0 translate-x-2">H</span>
          <img src="/images/happy-house-1.png" alt="Happy property house" className="block w-14 h-12 pl-2" />
        {/* <span className="font-bold text-3xl m-0 p-0 ">
        </span> */}
        <span className="font-bold text-3xl m-0 p-0">ppy Property</span></h1>

      {/* Desktop Menu */}
      {!isMobile && (
        <ul className="flex flex-row items-center space-x-5 text-base md:space-x-10">
          <li className="font-bold enlarge">
            <Link href="/">Home</Link>
          </li>
          <li className="font-bold enlarge">
            <Link href="/about">About</Link>
          </li>
          <li className="font-bold enlarge">
            <Link href="/services">Services</Link>
          </li>
          <li className="font-bold enlarge">
            <Link href="/contact">Contact</Link>
          </li>

          {!user && (
            <li className="font-bold enlarge hover:cursor-pointer">
              <Link href="/auth">Account</Link>
            </li>
          )}

          {user && (
            <li ref={dropdownRef} className="relative font-bold">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 hover:cursor-pointer"
              >
                <div 
                  className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-white bg-green-900 text-white font-bold text-sm hover:scale-110 transition ease-in-out duration-350"
                  onClick={() =>
                    router.push(roleRedirectMap[user.role || "customer"])
                  }>
                  {initials}
                </div>
                <span className="text-sm">▼</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-xl shadow-lg p-3 z-50">
                  <Link href={roleRedirectMap[user.role || "customer"]}>
                    <p className="p-2 hover:bg-slate-100 rounded-lg hover:cursor-pointer">
                      Dashboard
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left p-2 hover:bg-slate-100 rounded-lg hover:cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <button type="button" onClick={() => setMenuOpen(true)} className="text-white text-3xl hover:cursor-pointer">
          ☰
        </button>
      )}

      {/* Mobile Slide Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 left-0 h-full w-full max-w-[340px] bg-green-900 text-white transform transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-green-600">
          <div className="flex flex-col">
            <h1 className="flex font-bold text-xl m-0 p-0 items-center"><span className="text-2xl m-0 p-0 translate-x-2">H</span><span className="font-bold text-2xl m-0 p-0 "><img src="/images/happy-house-1.png" alt="Happy Property Logo" className="w-12 h-12 inline-block ml-2" /></span><span className="font-bold text-2xl m-0 p-0">ppy Property</span></h1>
            <h2 className="text-xl font-bold pt-5">Menu</h2>
          </div>
          <button type="button" onClick={() => setMenuOpen(false)} className="text-3xl leading-none hover:cursor-pointer">
            ✕
          </button>
        </div>

        <ul className="flex flex-col p-4 space-y-4 text-lg">
          <li className="font-bold" onClick={() => setMenuOpen(false)}>
            <Link href="/">Home</Link>
          </li>
          <li className="font-bold" onClick={() => setMenuOpen(false)}>
            <Link href="/about">About</Link>
          </li>
          <li className="font-bold" onClick={() => setMenuOpen(false)}>
            <Link href="/services">Services</Link>
          </li>
          <li className="font-bold" onClick={() => setMenuOpen(false)}>
            <Link href="/contact">Contact</Link>
          </li>

          {!user && (
            <li className="font-bold" onClick={() => setMenuOpen(false)}>
              <Link href="/auth">Account</Link>
            </li>
          )}

          {user && (
            <>
              <li className="font-bold" onClick={() => setMenuOpen(false)}>
                <Link href={roleRedirectMap[user.role || "customer"]}>Dashboard</Link>
              </li>
              <li className="font-bold">
                <button type="button" onClick={handleLogout} className="w-full text-left">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
