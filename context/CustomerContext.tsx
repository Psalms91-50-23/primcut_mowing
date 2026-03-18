import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

export interface CustomerType {
  id?: number;
  uuid?: string;
  user_uuid?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  mobile?: string | null;
  landline?: string | null;
  address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
}

type CustomerContextType = {
  customer: CustomerType | null;
  customerLoading: boolean;
  fetchCustomer: () => Promise<CustomerType | null>;
  refreshCustomer: () => Promise<CustomerType | null>;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerType | null>>;
  clearCustomer: () => void;
};

const CustomerContext = createContext<CustomerContextType | null>(null);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading, role } = useAuth();

  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [customerLoading, setCustomerLoading] = useState<boolean>(true);

  const clearCustomer = useCallback(() => {
    setCustomer(null);
  }, []);

  const fetchCustomer = useCallback(async (): Promise<CustomerType | null> => {
    if (authLoading) return null;

    if (!user) {
      setCustomer(null);
      setCustomerLoading(false);
      return null;
    }

    try {
      setCustomerLoading(true);

      const res = await fetch("/api/customers/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setCustomer(null);
        return null;
      }

      const json = await res.json();
      const customerData = json?.customer ?? null;
      console.log({customerData}, " customer context")
      setCustomer(customerData);
      return customerData;
    } catch (err) {
      console.error("fetchCustomer failed", err);
      setCustomer(null);
      return null;
    } finally {
      setCustomerLoading(false);
    }
  }, [authLoading, user]);

  const refreshCustomer = useCallback(async () => {
    return await fetchCustomer();
  }, [fetchCustomer]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCustomer(null);
      setCustomerLoading(false);
      return;
    }

    if (role !== "customer") {
      setCustomer(null);
      setCustomerLoading(false);
      return;
    }

    fetchCustomer();
  }, [authLoading, user, role, fetchCustomer]);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        customerLoading,
        fetchCustomer,
        refreshCustomer,
        setCustomer,
        clearCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used inside CustomerProvider");
  }
  return context;
};