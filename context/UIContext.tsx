import { createContext, useContext, useState, ReactNode } from "react";

type UIContextType = {
  activeImage: string | null;
  openImage: (url: string) => void;
  closeImage: () => void;
};

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const openImage = (url: string) => setActiveImage(url);
  const closeImage = () => setActiveImage(null);

  return (
    <UIContext.Provider value={{ activeImage, openImage, closeImage }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
};