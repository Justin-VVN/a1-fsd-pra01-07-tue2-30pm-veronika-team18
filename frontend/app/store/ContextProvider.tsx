'use client';

import { createContext, use, useEffect, useState } from 'react';

export const AppContext = createContext({});

export default function ContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  
  const contextValue = {
    currentUser,
    setCurrentUser,
  };

  useEffect(() => {
    const lsUser = localStorage.getItem('vv_currentUser');
    if (lsUser) {
      const currUser = JSON.parse(lsUser);
      setCurrentUser(currUser);
    }
  }, []);

  return <AppContext value={contextValue}>{children}</AppContext>;
}