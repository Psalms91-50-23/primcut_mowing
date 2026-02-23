import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { formatFullName } from "@/utils/utils";
import { useUI } from "../../../context/UIContext"

type Service = {
  value: string;
  label: string;
  unit_price: number;
  quantity: number;
};

type Image = {
  label?: string;
  url: string;
};

type Quote = {
  uuid: string;
  address: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_mobile?: string;
  contact_landline?: string;
  contact_email: string;
  preferred_contact_method?: string;
  services: Service[];
  images?: Image[];
  subtotal_amount: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  expiry_end?: string;
  is_quote_sent_to_client?: boolean;
  quote_sent_at?: string;
  sent_by_user_uuid?: string;
  employer_message?: string;
};

const GST_RATE = 0.15;

export default function EmployeeQuotePage() {
  const router = useRouter();
  const { quote_uuid } = router.query;
  const { user, role, loading } = useAuth();
  const { openImage } = useUI();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newExpiry, setNewExpiry] = useState("");
  
  // Protect Route
  useEffect(() => {
    // if (loading) return;
    if (loading || !router.isReady) return;
    if (!user) {
      router.replace(`/auth?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (!role || !["admin", "owner", "employee"].includes(role)) {
      router.replace("/auth");
    }
  }, [loading, user, role, router, router.isReady]);

  // Fetch quote
  useEffect(() => {
    if (!quote_uuid) return;

    const fetchQuote = async () => {
      setLoadingQuote(true);
      try {
        const res = await fetch(`/api/quotes/uuid/${quote_uuid}`);
        const data = await res.json();
        const quoteData = data?.quote ?? data;

        const services = (quoteData.services || []).map((s: any) => ({
          value: s.value,
          label: s.label || s.value || "",
          unit_price: s.unit_price ?? 0,
          quantity: s.quantity ?? 1,
        }));

        const subtotal = services.reduce(
          (sum: number, s: { unit_price: number; quantity: number }) =>
            sum + s.unit_price * s.quantity,
          0
        );
        const gst = subtotal * GST_RATE;
        const total = subtotal + gst;
        // console.log({quoteData})
        setQuote({
          ...quoteData,
          services,
          subtotal_amount: subtotal,
          gst_amount: gst,
          total_amount: total,
        });

        if (quoteData.expiry_end)
          setNewExpiry(new Date(quoteData.expiry_end).toISOString().split("T")[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [quote_uuid]);

  const handleServiceChange = (
    index: number,
    field: "quantity" | "unit_price",
    rawValue: string
  ) => {
    if (!quote) return;
    const updatedServices = [...quote.services];
    let value = Number(rawValue);
    if (field === "quantity") value = Math.max(1, value);
    if (field === "unit_price") value = rawValue === "" ? 0 : Math.max(0, value);
    updatedServices[index][field] = value;

    const subtotal = updatedServices.reduce(
      (sum, s) => sum + s.unit_price * s.quantity,
      0
    );
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;

    setQuote({
      ...quote,
      services: updatedServices,
      subtotal_amount: subtotal,
      gst_amount: gst,
      total_amount: total,
    });
  };

   const handleFinalizeQuote = async () => {
    if (!quote || !quote_uuid) return;

    // ✅ Check that all unit prices are > 0
    const invalidService = quote.services.find((s) => !s.unit_price || s.unit_price <= 0);
    if (invalidService) {
      toast.error(`Please enter a value for unit price for service: ${invalidService.label}`);
      return;
    }

    // ✅ Check that status is 'sent'
    // if (quote.status !== "sent") {
    //   toast.error("Please change the quote status to 'Sent' before finalizing.");
    //   return;
    // }

    if (quote.is_quote_sent_to_client) {
      toast("Quote already sent to client", { icon: "⚠️" });
      return;
    }

    setSaving(true);
    try {
      const updatedQuote = {
        ...quote,
        sent_by_user_uuid: user?.uuid,
        is_quote_sent_to_client: true,
        quote_sent_at: new Date().toISOString(),
      };
      const res = await fetch(`/api/quotes/${quote_uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({...updatedQuote, sent_by_user_uuid: user?.uuid ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finalize quote");
      setQuote(data.quote || data);
      toast.success(`Quote finalized! Expiry is now ${new Date(data.quote.expiry_end).toLocaleDateString()}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to send quote.");
    } finally {
      setSaving(false);
    }
  };


  if (loading || loadingQuote)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!quote)
  return (
    <div
      className="relative flex flex-col items-center justify-center p-4"
      style={{ minHeight: "calc(100vh - var(--nav-height))" }} // accounts for nav bar height
    >
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/images/quote_not_found.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed", // keeps image full-screen on zoom
        }}
      >
        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-green-900">
          Quote Not Found
        </h2>
        <p className="mb-4 text-gray-700">
          Sorry, we couldn't find the quote you are looking for.
          <br />
          Please check the quote ID or contact support.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 py-2 px-6 bg-green-700 text-white rounded hover:cursor-pointer hover:bg-green-800"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );

  // Already sent check
  const alreadySent = quote.quote_sent_at
  ? new Date(quote.quote_sent_at).toLocaleString()
  : null;
  // console.log({quote})
  if (alreadySent) {
    return (
    <div className="relative flex flex-col items-center justify-center  p-4" 
    style={{ minHeight: "calc(100vh - var(--nav-height))" }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/images/quote_sent.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed", // <-- keeps image from shrinking when zooming
        }}
      >
        {/* Optional dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-green-900">
          Quote Sent
        </h2>
        <p className="mb-4 text-gray-700">
          This quote was already sent to the client on:
          <br />
          <span className="font-semibold">{alreadySent}</span>
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 py-2 px-6 bg-green-700 text-white rounded hover:cursor-pointer hover:bg-green-800"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
  }

  const expiryDate = newExpiry
    ? new Date(newExpiry + "T00:00:00")
    : quote.expiry_end
    ? new Date(quote.expiry_end)
    : null;
  const expired = expiryDate ? expiryDate < new Date() : false;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        backgroundImage: "url(/images/updating_quotes.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Full overlay */}
      <div className="absolute inset-0 bg-black/25 z-0"></div>
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center py-10 px-3">
          <div className="w-full max-w-4xl bg-green-900 rounded-t-3xl shadow-md p-4 flex justify-between items-center">
            <h1 className="flex items-center font-bold text-white text-2xl sm:text-3xl">
              <span className="text-3xl m-0 p-0 translate-x-2">H</span>
              <img
                src="/images/seedream-image.png"
                alt="Happy Lawns Logo"
                className="w-10 h-10"
              />
              <span className="font-bold text-3xl m-0 p-0">ppy Lawns</span>
            </h1>
            <div className="text-white text-sm">
              {expiryDate && <span>Expiry Date: {expiryDate.toLocaleDateString()}</span>}
            </div>
          </div>
        <div className="w-full max-w-4xl bg-white/95 shadow-2xl rounded-b-3xl p-3 sm:p-10 backdrop-blur-sm">
          {/* Header */}
        <div className="">
          {/* Expired Warning */}
          {expired && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 font-semibold rounded">
              This quote has expired. You may extend the expiry date and change status to accept.
            </div>
          )}
          {/* Quote Info */}
          <div className="flex flex-col px-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
              <div className="text-black text-sm sm:text-base">
                <div className="py-1">
                  <span className="font-bold">Quote ID: </span>
                  <span className="">{quote.uuid}</span>
                </div>
                <div className="py-1">
                  <span className="font-bold">Name: </span>
                  <span>
                    {formatFullName(quote.contact_first_name, quote.contact_last_name)}
                  </span>
                </div>
                <div className="flex flex-row py-1">
                  <span className="font-bold">Address: </span>
                  <span className="px-2">{quote.address}</span>
                </div>
                <div className="flex flex-row py-1">
                  <span className="font-bold">Email: </span>
                  <span className="px-2">{quote.contact_email}</span>
                </div>       
                <div className="flex flex-col sm:flex-row sm:gap-4 w-full">
                {/* Mobile */}
                <label className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold py-2">Mobile</span>
                  <input
                    type="text"
                    value={quote.contact_mobile || ""}
                    className="w-full border border-gray-400 rounded px-2 py-2 shadow-sm focus:ring-1 focus:ring-green-500"
                    onChange={(e) =>
                      setQuote({ ...quote, contact_mobile: e.target.value })
                    }
                  />
                </label>
                {/* Landline */}
                <label className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold py-2">Landline</span>
                  <input
                    type="text"
                    value={quote.contact_landline || ""}
                    className="w-full border border-gray-400 rounded px-2 py-2 shadow-sm focus:ring-1 focus:ring-green-500"
                    onChange={(e) =>
                      setQuote({ ...quote, contact_landline: e.target.value })
                    }
                  />
                </label>
              </div>
              {/* Expiry & Status */}
              <div className="flex flex-col sm:flex-row sm:gap-4 w-full mt-4">
                {/* Expiry */}
                <label className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold py-2">Extend Expiry Date</span>
                  <input
                    type="date"
                    value={newExpiry}
                    className="w-full border border-gray-400 rounded px-3 py-2 shadow-sm focus:ring-1 focus:ring-green-500 cursor-pointer"
                    onChange={(e) => setNewExpiry(e.target.value)}
                  />
                </label>
                {/* Status */}
                {/* <label className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold py-2">Quote Status</span>
                  <select
                    value={quote.status}
                    onChange={(e) => setQuote({ ...quote, status: e.target.value })}
                    className="w-full border-2 border-gray-400 rounded px-3  h-11 appearance-none shadow-sm focus:ring-1 focus:ring-green-500 cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="expired">Expired</option>
                  </select>
                </label> */}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold py-2">Quote Status</span>
                <div className="w-full border-2 border-gray-400 rounded px-3 h-11 flex items-center bg-gray-100">
                  {quote.status}
                </div>
              </div>
            </div>
          </div>
          {/* Employer Personalization Message */}
          <div className="mt-4 flex flex-col">
            <label className="font-bold py-2">
              Employer Message (Optional - For personalizing quote template)
            </label>
            <textarea
              value={quote.employer_message || ""}
              onChange={(e) =>
                setQuote({ ...quote, employer_message: e.target.value })
              }
              placeholder="Add a personalized message to the client..."
              className="w-full border border-gray-400 rounded px-3 py-2 shadow-sm focus:ring-1 focus:ring-green-500 min-h-[120px] resize-none overflow-y-auto"
            />
            <p className="text-xs text-gray-500 mt-2">
              This message will appear in the quote template when sending to client.
            </p>
          </div>
            {/* Services Table */}
            <div className="overflow-x-auto mt-4 rounded-t-lg">
              <table className="w-full table-auto border border-gray-200 rounded-t-lg overflow-hidden">
                <thead>
                  <tr className="bg-green-200 text-green-900">
                    <th className="border px-4 py-2 text-left">Service</th>
                    <th className="border px-4 py-2 text-right">Quantity</th>
                    <th className="border px-4 py-2 text-right">Unit Price</th>
                    <th className="border px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.services.map((s, i) => (
                    <tr key={`service ${i}`} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{s.label}</td>
                      <td className="border px-4 py-2 text-right">
                        <input
                          type="text"
                          value={s.quantity}
                          className="border rounded px-2 py-1 w-20 text-right shadow-sm focus:ring-1 focus:ring-green-500"
                          onChange={(e) => handleServiceChange(i, "quantity", e.target.value)}
                        />
                      </td>
                      <td className="border px-4 py-2 text-right">
                        <input
                          type="text"
                          value={s.unit_price === 0 ? "" : s.unit_price}
                          placeholder="0"
                          className="border rounded px-2 py-1 w-24 text-right shadow-sm focus:ring-1 focus:ring-green-500"
                          onChange={(e) => handleServiceChange(i, "unit_price", e.target.value)}
                        />
                      </td>
                      <td className="border px-4 py-2 text-right">
                        ${(s.unit_price * s.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="">
                <div className="border-b border-gray-300 px-4 py-2 text-left">
                  <p className="text-md pb-4">Images</p>
                  <div className="flex flex-wrap gap-2">
                      {quote.images && quote?.images.map((img, i) => {
                        return (
                          <button
                            key={`img ${i}`}
                            onClick={() => quote.images && openImage(quote.images[i].url!)}
                            className="w-15 h-15 overflow-hidden rounded-lg border cursor-pointer group hover:border-green-900"
                          >
                            <img
                              src={img.url}
                              alt={`Service image ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-200 hover:border-green-700 group-hover:scale-120"
                            />
                          </button>
                        )
                      })
                      }
                  </div>
                </div>
              </div>
            </div>
            {/* Totals */}
            <div className="flex flex-col space-y-2 items-end">
              <div className="py-1 font-semibold">
                <span>Subtotal: ${quote.subtotal_amount.toFixed(2)}</span>
              </div>
              <div className="py-1 font-semibold">
                <span>GST (15%): ${quote.gst_amount.toFixed(2)}</span>
              </div>
              <div className="py-1 font-bold text-green-900 text-lg">
                <span>Total: ${quote.total_amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="w-full lg:w-64 flex-shrink-0 mt-4 lg:mt-0">
          </div>
            {/* Finalize Button */}
            <button
              onClick={handleFinalizeQuote}
              disabled={saving || quote.is_quote_sent_to_client}
              className="w-full mt-6 py-2 bg-green-700 text-white rounded-b-md hover:bg-green-800 hover:cursor-pointer disabled:bg-gray-500"
            >
              {saving
                ? "Processing..."
                : quote.is_quote_sent_to_client
                ? "Quote Sent"
                : "Finalize & Send Quote"}
            </button>
          </div>
        </div>
      </div> 
    </div>
  </div>
  );
}
