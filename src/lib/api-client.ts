/**
 * Utility for making authenticated API requests
 */
import { refreshAuthToken } from './auth-helpers';

type FetchOptions = RequestInit & {
  body?: any;
};

/**
 * Makes an authenticated API request to the server
 * @param url The URL to call
 * @param options Request options
 * @returns The fetch response
 */
export async function fetchAPI(url: string, options: FetchOptions = {}): Promise<Response> {
  // Try to refresh the token before making the request if needed
  await refreshAuthToken();
  
  // Ensure we're using credentials for authentication
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Merge the default options with the provided options
  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Convert body to JSON string if it's an object
  if (mergedOptions.body && typeof mergedOptions.body === 'object') {
    mergedOptions.body = JSON.stringify(mergedOptions.body);
  }
  
  console.log(`API Request: ${options.method || 'GET'} ${url}`);

  // Make the fetch request
  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    console.error(`API Error (${response.status}): ${url}`);
    
    // If unauthorized, try refreshing token and retry once
    if (response.status === 401) {
      console.log('Unauthorized response, attempting to refresh token and retry');
      const refreshed = await refreshAuthToken();
      
      if (refreshed) {
        console.log('Token refreshed, retrying request');
        return fetch(url, mergedOptions);
      }
    }
  }
  
  return response;
}

/**
 * Makes a GET request to the API
 * @param url The URL to call
 * @param options Request options
 * @returns The response data
 */
export async function get<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetchAPI(url, {
    method: 'GET',
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch from ${url}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If we can't parse the JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Makes a POST request to the API
 * @param url The URL to call
 * @param data The data to send
 * @param options Request options
 * @returns The response data
 */
export async function post<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
  const response = await fetchAPI(url, {
    method: 'POST',
    body: data,
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Failed to submit to ${url}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If we can't parse the JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Makes a PUT request to the API
 * @param url The URL to call
 * @param data The data to send
 * @param options Request options
 * @returns The response data
 */
export async function put<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
  const response = await fetchAPI(url, {
    method: 'PUT',
    body: data,
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Failed to update ${url}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If we can't parse the JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Makes a DELETE request to the API
 * @param url The URL to call
 * @param options Request options
 * @returns The response data
 */
export async function del<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetchAPI(url, {
    method: 'DELETE',
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete ${url}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If we can't parse the JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
} 