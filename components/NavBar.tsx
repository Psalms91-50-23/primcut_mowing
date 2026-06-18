import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery";
import { useAuth, roleRedirectMap } from "../context/AuthContext";

const NavBar = () => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 510px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user, logout } = useAuth();

  const dropdownRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const handleLogout = async () => {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }

      const clickedInsideMobileMenu =
        mobileMenuRef.current && mobileMenuRef.current.contains(target);

      const clickedMobileButton =
        mobileButtonRef.current && mobileButtonRef.current.contains(target);

      if (!clickedInsideMobileMenu && !clickedMobileButton) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    const setNavHeight = () => {
      const height = navRef.current!.offsetHeight;
      document.documentElement.style.setProperty("--nav-height", `${height}px`);
    };

    setNavHeight();
    window.addEventListener("resize", setNavHeight);

    return () => window.removeEventListener("resize", setNavHeight);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <nav
          ref={navRef}
          className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 text-white bg-green-900"
        >
          <div className="min-w-0 flex-1">
            <h1 className="m-0 flex min-w-0 items-center p-0 font-bold leading-none">
              <span className="m-0 shrink-0 p-0 text-2xl sm:text-3xl">H</span>
              <img
                src="/images/happy-house-1.png"
                alt="Happy property house"
                className="block h-9 w-10 shrink-0 sm:h-12 sm:w-14 sm:pl-1"
              />
              <span className="truncate text-xl sm:text-3xl">ppy Property</span>
            </h1>
          </div>

          {!isMobile && (
            <ul className="ml-6 flex flex-row items-center space-x-5 text-base md:space-x-10">
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
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-green-900 text-sm font-bold text-white transition duration-300 ease-in-out hover:scale-110"
                      onClick={() =>
                        router.push(roleRedirectMap[user.role || "customer"])
                      }
                    >
                      {initials}
                    </div>
                    <span className="text-sm">▼</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl bg-white p-3 text-black shadow-lg">
                      <Link href={roleRedirectMap[user.role || "customer"]}>
                        <p className="rounded-lg p-2 hover:cursor-pointer hover:bg-slate-100">
                          Dashboard
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg p-2 text-left hover:cursor-pointer hover:bg-slate-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              )}
            </ul>
          )}

          {isMobile && (
            <button
              ref={mobileButtonRef}
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-transparent transition duration-300 hover:cursor-pointer hover:bg-green-800/70"
            >
              <span className="relative block h-6 w-7">
                <span
                  className={`absolute left-0 block h-[3px] w-7 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    menuOpen ? "top-[10px] rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[10px] block h-[3px] w-7 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[3px] w-7 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    menuOpen ? "top-[10px] -rotate-45" : "top-[20px]"
                  }`}
                />
              </span>
            </button>
          )}
        </nav>
      </div>

      {isMobile && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
              menuOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            onClick={() => setMenuOpen(false)}
          />

          <div
            ref={mobileMenuRef}
            className={`fixed top-0 left-0 z-[60] h-full w-full max-w-[340px] bg-green-900 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="border-b border-green-700 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="m-0 flex min-w-0 items-center p-0 font-bold leading-none">
                    <span className="m-0 shrink-0 p-0 text-2xl">H</span>
                    <img
                      src="/images/happy-house-1.png"
                      alt="Happy Property Logo"
                      className="ml-1 inline-block h-10 w-10 shrink-0"
                    />
                    <span className="truncate text-2xl">ppy Property</span>
                  </h1>
                  <h2 className="pt-5 text-xl font-bold">Menu</h2>
                </div>

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-300 hover:cursor-pointer hover:bg-green-800/70"
                >
                  <span className="relative block h-6 w-7">
                    <span className="absolute left-0 top-[10px] block h-[3px] w-7 rotate-45 rounded-full bg-white" />
                    <span className="absolute left-0 top-[10px] block h-[3px] w-7 -rotate-45 rounded-full bg-white" />
                  </span>
                </button>
              </div>
            </div>

            <ul className="flex flex-col space-y-2 p-4 text-lg">
              <li className="rounded-xl font-bold transition hover:bg-green-800">
                <Link
                  href="/"
                  className="block w-full px-4 py-3"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
              </li>

              <li className="rounded-xl font-bold transition hover:bg-green-800">
                <Link
                  href="/about"
                  className="block w-full px-4 py-3"
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </Link>
              </li>

              <li className="rounded-xl font-bold transition hover:bg-green-800">
                <Link
                  href="/services"
                  className="block w-full px-4 py-3"
                  onClick={() => setMenuOpen(false)}
                >
                  Services
                </Link>
              </li>

              <li className="rounded-xl font-bold transition hover:bg-green-800">
                <Link
                  href="/contact"
                  className="block w-full px-4 py-3"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>

              {!user && (
                <li className="rounded-xl font-bold transition hover:bg-green-800">
                  <Link
                    href="/auth"
                    className="block w-full px-4 py-3"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                </li>
              )}

              {user && (
                <>
                  <li className="rounded-xl font-bold transition hover:bg-green-800">
                    <Link
                      href={roleRedirectMap[user.role || "customer"]}
                      className="block w-full px-4 py-3"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>

                  <li className="rounded-xl font-bold transition hover:bg-green-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-3 text-left hover:cursor-pointer"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;