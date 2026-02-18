import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { calculateGST,calculateSubtotal, calculateTotal, sanitizeDecimalInput, sanitizeIntegerInput } from "@/utils/utils";
import { useAuth } from "@/context/AuthContext";

type Service = {
  value: string;
  label: string;
  unit_price: string | number;
  quantity: string | number;
};

type Image = {
  label: string;
  url: string;
};

type Quote = {
  uuid: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_mobile: string;
  contact_landline: string;
  contact_email: string;
  preferred_contact_method: string;
  message: string;
  services: Service[];
  images: Image[];
  subtotal_amount: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  expiry_end: Date;
  // NEW
  is_quote_sent_to_client: boolean;
  quote_sent_at: string | null;
};

export default function QuoteAdminPage() {
  const router = useRouter();
  const { quote_uuid } = router.query;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true); // <-- renamed
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [activeImage, setActiveImage] = useState<Image | null>(null);
  const { user, role, loading } = useAuth(); // <-- auth loading

  // ✅ Protect Route
  useEffect(() => {
    if (loading) return; // wait for auth to finish
    if (!user) {
    // Not logged in → redirect to login with redirect param
    router.replace(`/auth?redirect=${encodeURIComponent(router.asPath)}`);
    return;
  }
    if (!user || !role || !["admin", "owner", "employee"].includes(role)) {
      router.replace("/auth"); 
    }
  }, [loading, user, role, router ]);

  useEffect(() => {
    if (!quote_uuid) return;

    const fetchQuote = async () => {
      setQuoteLoading(true);

      const res = await fetch(`/api/quotes/uuid/${quote_uuid}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      console.log({data}, " quote admin get")
      const quoteData = data?.quote ?? data;

      const services: Service[] = (quoteData.services || []).map((s: any) => ({
        value: s.value,
        label: (s.label || s.value || "").replace(/_/g, " "),
        unit_price: s.unit_price ?? 0,
        quantity: s.quantity ?? 1,
      }));

      const subtotal = calculateSubtotal(
        services.map((s: any) => ({
          ...s,
          unit_price: Number(s.unit_price),
          quantity: Number(s.quantity),
        }))
      );
      // const subtotal = calculateSubtotal(services);
      const gst = calculateGST(subtotal);
      const total = calculateTotal(subtotal, gst);

      setQuote({
        ...quoteData,
        services,
        subtotal_amount: subtotal,
        gst_amount: gst,
        total_amount: total,
      });

      setQuoteLoading(false);
    };

    fetchQuote();
  }, [quote_uuid]);

  const handleServiceChange = (
    index: number,
    field: "unit_price" | "quantity",
    value: number | string
  ) => {
    if (!quote) return;

    const newServices = [...quote.services];
    newServices[index] = {
      ...newServices[index],
      [field]: value,
    };

    // const subtotal = calculateSubtotal(newServices);
     const subtotal = calculateSubtotal(
      newServices.map((s) => ({
        ...s,
        unit_price: Number(s.unit_price),
        quantity: Number(s.quantity),
      }))
    );
    const gst = calculateGST(subtotal);
    const total = calculateTotal(subtotal, gst);

    setQuote({
      ...quote,
      services: newServices,
      subtotal_amount: subtotal,
      gst_amount: gst,
      total_amount: total,
    });
  };

  const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const finalizeQuote = async () => {
    if (!quote) return;

    // Prevent resending if already sent
    if (quote.is_quote_sent_to_client) {
      toast("Quote has already been sent to the client.", { icon: "⚠️" });
      return;
    }

    setIsFinalizing(true);

    const res = await fetch(
      `/api/quotes/admin/uuid/${quote.uuid}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          services: quote.services,
          subtotal_amount: quote.subtotal_amount,
          gst_amount: quote.gst_amount,
          total_amount: quote.total_amount,
          status: "sent",
          is_quote_sent_to_client: true,  
        }),
      }
    );

    if (res.ok) {
      const updatedQuote = await res.json();
      setQuote(updatedQuote.quote ?? updatedQuote);
      toast.success("Quote has been sent successfully to the client.");
    } else {
      toast.error("Failed to send the quote. Please try again.");
    }

    setIsFinalizing(false);
  };

  if (loading || quoteLoading)
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  // Protect route in render (extra safety)
  if (!user || !role || !["admin", "owner", "employee"].includes(role)) {
    return <div>Not authorized to view this page.</div>;
  }
  // Optional: if quote is missing
  if (!quote) return <div>Quote not found</div>;

  return (
    <>
      {/* <Toaster position="bottom-right" /> */}

      <div className="max-w-3xl mx-auto p-10 mt-20">
        <h1 className="text-2xl font-bold mb-6">Quote #{quote.uuid}</h1>

        {/* CONTACT INFO */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Contact Info</h2>
          <p>
            <strong>Name:</strong> {capitalize(quote.contact_first_name)}{" "}
            {capitalize(quote.contact_last_name)}
          </p>
          <p>
            <strong>Email:</strong> {quote.contact_email}
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            {quote.contact_mobile || quote.contact_landline}
          </p>
          <p>
            <strong>Preferred Contact:</strong>{" "}
            {quote.preferred_contact_method}
          </p>
        </div>

        {/* IMAGES */}
        {quote.images?.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold mb-3">Uploaded Images</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quote.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className="group text-left"
                >
                  <div className="relative border rounded overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.label}
                      className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                  </div>

                  {/* LABEL */}
                  <p className="mt-1 text-sm text-gray-700 truncate">
                    {img.label || "Image"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES */}
        <div className="mb-6">
          <div className="flex gap-4 font-semibold mb-2">
            <div className="w-1/3">Service</div>
            <div className="w-1/3">Unit Price</div>
            <div className="w-1/3">Qty</div>
          </div>

          {quote.services.map((s, index) => (
            <div key={index} className="flex gap-4 mb-2">
              <div className="w-1/3">{s.label}</div>
                <input
                  type="text"
                  value={s.unit_price === 0 ? "" : s.unit_price}
                  onChange={(e) =>
                    handleServiceChange(index, "unit_price", e.target.value)
                  }
                  onBlur={(e) => {
                    const sanitized = sanitizeDecimalInput(e.target.value);
                    handleServiceChange(index, "unit_price", sanitized || "0");
                  }}
                  className="border px-2 py-1 rounded w-1/3"
                />

                <input
                  type="text"
                  value={s.quantity}
                  onChange={(e) =>
                    handleServiceChange(index, "quantity", e.target.value)
                  }
                  onBlur={(e) => {
                    const sanitized = sanitizeIntegerInput(e.target.value);
                    handleServiceChange(index, "quantity", sanitized.toString());
                  }}
                  className="border px-2 py-1 rounded w-1/3"
                />
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="border-t pt-4 space-y-2">
          <p>
            <strong>Subtotal:</strong> ${quote.subtotal_amount.toFixed(2)}
          </p>
          <p>
            <strong>GST (15%):</strong> ${quote.gst_amount.toFixed(2)}
          </p>
          <p className="text-xl font-bold">
            Total: ${quote.total_amount.toFixed(2)}
          </p>
        </div>

        <button
          onClick={finalizeQuote}
          disabled={isFinalizing || quote.is_quote_sent_to_client}
          className="w-full mt-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:bg-gray-500"
        >
          {isFinalizing
            ? "Finalizing..."
            : quote.is_quote_sent_to_client
            ? "Quote Sent"
            : "Finalize & Send Email"}
        </button>
      </div>

      {/* IMAGE MODAL */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-pointer"
          onClick={() => setActiveImage(null)}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={() => setActiveImage(null)}
            className="fixed top-6 right-6 text-white text-5xl font-bold z-50 hover:opacity-80 hover:cursor-pointer hover:scale-[1.5] transition-transform duration-200"
            aria-label="Close"
          >
            ×
          </button>

          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeImage.url}
              alt={activeImage.label}
              className="max-h-[85vh] w-full object-contain rounded cursor-default"
            />

            {activeImage.label && (
              <p className="text-center text-white mt-4 text-3xl">
                {activeImage.label}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
