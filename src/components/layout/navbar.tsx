'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle route change to close mobile menu
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className={`text-2xl font-bold ${isScrolled || pathname !== '/' ? 'text-green-600' : 'text-white'}`}>
            AgriGenie
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="/features" isScrolled={isScrolled} pathname={pathname}>
            Features
          </NavLink>
          <NavLink href="/marketplace" isScrolled={isScrolled} pathname={pathname}>
            Marketplace
          </NavLink>
          <NavLink href="/pricing" isScrolled={isScrolled} pathname={pathname}>
            Pricing
          </NavLink>
          <NavLink href="/blog" isScrolled={isScrolled} pathname={pathname}>
            Blog
          </NavLink>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className={`border-green-600 ${isScrolled || pathname !== '/' ? 'text-green-600' : 'text-white border-white hover:text-green-600'}`}>
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => signOut()}
                variant="ghost"
                className={isScrolled || pathname !== '/' ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className={isScrolled || pathname !== '/' ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200'}>
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className={isScrolled || pathname !== '/' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white text-green-600 hover:bg-gray-100'}>
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
            <X className={isScrolled || pathname !== '/' ? 'text-gray-900' : 'text-white'} size={24} />
          ) : (
            <Menu className={isScrolled || pathname !== '/' ? 'text-gray-900' : 'text-white'} size={24} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden pt-16 bg-white">
          <nav className="flex flex-col w-full p-4 space-y-4">
            <MobileNavLink href="/features">Features</MobileNavLink>
            <MobileNavLink href="/marketplace">Marketplace</MobileNavLink>
            <MobileNavLink href="/pricing">Pricing</MobileNavLink>
            <MobileNavLink href="/blog">Blog</MobileNavLink>
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              {user ? (
                <>
                  <Link href="/dashboard" className="block py-2 text-lg font-medium text-gray-900 hover:text-green-600">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block py-2 text-lg font-medium text-gray-900 hover:text-green-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block py-2 text-lg font-medium text-gray-900 hover:text-green-600">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="block py-2 mt-2 text-lg font-medium text-center text-white bg-green-600 rounded-md hover:bg-green-700">
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
function NavLink({ href, children, isScrolled, pathname }: { href: string; children: React.ReactNode; isScrolled: boolean; pathname: string }) {
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={`font-medium transition-colors ${
        isActive
          ? 'text-green-600'
          : isScrolled || pathname !== '/'
          ? 'text-gray-700 hover:text-gray-900'
          : 'text-white hover:text-gray-200'
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile NavLink Component
function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={`block py-2 text-lg font-medium ${
        isActive ? 'text-green-600' : 'text-gray-900 hover:text-green-600'
      }`}
    >
      {children}
    </Link>
  );
} 