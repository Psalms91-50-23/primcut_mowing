import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { formatFullName, formatPrettyDate } from "@/utils/utils";
import { QuoteImageModal } from "../../../components";
import { useUI } from "../../../context/UIContext"

type Service = {
  label: string;
  unit_price?: number;
  quantity?: number;
};

type Image = {
  url?: string;
  label?: string;
};

type Quote = {
  uuid: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email?: string;
  contact_mobile?: string;
  contact_landline?: string;
  services: Service[];
  images?: Image[];
  total_amount: number;
  subtotal_amount: number;
  gst_amount: number;
  expiry_end: string;
  responded_at?: string;
  status: string;
  limited?: boolean;
};

export default function QuoteView() {
  const { openImage } = useUI();
  const router = useRouter();
  const { uuid, token } = router.query;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteToken, setQuoteToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"accept" | "reject" | null>(null);

  const isResponded =
    quote?.status === "accepted" ||
    quote?.status === "rejected" ||
    quote?.status === "expired";
  const respondedAt = quote?.responded_at
    ? new Date(quote.responded_at)
    : null;

  // Fetch quote (session / token / limited)
  useEffect(() => {
    setLoading(true);
    if (!router.isReady || !uuid) return;
    const rawToken = Array.isArray(token) ? token[0] : token;
    console.log({rawToken})
    if(rawToken){
      setQuoteToken(rawToken );
    }
    // Remove token from URL immediately
    if (rawToken && router.query.token) {
      router.replace(`/quotes/view/${uuid}`, undefined, { shallow: true });
    }

    const fetchQuote = async () => {
      
      try {
        // 1️⃣ Try session-based fetch
        let res = await fetch(`/api/quotes/get-by-session/${uuid}`, {
          credentials: "include",
        });
        let data = await res.json();

        if (res.ok && data?.quote) {
          setQuote(data.quote);
          return;
        }

        // 2️⃣ Try token validation
        if (rawToken) {
          res = await fetch("/api/quotes/validate/quote-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uuid, token: rawToken }),
            credentials: "include",
          });
          data = await res.json();

          if (res.ok && data?.quote) {
            setQuote(data.quote);
            setQuoteToken(rawToken);
            return;
          }
        }

        // 3️⃣ Fallback to limited route
        res = await fetch(`/api/quotes/public/limited/uuid/${uuid}`);
        data = await res.json();

        if (res.ok && data?.quote) {
          setQuote({ ...data.quote, limited: true });
          return;
        }

        // 4️⃣ Truly not found
        setQuote(null);
      } catch (err) {
        console.error("Quote fetch failed:", err);
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [router.isReady, uuid, token]);

  // Accept / Reject handler
  const handleQuoteAction = async (action: "accept" | "reject") => {
    if (!quote || quote.limited || isResponded) return; // disabled for limited or already responded quotes
    try {
      setActionLoading(true);
      setLoadingAction(action)
       // ✅ Determine the token to send
      const tokenToSend = quoteToken || (Array.isArray(token) ? token[0] : undefined);
      if (!tokenToSend) {
        alert("Missing token. Please reload the page.");
        return;
      }

      const res = await fetch(`/api/quotes/public/${action}/uuid/${quote.uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: quoteToken || undefined }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert(data.error || "Something went wrong");
        return;
      }
      setQuote({
        ...quote,
        status: action === "accept" ? "accepted" : "rejected",
        responded_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      alert("Request failed. Try again.");
    } finally {
      setActionLoading(false);
      setLoadingAction(null);
    }
  };

  useEffect(() => {
    console.log({quoteToken}, " useEffect 1`11")
  }, [quoteToken])
  console.log({quote})
  // Loading spinner
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );

  // Quote not found
  if (!quote)
    return (
      <div className="relative min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/images/accept_or_reject_quote.png')" }}
        />
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="relative z-10 flex justify-center items-center h-screen px-4">
          <div className="bg-white/90 rounded-2xl shadow-[-4px_4px_12px_rgba(0,0,0,0.2)] p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Quote has been accepted, rejected, or expired
            </h2>
            <p className="text-gray-600 mb-6">
              Sorry, we couldn’t find the quote you’re looking for.
            </p>
            <button
              onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
              className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-900 transition hover:cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );

  const hasImages = quote.images && quote.images.length > 0;

  return (
    <div className="relative min-h-screen p-5 sm:p-10">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/accept_or_reject_quote.png')" }}
      />
      <div className="absolute inset-0 bg-black/40 z-0" />

      <div className="relative z-10 max-w-5xl mx-auto mt-6 space-y-6 shadow-[-4px_4px_12px_rgba(0,0,0,0.2)] bg-white/90 rounded-2xl">
        {/* Header */}
        <div className="flex flex-col items-start mb-6 bg-green-900 py-5 rounded-t-lg">
          <h1 className="flex font-bold items-center text-3xl ">
            <span className="text-white text-4xl translate-x-2">H</span>
            <img src="/images/seedream-image.png" alt="Happy Logo" className="w-12 h-12 inline-block" />
            <span className="text-white m0 p0">ppy Lawns</span>
          </h1>
        </div>

        <div className="relative flex flex-col max-w-5xl p-6">
          {/* Show status */}
          <div className="mb-4 space-y-2">
            <h2 className="text-2xl font-bold pt-2">Quote Details</h2>
            <p className="text-md mb-1 font-semibold">Quote ID: {quote.uuid}</p>
            <p>
              <span className="wave text-3xl">👋</span> Hi{" "}
              <span className="font-bold">
                {formatFullName(quote.contact_first_name, quote.contact_last_name, true)}
              </span>
              ,{" "}
              {quote.limited || isResponded ? (
                <>your quote has already been <strong>{quote.status}</strong>.</>
              ) : (
                <>your quote is ready.</>
              )}
            </p>

            {/* Status */}
            <div className="text-left text-sm text-gray-600 mt-2">
              {isResponded && respondedAt ? (
                <>
                  <strong>Status:</strong> <span className="capitalize">{quote.status}</span> <br />
                  <strong>Responded at:</strong> {respondedAt.toLocaleString()}
                </>
              ) : null}
            </div>

            {/* Sensitive info: show only if quote is sent */}
            {quote.status === "sent" && (
              <>
                {quote.contact_email && <p><strong>Email:</strong> {quote.contact_email}</p>}
                {quote.contact_mobile && <p><strong>Mobile:</strong> {quote.contact_mobile}</p>}
                {quote.contact_landline && <p><strong>Landline:</strong> {quote.contact_landline}</p>}
              </>
            )}

            {!isResponded && <p><strong>Expiry:</strong> {formatPrettyDate(quote.expiry_end)}</p>}
          </div>

          {/* Services Table */}
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-auto border-collapse">
                <thead className="w-full bg-green-700 text-white">
                  <tr className="w-full">
                    <th className="text-left px-4 py-2 whitespace-nowrap">Service</th>
                    {/* {hasImages && <th className="text-left px-4 py-2 whitespace-nowrap">Image</th>} */}
                    {/* Show Unit Price and Total only if not limited and not responded */}
                    {!quote.limited && !isResponded && (
                      <>
                        <th className="text-center px-4 py-2 whitespace-nowrap">Unit Price</th>
                        <th className="text-center px-4 py-2 whitespace-nowrap">Quantity</th>
                        <th className="text-right px-4 py-2 whitespace-nowrap">Total</th>
                      </>
                    )}
                    {(quote.limited || isResponded) && <th className="text-center px-4 py-2 whitespace-nowrap">Quantity</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quote.services.map((s, i) => {
                    // const img = quote.images?.[i];
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{s.label}</td>
                        {!quote.limited && !isResponded && (
                          <>
                            <td className="px-4 py-2 text-center">{s.unit_price != null ? `$${s.unit_price.toFixed(2)}` : "-"}</td>
                            <td className="px-4 py-2 text-center">{s.quantity ?? "-"}</td>
                            <td className="px-4 py-2 text-right">{s.unit_price != null && s.quantity != null ? `$${(s.unit_price * s.quantity).toFixed(2)}` : "-"}</td>
                          </>
                        )}
                        {(quote.limited || isResponded) && (
                          <td className="px-4 py-2 text-center">{s.quantity ?? "-"}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                
              </table>
              {/* Image for this service */}
              <div className="py-4 px-4">
                { quote.images && (
                  <p className="pb-4">Images</p>
                )
                }
                {quote.images && quote.images.map((img, i) => {
                  return (
                    <button
                      key={i}
                      onClick={() =>  img.url &&  openImage(img.url)}
                      className="w-15 h-15 overflow-hidden rounded-lg border cursor-pointer group hover:border-green-900"
                    >
                      <img
                        src={img.url}
                        alt={img.label ?? `Service image ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 hover:border-green-700 group-hover:scale-120"
                      />
                    </button>
                  )
                }) 
                }
              </div>
              {!quote.limited && !isResponded && (
                <div className="mt-4 w-full ml-auto">
                  <div className="flex justify-end px-4 py-2 border-t border-gray-300 font-semibold">
                    <span className="mr-2 text-right">SubTotal</span>
                    <span className="text-right">${quote.subtotal_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end px-4 py-2 border-t border-gray-300 font-semibold">
                    <span className="mr-2 text-right">GST 15%</span>
                    <span className="text-right">${quote.gst_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end px-4 py-2 border-t border-gray-300 font-bold text-lg">
                    <span className="mr-2 text-right">Total</span>
                    <span className="text-right">${quote.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Accept/Reject */}
          {!quote.limited && !isResponded && (
            <div className="mt-6 flex gap-4">
              {/* ACCEPT */}
              <button
                onClick={() => handleQuoteAction("accept")}
                disabled={loadingAction === "reject"}
                className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition ${
                  loadingAction === "accept"
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : loadingAction === "reject"
                    ? "bg-green-600 text-white opacity-50 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-900 hover:cursor-pointer"
                }`}
              >
                {loadingAction === "accept" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  "Accept"
                )}
              </button>

              {/* REJECT */}
              <button
                onClick={() => handleQuoteAction("reject")}
                disabled={loadingAction === "accept"}
                className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition ${
                  loadingAction === "reject"
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : loadingAction === "accept"
                    ? "bg-red-600 text-white opacity-50 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-900 hover:cursor-pointer"
                }`}
              >
                {loadingAction === "reject" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}