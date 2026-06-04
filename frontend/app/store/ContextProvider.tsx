'use client';

import { createContext, useEffect, useState } from 'react';

export const AppContext = createContext<{
  currentUser: any;
  setCurrentUser: (user: any) => void;
}>({} as any);

export default function ContextProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState(null);
  
  const contextValue = {
    currentUser,
    setCurrentUser,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}