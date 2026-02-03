import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { formatFullName, formatPrettyDate } from "@/utils/utils";

type Service = {
  label: string;
  unit_price: number;
  quantity: number;
};

type Image = {
  url: string;
};

type Quote = {
  uuid: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  services: Service[];
  images: Image[];
  total_amount: number;
  subtotal_amount: number;
  gst_amount: number;
  expiry_end: string;
};

export default function QuoteView() {
  const router = useRouter();
  const { uuid } = router.query;

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  // NEW: Countdown state
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (!uuid) return;

    const fetchQuote = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quotes/uuid/${uuid}`);

        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          console.error("Response is not JSON:", text);
          setLoading(false);
          return;
        }

        const quote = json?.data || json?.quote || json;
        if (!quote) {
          console.error("Quote missing", json);
          setLoading(false);
          return;
        }

        setQuote(quote);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [uuid]);

  // NEW: Countdown logic
  useEffect(() => {
    if (!quote) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(quote.expiry_end).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setCountdown("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    };

    // Update immediately + every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [quote]);

  if (loading) return <div>Loading...</div>;
  if (!quote) return <div>Quote not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      {/* NEW: Countdown display */}
      <div className="text-right text-sm text-gray-600 mb-2">
        <strong>Expires in:</strong> {countdown}
      </div>

      <h1 className="text-3xl font-bold mb-4">Quote no. {quote.uuid}</h1>
      <h2>
        Hi there <span className="wave text-4xl">👋</span>{" "}
        {formatFullName(quote.contact_first_name, quote.contact_last_name, true)}, Your quote is ready.
        Let us know if you’d like to accept or reject it.
      </h2>

      <div className="mb-6">
        <p><span className="font-bold">Email:</span> {quote.contact_email}</p>
        <p>
          <span className="font-bold">Quote Expired Date:</span> {formatPrettyDate(quote.expiry_end)}
        </p>
      </div>

      {/* Services */}
      <div className="border rounded-lg p-5 shadow-sm mb-6">
        <h2 className="font-semibold mb-3">Services</h2>

        {quote.services.map((s, index) => (
          <div key={index} className="flex justify-between mb-2">
            <div>{s.label}</div>
            <div>
              {s.quantity} x ${s.unit_price.toFixed(2)} = ${(s.quantity * s.unit_price).toFixed(2)}
            </div>
          </div>
        ))}

        <div className="flex w-full font-bold mt-2 justify-between border-t border-gray-300 pt-4">
          <div className="">SubTotal</div>
          <div className="">${quote.subtotal_amount.toFixed(2)}</div>
        </div>
        <div className="flex w-full font-bold mt-2 justify-between border-t border-gray-300 pt-4">
          <div className="">GST 15%</div>
          <div className="">${quote.gst_amount.toFixed(2)}</div>
        </div>
        <div className="flex w-full font-bold mt-2 justify-between border-t border-gray-300 pt-4">
          <div>Total:</div>
          <div>${quote.total_amount.toFixed(2)}</div>
        </div>
      </div>

      {/* Images */}
      <div className="border rounded-lg p-5 shadow-sm mb-6">
        <h2 className="font-semibold mb-3">Images</h2>

        <div className="grid grid-cols-2 gap-3">
          {quote.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img.url)}
              className="group"
            >
              <img
                src={img.url}
                className="rounded-lg border cursor-pointer transition-transform duration-200 group-hover:scale-105"
                alt={`Quote image ${idx + 1}`}
              />
            </button>
          ))}
        </div>
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setActiveImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl font-bold hover:opacity-80 hover:cursor-pointer hover:scale-[1.5]"
            onClick={() => setActiveImage(null)}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={activeImage}
            className="max-w-[95vw] max-h-[95vh] w-screen h-screen object-contain"
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Accept / Reject */}
      <div className="flex gap-4">
        <a
          href={`/quotes/accept/${quote.uuid}`}
          className="px-6 py-3 bg-green-600 text-white rounded-lg"
        >
          Accept
        </a>
        <a
          href={`/quotes/reject/${quote.uuid}`}
          className="px-6 py-3 bg-red-600 text-white rounded-lg"
        >
          Reject
        </a>
      </div>
    </div>
  );
}
