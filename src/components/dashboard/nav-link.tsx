'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function NavLink({ href, children, icon, className }: NavLinkProps) {
  const pathname = usePathname();
  
  // Check if the current path matches the link
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
        isActive 
          ? 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800'
          : 'text-muted-foreground hover:bg-gray-100',
        className
      )}
    >
      {icon && (
        <span className={cn('h-4 w-4', isActive ? 'text-green-600' : 'text-gray-500')}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </Link>
  );
} 