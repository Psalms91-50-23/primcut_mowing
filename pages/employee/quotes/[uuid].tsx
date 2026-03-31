import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { formatFullName, round2, formatMoney } from "@/utils/utils";
import { useUI } from "../../../context/UIContext";

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

type RecurrenceFrequency =
  | "one_off"
  | "weekly"
  | "fortnightly"
  | "monthly";

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
  message?: string;
  recurrence_frequency?: RecurrenceFrequency;

  terms_version?: string | number;
  terms_pdf_url?: string;
  terms_storage_path?: string;
  terms_file_name?: string;

  has_urgent_fee?: boolean;
  urgent_fee_amount?: number;
};

const GST_RATE = 0.15;

const RECURRENCE_OPTIONS: Array<{
  value: RecurrenceFrequency;
  label: string;
  description: string;
}> = [
  {
    value: "one_off",
    label: "One-off",
    description: "A single visit only",
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Ongoing weekly service",
  },
  {
    value: "fortnightly",
    label: "Fortnightly",
    description: "Every 2 weeks",
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Once a month",
  },
];

const formatDateOnly = (value?: string | null) => {
  if (!value) return "";
  const datePart = String(value).slice(0, 10);
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return datePart;
  return `${day}/${month}/${year}`;
};

const formatRecurrenceLabel = (
  recurrence?: RecurrenceFrequency | string | null
) => {
  switch (recurrence) {
    case "weekly":
      return "Weekly";
    case "fortnightly":
      return "Fortnightly";
    case "monthly":
      return "Monthly";
    case "one_off":
    default:
      return "One-off";
  }
};

