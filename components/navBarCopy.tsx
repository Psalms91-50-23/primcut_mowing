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

  const displayName =
    user?.first_name
      ? formatFullName(user.first_name, user.last_name) || ""
      : user?.email || "Account";

  const dropdownRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    console.log("Logging out...");
    await logout();
    console.log("User after logout:", user);
    setDropdownOpen(false);
    router.push("/auth");
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      const first = user.first_name.charAt(0);
      const last = user.last_name.charAt(0);
      return `${first}${last}`.toUpperCase();
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "";
  };

  const initials = getInitials();
  // ---------------------------
  // Click outside listener
  // ---------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close dropdown if click outside dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }

      // Close mobile menu if click outside menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 flex w-full justify-between items-center p-6 bg-green-900 text-white z-50 shadow-md max-w-[1600px]">
        <h1 className="font-bold text-xl">PrimCut</h1>

        {!isMobile && (
          <ul className="flex flex-row items-center space-x-6 text-base md:space-x-10">
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
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 hover:cursor-pointer "
              >
                {/* Initials circle */}
                <div className="
                  flex items-center justify-center
                  w-9 h-9
                  rounded-full
                  border-2 border-white
                  bg-green-900
                  text-white
                  font-bold
                  text-sm
                  hover:scale-110 transition ease-in-out duration-350
                ">
                  {initials}
                </div>
                <span className="text-sm">▼</span>
              </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-xl shadow-lg p-3">
                    <Link href="/dashboard">
                      <p className="p-2 hover:bg-slate-100 rounded-lg hover:cursor-pointer">
                        Dashboard
                      </p>
                    </Link>
                    <button
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

        {isMobile && (
          <button onClick={() => setMenuOpen(true)} className="text-white text-3xl">
            ☰
          </button>
        )}

        <div
          ref={mobileMenuRef}
          className={`fixed top-0 left-0 h-full w-full max-w-[250px] bg-green-900 text-white 
            transform transition-transform duration-300 z-50
            ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex justify-between items-center p-4 border-b border-green-600">
            <div className="flex flex-col">
              <h1 className="font-bold text-xl">PrimCut</h1>
              <h2 className="text-xl font-bold">Menu</h2>
            </div>
            <button onClick={() => setMenuOpen(false)} className="text-3xl leading-none">
              ✕
            </button>
          </div>

          <ul className="flex flex-col p-4 space-y-4 text-lg">
            <li onClick={() => setMenuOpen(false)} className="font-bold">
              <Link href="/">Home</Link>
            </li>
            <li onClick={() => setMenuOpen(false)} className="font-bold">
              <Link href="/about">About</Link>
            </li>
            <li onClick={() => setMenuOpen(false)} className="font-bold">
              <Link href="/services">Services</Link>
            </li>
            <li onClick={() => setMenuOpen(false)} className="font-bold">
              <Link href="/contact">Contact</Link>
            </li>

            {!user && (
              <li className="font-bold" onClick={() => setMenuOpen(false)}>
                <Link href="/auth">Account</Link>
              </li>
            )}
            { user && (
              <li ref={dropdownRef} className="relative font-bold">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 hover:cursor-pointer "
                >
                  {/* Initials circle */}
                  <div className="
                    flex items-center justify-center
                    w-9 h-9
                    rounded-full
                    border-2 border-white
                    bg-green-900
                    text-white
                    font-bold
                    text-sm
                    hover:scale-110 transition ease-in-out duration-350
                  ">
                    {initials}
                  </div>
                  <span className="text-sm">▼</span>
                </button>
                { dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-xl shadow-lg p-3">
                    {/* Use roleRedirectMap for dashboard link */}
                    <Link href={roleRedirectMap[user.role || "customer"]}>
                      <p className="p-2 hover:bg-slate-100 rounded-lg hover:cursor-pointer">
                        Dashboard
                      </p>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2 hover:bg-slate-100 rounded-lg hover:cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            )}
            {user && (
              <>
                <li className="font-bold" onClick={() => setMenuOpen(false)}>
                  <Link href="/dashboard">Dashboard</Link>
                </li>
                <li className="font-bold">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
