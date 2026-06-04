'use client';

import { createContext, useEffect, useState } from 'react';
import { USER_API } from '@/lib/api';
import { useRouter } from 'next/navigation';

export const AppContext = createContext<{
  currentUser: any;
  setCurrentUser: (user: any) => void;
}>({} as any);

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUserState] = useState<any>(null);
  const router = useRouter();

  // On mount, try to restore the session from the server using a stored token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    fetch(`${USER_API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then((user) => setCurrentUserState(user))
      .catch(() => {
        // Token is expired or invalid — clear it
        localStorage.removeItem('authToken');
        router.push('/signin');
      });
  }, []);

  const setCurrentUser = (user: any) => {
    setCurrentUserState(user);
    // token is stored separately; clearing user on logout does not need to touch the token here
    // — callers that log out should also call localStorage.removeItem('authToken')
  };

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}
