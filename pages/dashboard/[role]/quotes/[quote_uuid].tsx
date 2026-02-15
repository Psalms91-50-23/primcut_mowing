import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";


interface Service {
  label: string;
  value: string;
  quantity: number;
  unit_price: number;
}

interface QuoteImage {
  url: string;
  label?: string;
}

interface Quote {
  uuid: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_mobile?: string;
  contact_landline?: string;
  services: Service[];
  images?: QuoteImage[];
  subtotal_amount: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  expiry_end?: string;
  is_quote_sent_to_client?: boolean;
  quote_sent_at?: string;
}

const GST_RATE = 0.15; // 15% GST

const Spinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
    <span className="text-white text-lg font-medium">{text}</span>
  </div>
);

export default function QuotePage() {
  const router = useRouter();
  const { quote_uuid } = router.query;
  const { user } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [newExpiry, setNewExpiry] = useState("");
  const [defaultStatus, setDefaultStatus] = useState<Quote["status"]>("draft");
  const [statusMessage, setStatusMessage] = useState("");

  // const COUNTRY_CODES: Record<string, string> = {
  //   NZ: "+64",
  //   AU: "+61",
  //   US: "+1",
  //   UK: "+44",
  //   CA: "+1",
  // };

  const [phoneCountry, setPhoneCountry] = useState("+64");
  const [phoneNumber, setPhoneNumber] = useState("");

  const isValidRole = user && ["owner", "admin", "employee"].includes(user?.role);

  // Fetch quote
  useEffect(() => {
    if (!quote_uuid || !user || !isValidRole) return;

    const fetchQuote = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/quotes/${quote_uuid}`);
        const contentType = res.headers.get("content-type") || "";
        let data;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error("API returned non-JSON:", text.slice(0, 500));
          throw new Error("Failed to fetch quote: backend returned non-JSON");
        }
        if (!res.ok) throw new Error(data.error || "Failed to fetch quote");
        setQuote(data.quote || data);
        setDefaultStatus(data.quote.status); // set default status from DB
        if (data.quote?.expiry_end) {
          setNewExpiry(new Date(data.quote.expiry_end).toISOString().split("T")[0]);
        }
      } catch (err: any) {
        console.error("Error fetching quote:", err.message || err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quote_uuid, user, isValidRole]);

  // Parse mobile number
  useEffect(() => {
    if (!quote?.contact_mobile) return;
    const digits = quote.contact_mobile.replace(/\D/g, "");
    let localNumber = digits;
    if (digits.startsWith("64")) localNumber = digits.slice(2);
    setPhoneCountry("+64");
    setPhoneNumber(localNumber || "");
  }, [quote?.contact_mobile]);

  // Update status message and allow editing if expiry is in the future
useEffect(() => {
  if (!quote) return;

  let expiryDate: Date | null = null;
  if (newExpiry) {
    expiryDate = new Date(newExpiry + "T00:00:00");
    const now = new Date();
    // If expiry is today, treat as future by adding 1 minute
    if (
      expiryDate.getFullYear() === now.getFullYear() &&
      expiryDate.getMonth() === now.getMonth() &&
      expiryDate.getDate() === now.getDate()
    ) {
      expiryDate.setHours(now.getHours(), now.getMinutes() + 1);
    }
  } else if (quote.expiry_end) {
    expiryDate = new Date(quote.expiry_end);
  }

  const now = new Date();
  const isFuture = expiryDate ? expiryDate > now : false;

  if (!isFuture) {
    setStatusMessage("Quote is expired. Status cannot be accepted until expiry is extended.");
    if (quote.status !== defaultStatus) setQuote({ ...quote, status: defaultStatus });
  } else {
    setStatusMessage("You may change the status of the quote to resend to client if need be.");
  }
}, [newExpiry, quote, defaultStatus]);


  // Calculate totals
  const calculateTotals = (services: Service[]) => {
    const subtotal = services.reduce((sum, s) => sum + s.quantity * s.unit_price, 0);
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  // Handle service change
  const handleServiceChange = (index: number, field: "quantity" | "unit_price", rawValue: string) => {
    if (!quote) return;
    const updatedServices = [...quote.services];
    let value = Number(rawValue);
    if (field === "quantity") value = Math.max(1, value);
    else if (field === "unit_price") value = rawValue === "" ? 0 : Math.max(0, value);
    updatedServices[index][field] = value;
    const { subtotal, gst, total } = calculateTotals(updatedServices);
    setQuote({
      ...quote,
      services: updatedServices,
      subtotal_amount: subtotal,
      gst_amount: gst,
      total_amount: total,
    });
  };

  // Update quote
  const handleUpdateQuote = async () => {
    if (!quote_uuid || !quote) return;
    setSaving(true);
    try {
      const updatedQuote = {
        ...quote,
        expiry_end: newExpiry ? new Date(newExpiry + "T00:00:00").toISOString() : quote.expiry_end,
      };
      const res = await fetch(`/api/quotes/${quote_uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQuote),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update quote");
      setQuote(data.quote || data);
      alert("Quote updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to update quote");
    } finally {
      setSaving(false);
    }
  };

  // Send quote
  const handleSendQuote = async () => {
    if (!quote_uuid || !quote) return;

    const expiryDate = newExpiry
      ? new Date(newExpiry + "T00:00:00")
      : quote.expiry_end
      ? new Date(quote.expiry_end)
      : null;

    if (!expiryDate || expiryDate <= new Date()) {
      alert("Please change expiry date to the future. Sending quote will not work with past dates.");
      return;
    }

    setSaving(true);
    try {
      const updatedQuote = {
        ...quote,
        expiry_end: expiryDate.toISOString(),
        status: quote.status,
        is_quote_sent_to_client: true,
        quote_sent_at: new Date().toISOString(),
      };
      const res = await fetch(`/api/quotes/${quote_uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQuote),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send quote");
      setQuote(data.quote || data);
      alert("Quote sent to client successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to send quote to client.");
    } finally {
      setSaving(false);
    }
  };

  // Compute if status can be changed
  const expiryDate = newExpiry ? new Date(newExpiry + "T00:00:00") : quote?.expiry_end ? new Date(quote.expiry_end) : null;
  const now = new Date();
  const canToggleStatus = expiryDate ? expiryDate > now : false;

  // Update status message
  useEffect(() => {
    if (!canToggleStatus) {
      setStatusMessage("Quote is expired. Status cannot be accepted until expiry is extended.");
      if (quote && quote.status !== defaultStatus) setQuote({ ...quote, status: defaultStatus });
    } else {
      setStatusMessage("You may change the status of the quote to resend to client if need be.");
    }
  }, [canToggleStatus, quote, defaultStatus]);

  if (loading) return <Spinner text="Loading quote..." />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!quote) return <p>No quote found.</p>;

  return (
    <div
      className="flex flex-col items-center min-h-screen p-6 relative"
      style={{
        backgroundImage: `url('/images/emoji_filling_quote.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-green-100/40 backdrop-blur-sm z-0"></div>
      {saving && <Spinner text="Processing..." />}

      {/* Header */}
      <div className="relative z-10 w-full max-w-[42rem] bg-white/90 shadow-2xl rounded-3xl p-4 backdrop-blur-sm sm:p-8">
        <div className="bg-green-900 rounded-t-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h1 className="flex items-center font-bold m-0 p-0 text-white text-xl sm:text-2xl md:text-3xl">
            <span className="text-2xl sm:text-3xl md:text-4xl translate-x-1">H</span>
            <img
              src="/images/seedream-image.png"
              alt="Happy Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-1"
            />
            <span className="text-xl sm:text-2xl md:text-3xl">ppy Lawns</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <span className="text-white text-sm">Date: {new Date().toLocaleDateString()}</span>
            <span className="text-white text-sm">Quote ID: {quote.uuid}</span>
            {expiryDate && <span className="text-white text-sm">Expiry: {expiryDate.toLocaleDateString()}</span>}
          </div>
        </div>

        {/* Expiry Picker */}
        <section className="mb-6">
          <label className="flex flex-col text-gray-700 font-semibold">
            Extend Expiry Date
            <input
              type="date"
              className="border rounded px-3 py-2 w-40 mt-1 shadow-sm focus:ring-1 focus:ring-green-500"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
            />
          </label>
          {statusMessage && <p className={`mt-1 ${canToggleStatus ? "text-green-700" : "text-red-500"}`}>{statusMessage}</p>}
        </section>

        {/* Contact Info */}
        <section className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Contact Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <label className="flex flex-col w-full">
              First Name
              <input
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={quote?.contact_first_name || ""}
                onChange={(e) => setQuote({ ...quote, contact_first_name: e.target.value })}
              />
            </label>
            <label className="flex flex-col w-full">
              Last Name
              <input
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={quote?.contact_last_name || ""}
                onChange={(e) => setQuote({ ...quote, contact_last_name: e.target.value })}
              />
            </label>

            {(quote?.contact_mobile || quote?.contact_email || quote?.contact_landline) && (
              <>
                {quote?.contact_mobile && (
                  <label className="flex flex-col w-full">
                    Mobile
                    <div className="flex gap-2 mt-1 w-full">
                      <select
                        className="border rounded px-2 py-1 w-auto min-w-[3.5rem]"
                        value={phoneCountry}
                        onChange={(e) => setPhoneCountry(e.target.value)}
                      >
                        {/* {Object.entries(COUNTRY_CODES).map(([country, code]) => (
                          <option key={country} value={code}>
                            {country} ({code})
                          </option>
                        ))} */}
                      </select>
                      <input
                        type="text"
                        placeholder="0"
                        className="border rounded px-2 py-1 flex-1 w-full min-w-[10rem]"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        maxLength={10}
                      />
                    </div>
                  </label>
                )}
                {quote.contact_email && (
                  <label className="flex flex-col w-full">
                    Email
                    <input
                      type="email"
                      className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                      value={quote.contact_email}
                      onChange={(e) => setQuote({ ...quote, contact_email: e.target.value })}
                    />
                  </label>
                )}
                {quote.contact_landline && (
                  <label className="flex flex-col w-full">
                    Landline
                    <input
                      type="text"
                      className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                      value={quote.contact_landline}
                      onChange={(e) => setQuote({ ...quote, contact_landline: e.target.value })}
                    />
                  </label>
                )}
              </>
            )}
          </div>
        </section>

        {/* Services */}
        <section className="mb-6 border-b border-gray-300 pb-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Services</h2>

          {/* Mobile */}
          <div className="sm:hidden space-y-3">
            {quote.services.map((s, i) => (
              <div key={i} className="border rounded-lg shadow-sm overflow-hidden">
                <div className="flex items-center justify-between bg-gradient-to-r from-green-200 to-green-400 text-green-900 font-semibold px-4 py-2 gap-2">
                  <p>{s.label}</p>
                  {quote.images?.[i] && (
                    <img
                      src={quote.images[i].url}
                      alt={quote.images[i].label || ""}
                      className="w-12 h-12 object-cover rounded cursor-pointer"
                      onClick={() => setModalImage(quote.images![i].url)}
                    />
                  )}
                </div>
                <div className="p-4 bg-white flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <input
                      type="text"
                      value={s.quantity}
                      className="border rounded px-2 py-1 w-20 text-right"
                      onChange={(e) => handleServiceChange(i, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Unit Price ($):</span>
                    <input
                      type="text"
                      value={s.unit_price === 0 ? "" : s.unit_price}
                      placeholder="0"
                      className="border rounded px-2 py-1 w-24 text-right shadow-sm focus:ring-1 focus:ring-green-500"
                      onChange={(e) => handleServiceChange(i, "unit_price", e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal:</span>
                    <span>${(s.quantity * s.unit_price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block">
            <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-green-200 to-green-400 text-green-900">
                  <th className="border px-4 py-2 text-left">Service</th>
                  <th className="border px-4 py-2 text-left">Image</th>
                  <th className="border px-4 py-2 text-right">Quantity</th>
                  <th className="border px-4 py-2 text-right">Unit Price ($)</th>
                  <th className="border px-4 py-2 text-right">Subtotal ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quote.services.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-left">{s.label}</td>
                    <td className="border px-4 py-2 text-left">
                      {quote.images?.[i] ? (
                        <img
                          src={quote.images[i].url}
                          alt={quote.images[i].label || ""}
                          className="w-12 h-12 object-cover rounded cursor-pointer"
                          onClick={() => setModalImage(quote.images![i].url)}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
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
                    <td className="border px-4 py-2 text-right">{(s.quantity * s.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals */}
        <section className="mb-6 flex flex-col sm:flex-row justify-end gap-4">
          <div className="w-full sm:w-64 border rounded-lg p-4 bg-white shadow-sm space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Subtotal:</span>
              <span>${(quote.subtotal_amount ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>GST (15%):</span>
              <span>${(quote.gst_amount ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-green-900 text-lg">
              <span>Total:</span>
              <span>${(quote.total_amount ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Status and Buttons */}
        <section className="flex flex-col sm:flex-row gap-4 justify-end">
          <select
          value={quote.status}
          disabled={!canToggleStatus} // now reactive
          onChange={(e) => setQuote({ ...quote, status: e.target.value })}
          className="border rounded px-3 py-2 shadow-sm focus:ring-1 focus:ring-green-500"
        >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="expired">Expired</option>
          </select>
          <Button onClick={handleUpdateQuote}>Update Quote</Button>
          <Button onClick={handleSendQuote} className="bg-green-600 text-white hover:bg-green-700">
            Send Quote
          </Button>
        </section>

        {/* Image Modal */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img src={modalImage} alt="Quote Image" className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
