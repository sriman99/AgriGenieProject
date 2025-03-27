'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export default function NotFound() {
  const { user } = useAuth();
  
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-24 bg-gray-50">
      <div className="flex flex-col items-center max-w-md text-center">
        <h1 className="text-9xl font-bold text-green-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex flex-col mt-8 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              Return Home
            </Button>
          </Link>
          {user && (
            <Link href="/dashboard">
              <Button variant="outline" className="border-green-600 text-green-600">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 