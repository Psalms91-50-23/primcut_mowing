import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/context/UIContext";

type Service = {
  label?: string;
  value?: string;
  quantity?: number;
  unit_price?: number;
};

type QuoteImage = {
  url: string;
  label?: string;
};

type JobRecurrence = {
  id: number;
  scheduled_at?: string | null;
  status?: string | null;
  is_completed?: boolean;
  is_deleted?: boolean;
  completed_date?: string | null;
};

type Job = {
  id: number;
  uuid: string;
  customer_uuid?: string;
  quote_uuid?: string;
  services?: Service[];
  total_amount?: number | null;
  scheduled_at?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
  completed_date?: string | null;
  is_completed?: boolean;
  is_deleted?: boolean;
  is_recurring?: boolean;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  recurrence_frequency?: string | null;
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  job_images?: QuoteImage[];
  previous_status?: string | null;
  job_address?: string | null;
  scheduled_window_mins?: number | null;
  job_recurrences?: JobRecurrence[];
};

type Quote = {
  id: number;
  uuid: string;
  customer_uuid?: string;
  services?: Service[];
  total_amount?: number | null;
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  images?: QuoteImage[];
  is_deleted?: boolean;
  expiry_start?: string | null;
  expiry_end?: string | null;
  is_expired?: boolean;
  is_active?: boolean;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  contact_email?: string | null;
  contact_mobile?: string | null;
  contact_landline?: string | null;
  message?: string | null;
  preferred_contact_method?: string | null;
  is_quote_sent_to_client?: boolean;
  quote_sent_at?: string | null;
  address?: string | null;
  responded_at?: string | null;
  sent_by_user_uuid?: string | null;
  sent_message_to_client?: string | null;
  finalized_at?: string | null;
  quote_pdf_url?: string | null;
  quote_pdf_version?: number | null;
  quote_version_reason?: string | null;
  employer_message?: string | null;
  stale_at?: string | null;
  previous_status?: string | null;
  job?: Job | null;
};

function formatCurrency(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "full",
  }).format(date);
}

function getStatusClasses(status?: string | null) {
  const value = (status || "").toLowerCase();

  if (["accepted", "completed", "active"].includes(value)) {
    return "bg-green-100 text-green-800 border-green-200";
  }

  if (["scheduled", "pending"].includes(value)) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (["draft"].includes(value)) {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }

  if (["rejected", "cancelled", "expired"].includes(value)) {
    return "bg-red-100 text-red-800 border-red-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="break-words text-sm text-slate-900 sm:text-right">{value}</span>
    </div>
  );
}

