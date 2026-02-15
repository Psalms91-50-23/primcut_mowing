import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function QuoteImageModal({ activeImage, onClose }: { activeImage: string, onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setModalRoot(document.getElementById("modal-root"));
  }, []);

  if (!mounted || !modalRoot || !activeImage) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="fixed top-4 right-4 text-white text-4xl font-bold transition-transform duration-200 hover:scale-150"
        onClick={onClose}
      >
        ×
      </button>
      <img
        src={activeImage}
        alt="Full size"
        className="max-w-[95vw] max-h-[90vh] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    modalRoot
  );
}