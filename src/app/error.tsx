'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-24 bg-gray-50">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="mt-2 text-gray-600">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <div className="flex flex-col mt-8 space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button onClick={reset} className="bg-green-600 hover:bg-green-700">
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="border-green-600 text-green-600">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 