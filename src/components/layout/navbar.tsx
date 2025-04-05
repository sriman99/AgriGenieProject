"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force a page refresh after sign out to clear any cached state
      window.location.href = "/auth";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle route change to close mobile menu
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 bg-white shadow-md py-2 mb-3`}
    >
      <div className="container flex items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-green-600">AgriGenie</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="/features" pathname={pathname}>
            Features
          </NavLink>
          <NavLink href="/marketplace" pathname={pathname}>
            Marketplace
          </NavLink>
          <NavLink href="/pricing" pathname={pathname}>
            Pricing
          </NavLink>
          <NavLink href="/community" pathname={pathname}>
            Community
          </NavLink>
          <NavLink href="/blog" pathname={pathname}>
            Blog
          </NavLink>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className={`border-green-600 text-green-600`}
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className={`text-green-600`}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost" className={`text-green-600`}>
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  className={`bg-green-600 hover:bg-green-700 text-white`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="block p-2 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="text-green-600" size={24} />
          ) : (
            <Menu className="text-green-600" size={24} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-30 md:hidden bg-white shadow-md">
          <nav className="flex flex-col w-full p-4 space-y-4">
            <MobileNavLink href="/features">Features</MobileNavLink>
            <MobileNavLink href="/marketplace">Marketplace</MobileNavLink>
            <MobileNavLink href="/pricing">Pricing</MobileNavLink>
            <MobileNavLink href="/blog">Blog</MobileNavLink>

            <div className="pt-4 mt-4 border-t border-gray-200">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-lg font-medium text-gray-900 hover:text-green-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block py-2 text-lg font-medium text-gray-900 hover:text-green-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block py-2 text-lg font-medium text-gray-900 hover:text-green-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block py-2 mt-2 text-lg font-medium text-center text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// Desktop NavLink Component
function NavLink({
  href,
  children,
  pathname,
}: {
  href: string;
  children: React.ReactNode;
  pathname: string;
}) {
  const isActive = pathname === href;
  
  // Determine the actual href based on current path
  const actualHref = href === "/features" && pathname === "/" ? "#features" : href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if the href is an anchor link (starts with #)
    if (actualHref.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(actualHref);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <Link
      href={actualHref}
      onClick={handleClick}
      className={`font-medium transition-colors ${
        isActive ? "text-green-600" : "text-green-600"
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile NavLink Component
function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  // Determine the actual href based on current path
  const actualHref = href === "/features" && pathname === "/" ? "#features" : href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (actualHref.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(actualHref);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <Link
      href={actualHref}
      onClick={handleClick}
      className={`block py-2 text-lg font-medium ${
        isActive ? "text-green-600" : "text-gray-900 hover:text-green-600"
      }`}
    >
      {children}
    </Link>
  );
}
