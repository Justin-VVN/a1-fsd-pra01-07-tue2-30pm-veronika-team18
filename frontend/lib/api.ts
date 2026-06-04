export const USER_API = process.env.NEXT_PUBLIC_USER_API || 'http://localhost:3002/api';
export const VENUE_API = process.env.NEXT_PUBLIC_VENUE_API || 'http://localhost:3002/api';
export const BOOKING_API = process.env.NEXT_PUBLIC_BOOKING_API || 'http://localhost:3002/api';
export const REVIEW_API = process.env.NEXT_PUBLIC_REVIEW_API || 'http://localhost:3002/api';

export async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${body}`);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}