export default function DetailedQuote() {
  const router = useRouter();
  const { uuid } = router.query;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { openImage } = useUI();

  useEffect(() => {
    if (!router.isReady || !uuid || typeof uuid !== "string") return;

    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/employee/quotes/${uuid}/details`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load quote");
        }

        setQuote(data.quote || null);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Something went wrong while loading the quote");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [router.isReady, uuid]);

  const fullName = useMemo(() => {
    if (!quote) return "—";
    return [quote.contact_first_name, quote.contact_last_name].filter(Boolean).join(" ") || "—";
  }, [quote]);

  const services = quote?.services || [];
  const job = quote?.job || null;
  const recurrences = (job?.job_recurrences || []).filter((r) => !r.is_deleted);

  const handleEditJob = () => {
    if (!job?.uuid) return;
    router.push(`/employee/jobs/uuid/${job.uuid}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-40 rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="h-6 w-40 rounded bg-slate-200" />
              <div className="mt-6 space-y-4">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-5/6 rounded bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-200" />
              </div>
            </div>

            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-6 w-32 rounded bg-slate-200" />
              <div className="mt-6 space-y-4">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-4/5 rounded bg-slate-200" />
                <div className="h-4 w-3/5 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Unable to load quote</h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.back()}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Go Back
              </button>

              <button
                onClick={() => router.reload()}
                className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Quote not found</h1>
            <p className="mt-2 text-sm text-slate-600">
              The quote you are trying to view does not exist or is unavailable.
            </p>

            <button
              onClick={() => router.back()}
              className="mt-6 rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Quote Details
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Quote {quote.uuid}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Created {formatDate(quote.created_at)} • Updated {formatDate(quote.updated_at)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  quote.status
                )}`}
              >
                {quote.status || "Unknown"}
              </span>

              {quote.is_quote_sent_to_client && (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Sent to Client
                </span>
              )}

              {quote.is_expired && (
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  Expired
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left content */}
          <div className="space-y-6 xl:col-span-2">
            {/* Customer */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Customer Information</h2>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{fullName}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Preferred Contact
                  </p>
                  <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                    {quote.preferred_contact_method || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {quote.contact_email || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mobile
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {quote.contact_mobile || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Property Address
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {quote.address || "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* Services */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Quoted Services</h2>
                <span className="text-sm text-slate-500">
                  {services.length} {services.length === 1 ? "item" : "items"}
                </span>
              </div>

              {services.length > 0 ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Service</th>
                          <th className="px-4 py-3 font-semibold">Qty</th>
                          <th className="px-4 py-3 font-semibold">Unit Price</th>
                          <th className="px-4 py-3 text-right font-semibold">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {services.map((service, index) => {
                          const qty = Number(service.quantity || 0);
                          const unitPrice = Number(service.unit_price || 0);
                          const lineTotal = qty * unitPrice;

                          return (
                            <tr key={`${service.value || service.label || "service"}-${index}`}>
                              <td className="px-4 py-3 text-slate-900">
                                {service.label || "Service"}
                              </td>
                              <td className="px-4 py-3 text-slate-700">{qty || "—"}</td>
                              <td className="px-4 py-3 text-slate-700">
                                {formatCurrency(unitPrice)}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-slate-900">
                                {formatCurrency(lineTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No services attached to this quote.
                </div>
              )}
            </section>

            {/* Images */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Quote Images</h2>

              {quote.images && quote.images.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {quote.images.map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      onClick={() => openImage(image.url)}
                      className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left transition hover:cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <div className="relative">
                        <img
                          src={image.url}
                          alt={image.label || `Quote image ${index + 1}`}
                          className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />

                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                        <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                          Click to enlarge
                        </div>
                      </div>

                      <div className="border-t border-slate-200 bg-white px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {image.label || `Image ${index + 1}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No images uploaded for this quote.
                </div>
              )}
            </section>

            {/* Job */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Linked Job</h2>

                {job?.uuid && (
                  <button
                    type="button"
                    onClick={handleEditJob}
                    className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    Edit Job Schedule
                  </button>
                )}
              </div>

              {job ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Job UUID</p>
                        <p className="text-base font-semibold text-slate-900">{job.uuid}</p>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          job.status
                        )}`}
                      >
                        {job.status || "Unknown"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {formatCurrency(job.total_amount)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Scheduled At
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {formatDate(job.scheduled_at)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Recurring
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {job.is_recurring ? "Yes" : "No"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Arrival Window
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {job.scheduled_window_mins ? `${job.scheduled_window_mins} mins` : "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Job Address
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {job.job_address || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-5">
                    <h3 className="text-base font-semibold text-slate-900">Recurrences</h3>

                    {recurrences.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {recurrences.map((recurrence) => (
                          <div
                            key={recurrence.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Scheduled
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {formatDate(recurrence.scheduled_at)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Status
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {recurrence.status || "—"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Completed
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {recurrence.is_completed ? "Yes" : "No"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                        No recurrences for this job.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No job has been linked to this quote yet.
                </div>
              )}
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Quote Summary</h2>

              <div className="mt-4">
                <StatRow label="Quote UUID" value={quote.uuid || "—"} />
                <StatRow label="Customer UUID" value={quote.customer_uuid || "—"} />
                <StatRow label="Status" value={quote.status || "—"} />
                <StatRow label="Subtotal" value={formatCurrency(quote.subtotal_amount)} />
                <StatRow label="GST" value={formatCurrency(quote.gst_amount)} />
                <StatRow
                  label="Total"
                  value={<span className="font-semibold">{formatCurrency(quote.total_amount)}</span>}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>

              <div className="mt-4">
                <StatRow label="Created" value={formatDate(quote.created_at)} />
                <StatRow label="Updated" value={formatDate(quote.updated_at)} />
                <StatRow label="Expires" value={formatDateOnly(quote.expiry_end)} />
                <StatRow
                  label="Sent to Client"
                  value={quote.is_quote_sent_to_client ? "Yes" : "No"}
                />
                <StatRow label="Quote Sent At" value={formatDate(quote.quote_sent_at)} />
                 <StatRow label="Responded At" value={formatDate(quote.responded_at)} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Notes</h2>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer Message
                  </p>
                  <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    {quote.message || "No message provided."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employer Message
                  </p>
                  <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    {quote.employer_message || "No internal note provided."}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}