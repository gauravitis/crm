import React, { createContext, useContext, ReactNode } from 'react';
import { useClients } from '../hooks/useClients';
import { useQuotations } from '../hooks/useQuotations';
import { useSales } from '../hooks/useSales';

interface AppContextType {
  clients: ReturnType<typeof useClients>;
  quotations: ReturnType<typeof useQuotations>;
  sales: ReturnType<typeof useSales>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const clients = useClients();
  const quotations = useQuotations();
  const sales = useSales();

  return (
    <AppContext.Provider value={{ clients, quotations, sales }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}