export default function EmployeeQuotePage() {
  const router = useRouter();
  const { uuid } = router.query;
  const { user, role, loading } = useAuth();
  const { openImage } = useUI();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newExpiry, setNewExpiry] = useState("");

  const getServicesSubtotal = (services: Service[]) =>
    round2(services.reduce((sum, s) => sum + s.unit_price * s.quantity, 0));

  const getUrgentFee = (currentQuote: Quote) =>
    currentQuote.has_urgent_fee &&
    Number.isFinite(Number(currentQuote.urgent_fee_amount))
      ? round2(Number(currentQuote.urgent_fee_amount ?? 0))
      : 0;

  const recalculateQuoteTotals = (
    services: Service[],
    currentQuote: Quote
  ): Quote => {
    const servicesSubtotal = getServicesSubtotal(services);
    const urgentFee = getUrgentFee(currentQuote);
    const subtotal = round2(servicesSubtotal + urgentFee);
    const gst = round2(subtotal * GST_RATE);
    const total = round2(subtotal + gst);

    return {
      ...currentQuote,
      services,
      subtotal_amount: subtotal,
      gst_amount: gst,
      total_amount: total,
    };
  };

  useEffect(() => {
    if (loading || !router.isReady) return;

    if (!user) {
      router.replace(`/auth?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (!role || !["admin", "owner", "employee"].includes(role)) {
      router.replace("/auth");
    }
  }, [loading, user, role, router]);

  useEffect(() => {
    if (!router.isReady) return;

    if (typeof uuid !== "string") {
      setLoadingQuote(false);
      return;
    }

    const fetchQuote = async () => {
      setLoadingQuote(true);

      try {
        const res = await fetch(`/api/employee/quotes/${uuid}/details`, {
          credentials: "include",
        });

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(
            `Non-JSON response: ${res.status} ${text.slice(0, 200)}`
          );
        }

        const data = await res.json();
        const quoteData = data?.quote ?? data;
        console.log({ quoteData });

        const services = (quoteData.services || []).map((s: any) => ({
          value: s.value || s.code || "",
          label: s.label || s.value || s.code || "",
          unit_price: Number(s.unit_price ?? 0),
          quantity: Number(s.quantity ?? 1),
        }));

        const allowedRecurrenceFrequencies: RecurrenceFrequency[] = [
          "one_off",
          "weekly",
          "fortnightly",
          "monthly",
        ];

        const normalizedRecurrenceFrequency: RecurrenceFrequency =
          allowedRecurrenceFrequencies.includes(quoteData.recurrence_frequency)
            ? quoteData.recurrence_frequency
            : "one_off";

        const baseQuote: Quote = {
          ...quoteData,
          services,
          recurrence_frequency: normalizedRecurrenceFrequency,
          has_urgent_fee: Boolean(quoteData.has_urgent_fee),
          urgent_fee_amount: Number(quoteData.urgent_fee_amount ?? 0),
          subtotal_amount: 0,
          gst_amount: 0,
          total_amount: 0,
        };

        const recalculatedQuote = recalculateQuoteTotals(services, baseQuote);

        setQuote(recalculatedQuote);

        if (quoteData.expiry_end) {
          setNewExpiry(String(quoteData.expiry_end).slice(0, 10));
        } else {
          setNewExpiry("");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quote");
        setQuote(null);
      } finally {
        setLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [router.isReady, uuid]);

  const handleServiceChange = (
    index: number,
    field: "quantity" | "unit_price",
    rawValue: string
  ) => {
    if (!quote) return;

    const updatedServices = [...quote.services];

    if (field === "quantity") {
      const parsed = Number(rawValue);
      const quantity = Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
      updatedServices[index][field] = quantity;
    }

    if (field === "unit_price") {
      if (rawValue === "") {
        updatedServices[index][field] = 0;
      } else {
        const parsed = Number(rawValue);
        const unitPrice = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
        updatedServices[index][field] = unitPrice;
      }
    }

    setQuote(recalculateQuoteTotals(updatedServices, quote));
  };

  const handleUrgentFeeChange = (rawValue: string) => {
    if (!quote) return;

    const urgentFee =
      rawValue === ""
        ? 0
        : Math.max(0, Number.isFinite(Number(rawValue)) ? Number(rawValue) : 0);

    const updatedQuote: Quote = {
      ...quote,
      urgent_fee_amount: urgentFee,
    };

    setQuote(recalculateQuoteTotals(quote.services, updatedQuote));
  };

  const handleFinalizeQuote = async () => {
    if (!quote || typeof uuid !== "string") return;

    const invalidService = quote.services.find(
      (s) => !Number.isFinite(s.unit_price) || s.unit_price <= 0
    );

    if (invalidService) {
      toast.error(
        `Please enter a value for unit price for service: ${invalidService.label}`
      );
      return;
    }

    if (quote.is_quote_sent_to_client) {
      toast("Quote already sent to client", { icon: "⚠️" });
      return;
    }

    setSaving(true);

    try {
      const servicesSubtotal = getServicesSubtotal(quote.services);
      const urgentFee = getUrgentFee(quote);
      const subtotal = round2(servicesSubtotal + urgentFee);
      const gst = round2(subtotal * GST_RATE);
      const total = round2(subtotal + gst);

      const updatedQuote = {
        ...quote,
        recurrence_frequency: quote.recurrence_frequency || "one_off",
        expiry_end: newExpiry || quote.expiry_end || null,
        urgent_fee_amount: urgentFee,
        subtotal_amount: subtotal,
        gst_amount: gst,
        total_amount: total,
        sent_by_user_uuid: user?.uuid ?? null,
        is_quote_sent_to_client: true,
        quote_sent_at: new Date().toISOString(),
      };

      const res = await fetch(`/api/quotes/${uuid}?action=send`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedQuote),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to finalize quote");
      }

      const returnedQuote = data.quote || data;

      const normalizedServices = (returnedQuote.services || []).map((s: any) => ({
        value: s.value || s.code || "",
        label: s.label || s.value || s.code || "",
        unit_price: Number(s.unit_price ?? 0),
        quantity: Number(s.quantity ?? 1),
      }));

      const allowedRecurrenceFrequencies: RecurrenceFrequency[] = [
        "one_off",
        "weekly",
        "fortnightly",
        "monthly",
      ];

      const normalizedRecurrenceFrequency: RecurrenceFrequency =
        allowedRecurrenceFrequencies.includes(returnedQuote.recurrence_frequency)
          ? returnedQuote.recurrence_frequency
          : "one_off";

      const normalizedQuote: Quote = recalculateQuoteTotals(normalizedServices, {
        ...returnedQuote,
        services: normalizedServices,
        recurrence_frequency: normalizedRecurrenceFrequency,
        urgent_fee_amount: Number(returnedQuote.urgent_fee_amount ?? 0),
      });

      setQuote(normalizedQuote);

      if (returnedQuote.expiry_end) {
        setNewExpiry(String(returnedQuote.expiry_end).slice(0, 10));
      } else {
        setNewExpiry("");
      }

      toast.success(
        `Quote finalized! Expiry is now ${formatDateOnly(
          returnedQuote.expiry_end
        )}`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send quote.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingQuote) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div
        className="relative flex flex-col items-center justify-center p-4"
        style={{ minHeight: "calc(100vh - var(--nav-height))" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/images/quote_not_found.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-green-900">Quote Not Found</h2>
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
  }

  const alreadySent =
    quote.is_quote_sent_to_client && quote.quote_sent_at
      ? new Date(quote.quote_sent_at).toLocaleString()
      : null;

  if (alreadySent) {
    return (
      <div
        className="relative flex flex-col items-center justify-center p-4"
        style={{ minHeight: "calc(100vh - var(--nav-height))" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/images/quote_sent.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
          <h2 className="text-1xl font-bold mb-4 text-green-900">Quote Sent</h2>
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

  const expiryDate = quote.expiry_end ? new Date(quote.expiry_end) : null;
  const expired = expiryDate ? expiryDate.getTime() < Date.now() : false;
  const servicesSubtotal = getServicesSubtotal(quote.services);
  const urgentFee = getUrgentFee(quote);

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
      <div className="absolute inset-0 bg-black/25 z-0"></div>

      <div className="relative z-10 flex flex-col items-center py-10 px-3">
        <div
          className="w-full max-w-4xl bg-green-900 rounded-t-3xl shadow-md p-4
             flex flex-col sm:flex-row sm:items-center"
        >
          <div className="flex sm:flex-1 w-full">
            <h1 className="flex items-center font-bold text-white text-2xl sm:text-2xl">
              <span className="text-3xl m-0 p-0 translate-x-2 sm:text-4xl">H</span>
              <img
                src="/images/happy-house-1.png"
                alt="Happy Property Logo"
                className="w-12 h-12 pl-2 sm:w-14 sm:h-14"
              />
              <span className="font-bold text-3xl m-0 p-0 sm:text-4xl">
                ppy Property
              </span>
            </h1>
          </div>

          {(newExpiry || quote.expiry_end) && (
            <div className="w-full flex justify-end mt-2 sm:mt-0 sm:flex-1 sm:justify-end">
              <span className="text-white text-base sm:text-xl">
                Expiry Date: {formatDateOnly(newExpiry || quote.expiry_end)}
              </span>
            </div>
          )}
        </div>

        <div className="w-full max-w-4xl bg-white/95 shadow-2xl rounded-b-3xl p-3 sm:p-10 backdrop-blur-sm">
          <div>
            {expired && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 font-semibold rounded">
                This quote has expired. You may extend the expiry date and change
                status to accept.
              </div>
            )}

            <div className="flex flex-col px-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
                <div className="text-black text-sm sm:text-base w-full">
                  <div className="py-1">
                    <span className="font-bold">Quote ID: </span>
                    <span>{quote.uuid}</span>
                  </div>

                  <div className="py-1">
                    <span className="font-bold">Name: </span>
                    <span>
                      {formatFullName(
                        quote.contact_first_name,
                        quote.contact_last_name
                      )}
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

                  <div className="py-1">
                    <span className="font-bold">Requested Frequency: </span>
                    <span>{formatRecurrenceLabel(quote.recurrence_frequency)}</span>
                  </div>

                  {quote.message && quote.message.trim() && (
                    <div className="mt-4 flex flex-col">
                      <label className="font-bold py-2">Client Message</label>
                      <div className="w-full border border-gray-300 rounded px-3 py-3 bg-gray-50 text-gray-800 whitespace-pre-wrap break-words min-h-[100px]">
                        {quote.message}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Message submitted by the client with their quote request.
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block font-bold mb-2 py-2">
                      Service Frequency
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {RECURRENCE_OPTIONS.map((option) => {
                        const isSelected =
                          (quote.recurrence_frequency || "one_off") ===
                          option.value;

                        return (
                          <label
                            key={option.value}
                            className={`rounded border px-4 py-3 bg-white transition hover:cursor-pointer ${
                              isSelected
                                ? "border-green-700 ring-1 ring-green-700"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="recurrence_frequency"
                                value={option.value}
                                checked={isSelected}
                                onChange={() =>
                                  setQuote({
                                    ...quote,
                                    recurrence_frequency: option.value,
                                  })
                                }
                                className="mt-1 hover:cursor-pointer"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-sm sm:text-base">
                                  {option.label}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-600">
                                  {option.description}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Confirm whether this quote is for a one-off or recurring
                      service before sending it to the client.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:gap-4 w-full mt-4">
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

                  <div className="flex flex-col sm:flex-row sm:gap-4 w-full mt-4">
                    <div className="flex flex-col flex-1 min-w-0">
                      <label className="flex flex-col w-full">
                        <span className="font-bold py-2">Extend Expiry Date</span>
                        <input
                          type="date"
                          value={newExpiry}
                          className="w-full border border-gray-400 rounded px-3 py-2 shadow-sm focus:ring-1 focus:ring-green-500 cursor-pointer"
                          onChange={(e) => setNewExpiry(e.target.value)}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Dates under 4 days ahead will be standardized to 3 days.
                        Choose 4 or more days ahead to allow a longer expiry.
                      </p>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold py-2">Quote Status</span>
                      <div className="w-full border-2 border-gray-400 rounded px-3 h-11 flex items-center bg-gray-100">
                        {quote.status}
                      </div>
                    </div>
                  </div>

                  {quote.has_urgent_fee && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:gap-4">
                      <label className="flex flex-col w-full sm:w-64">
                        <span className="font-bold py-2 text-red-700">
                          Urgent Fee
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={
                            quote.urgent_fee_amount === 0
                              ? ""
                              : quote.urgent_fee_amount ?? ""
                          }
                          placeholder="0"
                          className="w-full border border-red-400 rounded px-3 py-2 shadow-sm focus:ring-1 focus:ring-red-500"
                          onChange={(e) => handleUrgentFeeChange(e.target.value)}
                        />
                      </label>

                      <div className="text-sm text-gray-600 mt-2 sm:mt-0">
                        This quote is marked as urgent. Add or update the urgent
                        fee here.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                This message will appear in the quote template when sending to
                client.
              </p>
            </div>

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
                          type="number"
                          min={1}
                          step={1}
                          value={s.quantity}
                          className="border rounded px-2 py-1 w-20 text-right shadow-sm focus:ring-1 focus:ring-green-500"
                          onChange={(e) =>
                            handleServiceChange(i, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td className="border px-4 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={s.unit_price === 0 ? "" : s.unit_price}
                          placeholder="0"
                          className="border rounded px-2 py-1 w-24 text-right shadow-sm focus:ring-1 focus:ring-green-500"
                          onChange={(e) =>
                            handleServiceChange(i, "unit_price", e.target.value)
                          }
                        />
                      </td>
                      <td className="border px-4 py-2 text-right">
                        ${formatMoney(round2(s.unit_price * s.quantity))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div>
                <div className="border-b border-gray-300 px-4 py-2 text-left">
                  <p className="text-md pb-4">Images</p>
                  <div className="flex flex-wrap gap-2">
                    {quote.images &&
                      quote.images.map((img, i) => {
                        return (
                          <button
                            key={`img ${i}`}
                            onClick={() =>
                              quote.images && openImage(quote.images[i].url)
                            }
                            className="w-15 h-15 overflow-hidden rounded-lg border cursor-pointer group hover:border-green-900"
                          >
                            <img
                              src={img.url}
                              alt={`Service image ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-200 hover:border-green-700 group-hover:scale-120"
                            />
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 items-end">
              <div className="py-1 font-semibold">
                <span>Services Subtotal: ${formatMoney(servicesSubtotal)}</span>
              </div>

              {quote.has_urgent_fee && (
                <div className="py-1 font-semibold text-red-700">
                  <span>Urgent Fee: ${formatMoney(urgentFee)}</span>
                </div>
              )}

              <div className="py-1 font-semibold">
                <span>Subtotal: ${formatMoney(quote.subtotal_amount)}</span>
              </div>
              <div className="py-1 font-semibold">
                <span>GST (15%): ${formatMoney(quote.gst_amount)}</span>
              </div>
              <div className="py-1 font-bold text-green-900 text-lg">
                <span>Total: ${formatMoney(quote.total_amount)}</span>
              </div>
            </div>

            <div className="w-full lg:w-64 flex-shrink-0 mt-4 lg:mt-0"></div>

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
  );
}