import React, { useEffect, useMemo, useState } from "react";
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
  preferred_contact_method?: "mobile" | "landline" | "email" | "";
  services: Service[];
  images?: QuoteImage[];
  subtotal_amount: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  expiry_end?: string;
  is_quote_sent_to_client?: boolean;
  quote_sent_at?: string;
  message?: string | null;
  employer_message?: string | null;
  has_urgent_fee?: boolean;
  urgent_fee_amount?: number | null;
}

const GST_RATE = 0.15;

const Spinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
    <span className="text-white text-lg font-medium">{text}</span>
  </div>
);

const formatDateInputValueFromISO = (iso?: string | null) => {
  if (!iso || typeof iso !== "string") return "";
  return iso.slice(0, 10);
};

const parseDateInputToLocalEndOfDay = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
};

const splitNZPhone = (value?: string | null) => {
  if (!value) {
    return {
      country: "+64",
      local: "",
    };
  }

  const digits = String(value).replace(/\D/g, "");

  if (!digits) {
    return {
      country: "+64",
      local: "",
    };
  }

  if (digits.startsWith("64")) {
    return {
      country: "+64",
      local: `0${digits.slice(2)}`,
    };
  }

  if (digits.startsWith("0")) {
    return {
      country: "+64",
      local: digits,
    };
  }

  return {
    country: "+64",
    local: `0${digits}`,
  };
};

