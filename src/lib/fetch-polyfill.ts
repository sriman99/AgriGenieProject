// This file provides a polyfill for fetch in environments where it's not available
// or to resolve compatibility issues with @supabase/node-fetch

import fetch from 'node-fetch';

// Create a compatible fetch function that works with both node-fetch and browser fetch
const customFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input as any, init as any);
};

// Export the fetch function to be used throughout the application
export { customFetch as fetch };

// If you need to use this in a file, import it like this:
// import { fetch } from '@/lib/fetch-polyfill'; 