const buildNZPhoneForSave = (
  countryCode: string,
  localNumber: string,
  fallback?: string | null
) => {
  const cleanLocal = String(localNumber || "").replace(/\D/g, "");

  if (!cleanLocal) return fallback || "";

  return `${countryCode}${cleanLocal.replace(/^0+/, "")}`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getServiceName = (service?: Partial<Service>) => {
  return `${service?.label || ""} ${service?.value || ""}`.trim().toLowerCase();
};

const isUrgentFeeService = (service?: Partial<Service>) => {
  const name = getServiceName(service);
  return (
    name.includes("urgent fee") ||
    name.includes("urgent request fee") ||
    name.includes("priority fee") ||
    name.includes("call-out fee") ||
    name === "urgent" ||
    name.includes("urgent")
  );
};

const getUrgentFeeFromServices = (services: Service[] = []) => {
  return services.reduce((sum, service) => {
    if (!isUrgentFeeService(service)) return sum;
    const quantity = Number(service.quantity) || 0;
    const unitPrice = Number(service.unit_price) || 0;
    return sum + quantity * unitPrice;
  }, 0);
};

const getNonUrgentServicesSubtotal = (services: Service[] = []) => {
  return services.reduce((sum, service) => {
    if (isUrgentFeeService(service)) return sum;
    const quantity = Number(service.quantity) || 0;
    const unitPrice = Number(service.unit_price) || 0;
    return sum + quantity * unitPrice;
  }, 0);
};

export default function QuotePage() {
  const router = useRouter();
  const { uuid } = router.query;
  const { user } = useAuth();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [newExpiry, setNewExpiry] = useState("");
  const [defaultStatus, setDefaultStatus] = useState<Quote["status"]>("draft");
  const [statusMessage, setStatusMessage] = useState("");

  const COUNTRY_CODES: Record<string, string> = {
    NZ: "+64",
  };

  const [mobileCountry, setMobileCountry] = useState("+64");
  const [mobileNumber, setMobileNumber] = useState("");
  const [landlineCountry, setLandlineCountry] = useState("+64");
  const [landlineNumber, setLandlineNumber] = useState("");

  const isValidRole = user && ["owner", "admin", "employee"].includes(user?.role);

  useEffect(() => {
    if (!uuid || !user || !isValidRole) return;

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/quotes/${uuid}`);
        const contentType = res.headers.get("content-type") || "";
        let data: any;

        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error("API returned non-JSON:", text.slice(0, 500));
          throw new Error("Failed to fetch quote: backend returned non-JSON");
        }

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch quote");
        }

        const loadedQuote = data.quote || data;

        const normalizedQuote: Quote = {
          ...loadedQuote,
          preferred_contact_method: loadedQuote.preferred_contact_method ?? "",
          message: loadedQuote.message ?? "",
          employer_message: loadedQuote.employer_message ?? "",
          services: Array.isArray(loadedQuote.services) ? loadedQuote.services : [],
          images: Array.isArray(loadedQuote.images) ? loadedQuote.images : [],
          has_urgent_fee: Boolean(loadedQuote.has_urgent_fee),
          urgent_fee_amount: Number(loadedQuote.urgent_fee_amount) || 0,
        };

        setQuote(normalizedQuote);
        setDefaultStatus(normalizedQuote.status || "draft");
        setNewExpiry(formatDateInputValueFromISO(normalizedQuote.expiry_end));

        const mobileParts = splitNZPhone(normalizedQuote.contact_mobile);
        setMobileCountry(mobileParts.country);
        setMobileNumber(mobileParts.local);

        const landlineParts = splitNZPhone(normalizedQuote.contact_landline);
        setLandlineCountry(landlineParts.country);
        setLandlineNumber(landlineParts.local);
      } catch (err: any) {
        console.error("Error fetching quote:", err.message || err);
        setError(err.message || "Failed to fetch quote");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [uuid, user, isValidRole]);

  const calculatedExpiryDate = useMemo(() => {
    if (newExpiry) {
      return parseDateInputToLocalEndOfDay(newExpiry);
    }

    if (quote?.expiry_end) {
      return new Date(quote.expiry_end);
    }

    return null;
  }, [newExpiry, quote?.expiry_end]);

  const nowTime = Date.now();

  const canToggleStatus = useMemo(() => {
    return calculatedExpiryDate ? calculatedExpiryDate.getTime() > nowTime : false;
  }, [calculatedExpiryDate, nowTime]);

  useEffect(() => {
    if (!quote) return;

    if (!canToggleStatus) {
      setStatusMessage("Quote has expired. Status cannot be accepted until expiry is extended.");

      if (quote.status !== defaultStatus) {
        setQuote((prev) => {
          if (!prev) return prev;
          if (prev.status === defaultStatus) return prev;
          return { ...prev, status: defaultStatus };
        });
      }
    } else {
      setStatusMessage("You may change the status of the quote to resend to client if need be.");
    }
  }, [canToggleStatus, defaultStatus, quote]);

  const calculateTotals = (
    services: Service[],
    options?: {
      hasUrgentFee?: boolean;
      urgentFeeAmount?: number | null;
    }
  ) => {
    const servicesSubtotal = getNonUrgentServicesSubtotal(services);
    const urgentFeeInServices = getUrgentFeeFromServices(services);

    const separateUrgentFee =
      urgentFeeInServices > 0
        ? 0
        : options?.hasUrgentFee
        ? Number(options?.urgentFeeAmount) || 0
        : 0;

    const subtotal = servicesSubtotal + urgentFeeInServices + separateUrgentFee;
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;

    return {
      servicesSubtotal,
      urgentFeeInServices,
      separateUrgentFee,
      subtotal,
      gst,
      total,
    };
  };

  const totalsBreakdown = useMemo(() => {
    if (!quote) {
      return {
        servicesSubtotal: 0,
        urgentFeeInServices: 0,
        separateUrgentFee: 0,
        subtotal: 0,
        gst: 0,
        total: 0,
      };
    }

    return calculateTotals(quote.services || [], {
      hasUrgentFee: quote.has_urgent_fee,
      urgentFeeAmount: quote.urgent_fee_amount,
    });
  }, [quote]);

  const handleServiceChange = (
    index: number,
    field: "quantity" | "unit_price",
    rawValue: string
  ) => {
    if (!quote) return;

    const updatedServices = [...quote.services];
    const currentService = { ...updatedServices[index] };

    let value = Number(rawValue);

    if (field === "quantity") {
      value = Math.max(1, Math.floor(value || 1));
    } else {
      value = rawValue.trim() === "" ? 0 : Math.max(0, value || 0);
    }

    currentService[field] = value;
    updatedServices[index] = currentService;

    const { subtotal, gst, total } = calculateTotals(updatedServices, {
      hasUrgentFee: quote.has_urgent_fee,
      urgentFeeAmount: quote.urgent_fee_amount,
    });

    setQuote({
      ...quote,
      services: updatedServices,
      subtotal_amount: subtotal,
      gst_amount: gst,
      total_amount: total,
    });
  };

  const buildMobileForSave = () => {
    return buildNZPhoneForSave(mobileCountry, mobileNumber, quote?.contact_mobile);
  };

  const buildLandlineForSave = () => {
    return buildNZPhoneForSave(landlineCountry, landlineNumber, quote?.contact_landline);
  };

  const missingUnitPriceServices = useMemo(() => {
    if (!quote?.services?.length) return [];

    return quote.services.filter(
      (service) =>
        service.unit_price === null ||
        service.unit_price === undefined ||
        Number(service.unit_price) <= 0
    );
  }, [quote?.services]);

  const isStatusSent = quote?.status === "sent";

  const canSendQuote = useMemo(() => {
    return (
      missingUnitPriceServices.length === 0 &&
      !!calculatedExpiryDate &&
      calculatedExpiryDate.getTime() > Date.now() &&
      isStatusSent
    );
  }, [missingUnitPriceServices, calculatedExpiryDate, isStatusSent]);

  const sendBlockReason = useMemo(() => {
    if (missingUnitPriceServices.length > 0) {
      return "All services must have a unit price greater than 0 before the quote can be sent.";
    }

    if (!calculatedExpiryDate || calculatedExpiryDate.getTime() <= Date.now()) {
      return "Quote cannot be sent because the expiry date is missing or has expired.";
    }

    if (!isStatusSent) {
      return 'Quote cannot be sent unless the status is set to "sent".';
    }

    return "";
  }, [missingUnitPriceServices, calculatedExpiryDate, isStatusSent]);

  const handleUpdateQuote = async () => {
    if (!uuid || !quote) return;

    setSaving(true);

    try {
      const expiryEndDate = newExpiry
        ? parseDateInputToLocalEndOfDay(newExpiry)
        : quote.expiry_end
        ? new Date(quote.expiry_end)
        : null;

      const recalculatedTotals = calculateTotals(quote.services || [], {
        hasUrgentFee: quote.has_urgent_fee,
        urgentFeeAmount: quote.urgent_fee_amount,
      });

      const updatedQuote = {
        ...quote,
        contact_mobile: buildMobileForSave(),
        contact_landline: buildLandlineForSave(),
        preferred_contact_method: quote.preferred_contact_method || null,
        expiry_end: expiryEndDate ? expiryEndDate.toISOString() : null,
        employer_message: quote.employer_message ?? "",
        subtotal_amount: recalculatedTotals.subtotal,
        gst_amount: recalculatedTotals.gst,
        total_amount: recalculatedTotals.total,
      };

      const res = await fetch(`/api/quotes/${uuid}?action=update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQuote),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to update quote");
      }

      const savedQuote = data.quote || data;

      const normalizedQuote: Quote = {
        ...savedQuote,
        preferred_contact_method: savedQuote.preferred_contact_method ?? "",
        message: savedQuote.message ?? quote.message ?? "",
        employer_message: savedQuote.employer_message ?? quote.employer_message ?? "",
        services: Array.isArray(savedQuote.services) ? savedQuote.services : [],
        images: Array.isArray(savedQuote.images) ? savedQuote.images : [],
        has_urgent_fee: Boolean(savedQuote.has_urgent_fee),
        urgent_fee_amount: Number(savedQuote.urgent_fee_amount) || 0,
      };

      setQuote(normalizedQuote);
      setDefaultStatus(normalizedQuote.status || "draft");
      setNewExpiry(formatDateInputValueFromISO(normalizedQuote.expiry_end));

      const mobileParts = splitNZPhone(normalizedQuote.contact_mobile);
      setMobileCountry(mobileParts.country);
      setMobileNumber(mobileParts.local);

      const landlineParts = splitNZPhone(normalizedQuote.contact_landline);
      setLandlineCountry(landlineParts.country);
      setLandlineNumber(landlineParts.local);

      alert("Quote updated in database successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update quote");
    } finally {
      setSaving(false);
    }
  };

  const handleSendQuote = async () => {
    if (!uuid || !quote) return;

    if (missingUnitPriceServices.length > 0) {
      const serviceNames = missingUnitPriceServices
        .map((service) => service.label || service.value || "Unnamed service")
        .join(", ");

      alert(
        `Please enter a unit price greater than 0 for all services before sending the quote. Missing unit price for: ${serviceNames}`
      );
      return;
    }

    if (!calculatedExpiryDate || calculatedExpiryDate.getTime() <= Date.now()) {
      alert("Cannot send quote to client because the expiry date is missing or has expired.");
      return;
    }

    if (quote.status !== "sent") {
      alert('Cannot send quote to client unless the status is set to "sent".');
      return;
    }

    setSaving(true);

    try {
      const recalculatedTotals = calculateTotals(quote.services || [], {
        hasUrgentFee: quote.has_urgent_fee,
        urgentFeeAmount: quote.urgent_fee_amount,
      });

      const updatedQuote = {
        ...quote,
        contact_mobile: buildMobileForSave(),
        contact_landline: buildLandlineForSave(),
        preferred_contact_method: quote.preferred_contact_method || null,
        expiry_end: calculatedExpiryDate.toISOString(),
        status: quote.status,
        employer_message: quote.employer_message ?? "",
        is_quote_sent_to_client: true,
        quote_sent_at: new Date().toISOString(),
        subtotal_amount: recalculatedTotals.subtotal,
        gst_amount: recalculatedTotals.gst,
        total_amount: recalculatedTotals.total,
      };

      const res = await fetch(`/api/quotes/${uuid}?action=send`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQuote),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to send quote");
      }

      const sentQuote = data.quote || data;

      const normalizedQuote: Quote = {
        ...sentQuote,
        preferred_contact_method: sentQuote.preferred_contact_method ?? "",
        message: sentQuote.message ?? quote.message ?? "",
        employer_message: sentQuote.employer_message ?? quote.employer_message ?? "",
        services: Array.isArray(sentQuote.services) ? sentQuote.services : [],
        images: Array.isArray(sentQuote.images) ? sentQuote.images : [],
        has_urgent_fee: Boolean(sentQuote.has_urgent_fee),
        urgent_fee_amount: Number(sentQuote.urgent_fee_amount) || 0,
      };

      setQuote(normalizedQuote);
      setDefaultStatus(normalizedQuote.status || "draft");
      setNewExpiry(formatDateInputValueFromISO(normalizedQuote.expiry_end));

      const mobileParts = splitNZPhone(normalizedQuote.contact_mobile);
      setMobileCountry(mobileParts.country);
      setMobileNumber(mobileParts.local);

      const landlineParts = splitNZPhone(normalizedQuote.contact_landline);
      setLandlineCountry(landlineParts.country);
      setLandlineNumber(landlineParts.local);

      alert("Quote updated and sent to client successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send quote to client.");
    } finally {
      setSaving(false);
    }
  };

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

      <div className="relative z-10 w-full max-w-[42rem] bg-white/90 shadow-2xl rounded-3xl backdrop-blur-sm overflow-hidden">
        <div className="bg-green-900 px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h1 className="flex items-center font-bold text-white text-xl sm:text-2xl md:text-3xl">
            <span className="text-2xl sm:text-3xl translate-x-1">H</span>
            <img
              src="/images/happy-house-1.png"
              alt="Happy Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ml-1"
            />
            <span>ppy Property</span>
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div>
              <p className="text-white text-sm">Date</p>
              <p className="text-white text-sm">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-white text-sm">Quote ID</p>
              <p className="text-white text-sm">{quote.uuid}</p>
            </div>
            <div>
              <p className="text-white text-sm">Expiry</p>
              <p className="text-white text-sm">
                {calculatedExpiryDate ? calculatedExpiryDate.toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex flex-col text-gray-700 font-semibold">
                Extend Expiry Date
                <input
                  type="date"
                  className="border rounded px-3 py-2 w-full sm:w-48 mt-1 shadow-sm focus:ring-1 focus:ring-green-500"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                />
              </label>

              {statusMessage && (
                <p className={`mt-2 text-sm ${canToggleStatus ? "text-green-700" : "text-red-500"}`}>
                  {statusMessage}
                </p>
              )}
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Quote Send Status</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Sent to client:</span>{" "}
                  {quote.is_quote_sent_to_client ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-medium">Sent at:</span> {formatDateTime(quote.quote_sent_at)}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Contact Info</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <label className="flex flex-col w-full">
                First Name
                <input
                  className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                  value={quote.contact_first_name || ""}
                  onChange={(e) => setQuote({ ...quote, contact_first_name: e.target.value })}
                />
              </label>

              <label className="flex flex-col w-full">
                Last Name
                <input
                  className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                  value={quote.contact_last_name || ""}
                  onChange={(e) => setQuote({ ...quote, contact_last_name: e.target.value })}
                />
              </label>

              <label className="flex flex-col w-full">
                Mobile
                <div className="flex gap-2 w-full">
                  <select
                    className="border rounded px-3 py-2 w-auto min-w-[5.5rem]"
                    value={mobileCountry}
                    onChange={(e) => setMobileCountry(e.target.value)}
                  >
                    {Object.entries(COUNTRY_CODES).map(([country, code]) => (
                      <option key={country} value={code}>
                        {country} ({code})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="021..."
                    className="border rounded px-3 py-2 flex-1 w-full min-w-[10rem]"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                  />
                </div>
              </label>

              <label className="flex flex-col w-full">
                Email
                <input
                  type="email"
                  className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                  value={quote.contact_email || ""}
                  onChange={(e) => setQuote({ ...quote, contact_email: e.target.value })}
                />
              </label>

              <label className="flex flex-col w-full">
                Landline
                <div className="flex gap-2 w-full">
                  <select
                    className="border rounded px-3 py-2 w-auto min-w-[5.5rem]"
                    value={landlineCountry}
                    onChange={(e) => setLandlineCountry(e.target.value)}
                  >
                    {Object.entries(COUNTRY_CODES).map(([country, code]) => (
                      <option key={country} value={code}>
                        {country} ({code})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="04..."
                    className="border rounded px-3 py-2 flex-1 w-full min-w-[10rem]"
                    value={landlineNumber}
                    onChange={(e) => setLandlineNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                  />
                </div>
              </label>

              <label className="flex flex-col w-full">
                Preferred Contact Method
                <select
                  className="border rounded px-3 py-3 w-full shadow-sm focus:ring-1 focus:ring-green-500 hover:cursor-pointer"
                  value={quote.preferred_contact_method || ""}
                  onChange={(e) =>
                    setQuote({
                      ...quote,
                      preferred_contact_method: e.target.value as
                        | "mobile"
                        | "landline"
                        | "email"
                        | "",
                    })
                  }
                >
                  <option value="">Select preferred contact method</option>
                  <option value="mobile">Mobile</option>
                  <option value="landline">Landline</option>
                  <option value="email">Email</option>
                </select>
              </label>
            </div>
          </section>

          {quote.message && quote.message.trim() && (
            <section className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">Message from Customer</h2>
              <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-800 whitespace-pre-wrap break-words">
                {quote.message}
              </div>
            </section>
          )}

          <section className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Message from Owner / Staff</h2>
            <textarea
              value={quote.employer_message || ""}
              onChange={(e) => setQuote({ ...quote, employer_message: e.target.value })}
              placeholder="Add a message for the client..."
              className="w-full min-h-[130px] border rounded-lg px-4 py-3 shadow-sm focus:ring-1 focus:ring-green-500 resize-y"
            />
            <p className="text-sm text-gray-500 mt-2">
              This message will be saved with the quote and included when the quote is sent to the
              client.
            </p>
          </section>

          <section className="mb-6 border-b border-gray-300 pb-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Services</h2>

            {!canSendQuote && sendBlockReason && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {sendBlockReason}
              </div>
            )}

            <div className="sm:hidden space-y-3">
              {quote.services.map((s, i) => {
                const missingPrice =
                  s.unit_price === null ||
                  s.unit_price === undefined ||
                  Number(s.unit_price) <= 0;

                const isUrgentRow = isUrgentFeeService(s);

                return (
                  <div
                    key={i}
                    className={`border rounded-lg shadow-sm overflow-hidden ${
                      missingPrice ? "border-red-400" : ""
                    } ${isUrgentRow ? "ring-1 ring-amber-300" : ""}`}
                  >
                    <div
                      className={`flex items-center justify-between font-semibold px-4 py-2 gap-2 ${
                        isUrgentRow
                          ? "bg-gradient-to-r from-amber-100 to-amber-300 text-amber-900"
                          : "bg-gradient-to-r from-green-200 to-green-400 text-green-900"
                      }`}
                    >
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
                      <div className="flex justify-between items-center">
                        <span>Quantity:</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={s.quantity}
                          className="border rounded px-2 py-1 w-20 text-right"
                          onChange={(e) => handleServiceChange(i, "quantity", e.target.value)}
                        />
                      </div>

                      <div className="flex justify-between items-start gap-2">
                        <span>Unit Price ($):</span>
                        <div className="flex flex-col items-end">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={s.unit_price === 0 ? "" : s.unit_price}
                            placeholder="0"
                            className={`border rounded px-2 py-1 w-24 text-right shadow-sm focus:ring-1 focus:ring-green-500 ${
                              missingPrice ? "border-red-500" : ""
                            }`}
                            onChange={(e) => handleServiceChange(i, "unit_price", e.target.value)}
                          />
                          {missingPrice && (
                            <span className="text-xs text-red-500 mt-1">
                              Required before sending
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between font-semibold">
                        <span>{isUrgentRow ? "Urgent Fee:" : "Subtotal:"}</span>
                        <span>${(Number(s.quantity) * Number(s.unit_price)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden sm:block">
              <table className="w-full table-auto rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-green-200 to-green-400 text-green-900">
                    <th className="px-4 py-2 text-left">Service</th>
                    <th className="border px-4 py-2 text-left">Image</th>
                    <th className="border px-4 py-2 text-right">Quantity</th>
                    <th className="border px-4 py-2 text-right">Unit Price ($)</th>
                    <th className="px-4 py-2 text-right">Subtotal ($)</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {quote.services.map((s, i) => {
                    const missingPrice =
                      s.unit_price === null ||
                      s.unit_price === undefined ||
                      Number(s.unit_price) <= 0;

                    const isUrgentRow = isUrgentFeeService(s);

                    return (
                      <tr
                        key={i}
                        className={`hover:bg-gray-50 ${
                          missingPrice ? "bg-red-50" : ""
                        } ${isUrgentRow ? "bg-amber-50" : ""}`}
                      >
                        <td className="border px-4 py-2 text-left">
                          <div className="flex items-center gap-2">
                            <span>{s.label}</span>
                            {isUrgentRow && (
                              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                Urgent Fee
                              </span>
                            )}
                          </div>
                        </td>

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
                            type="number"
                            min="1"
                            step="1"
                            value={s.quantity}
                            className="border rounded px-2 py-1 w-20 text-right shadow-sm focus:ring-1 focus:ring-green-500"
                            onChange={(e) => handleServiceChange(i, "quantity", e.target.value)}
                          />
                        </td>

                        <td className="border px-4 py-2 text-right">
                          <div className="flex flex-col items-end">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={s.unit_price === 0 ? "" : s.unit_price}
                              placeholder="0"
                              className={`border rounded px-2 py-1 w-24 text-right shadow-sm focus:ring-1 focus:ring-green-500 ${
                                missingPrice ? "border-red-500" : ""
                              }`}
                              onChange={(e) => handleServiceChange(i, "unit_price", e.target.value)}
                            />
                            {missingPrice && (
                              <span className="text-xs text-red-500 mt-1">
                                Required before sending
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="border px-4 py-2 text-right">
                          {(Number(s.quantity) * Number(s.unit_price)).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6 flex flex-col sm:flex-row justify-end gap-4">
            <div className="w-full sm:w-72 border rounded-lg p-4 bg-white shadow-sm space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Services:</span>
                <span>${totalsBreakdown.servicesSubtotal.toFixed(2)}</span>
              </div>

              {totalsBreakdown.separateUrgentFee > 0 && (
                <div className="flex justify-between font-semibold text-amber-700">
                  <span>Urgent Fee:</span>
                  <span>${totalsBreakdown.separateUrgentFee.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Subtotal:</span>
                <span>${totalsBreakdown.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-semibold">
                <span>GST (15%):</span>
                <span>${totalsBreakdown.gst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-green-900 text-lg">
                <span>Total:</span>
                <span>${totalsBreakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col sm:flex-row gap-4 justify-end">
            <select
              value={quote.status}
              disabled={!canToggleStatus}
              onChange={(e) => setQuote({ ...quote, status: e.target.value })}
              className="border rounded px-3 py-2 shadow-sm focus:ring-1 focus:ring-green-500"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
            </select>

            <Button onClick={handleUpdateQuote} className="hover:cursor-pointer">
              Update Quote To Database Only
            </Button>

            <Button
              onClick={handleSendQuote}
              disabled={!canSendQuote}
              className="bg-green-600 text-white hover:bg-green-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Updated Quote To Client
            </Button>
          </section>

          {modalImage && (
            <div
              className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
              onClick={() => setModalImage(null)}
            >
              <img
                src={modalImage}
                alt="Quote Image"
                className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}