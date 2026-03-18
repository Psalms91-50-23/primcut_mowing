import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatFullName } from "@/utils/utils";

type QuoteService = {
  label?: string | null;
  value?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  line_total?: number | null;
  description?: string | null;
  code?: string | null;
  service_uuid?: string | null;
};

type QuoteImage = {
  url: string;
  label?: string | null;
};

type Quote = {
  uuid: string;
  status?: string | null;
  total_amount?: number | null;
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  expiry_end?: string | null;
  is_quote_sent_to_client?: boolean | null;
  quote_sent_at?: string | null;
  responded_at?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  contact_email?: string | null;
  contact_mobile?: string | null;
  contact_landline?: string | null;
  address?: string | null;
  message?: string | null;
  employer_message?: string | null;
  services?: QuoteService[] | null;
  images?: QuoteImage[] | null;
  recurrence_frequency?: string | null;
};

type JobRecurrence = {
  id: number;
  job_uuid: string;
  scheduled_at?: string | null;
  is_completed?: boolean;
  completed_date?: string | null;
  status?: string | null;
  is_deleted?: boolean;
  previous_status?: string | null;
  updated_at?: string | null;
};

type Job = {
  uuid: string;
  quote_uuid?: string | null;
  status?: string | null;
  scheduled_at?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  total_amount?: number | null;
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  job_address?: string | null;
  address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_completed?: boolean;
  completed_date?: string | null;
  is_recurring?: boolean;
  recurrence_frequency?: string | null;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  services?: QuoteService[] | null;
  job_images?: QuoteImage[] | null;
  job_recurrences?: JobRecurrence[] | null;
};

type Customer = {
  uuid: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  address?: string | null;
  mobile_phone?: string | null;
  landline_phone?: string | null;
  customer_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_via?: string | null;
  is_blacklisted?: boolean | null;
  blacklisted_reason?: string | null;
  quote_count?: number | null;
  active_quote_count?: number | null;
  job_count?: number | null;
  pending_job_count?: number | null;
  completed_job_count?: number | null;
  recurrence_count?: number | null;
  latest_quote_created_at?: string | null;
  latest_job_created_at?: string | null;
  next_scheduled_job_at?: string | null;
  latest_activity_at?: string | null;
  quotes?: Quote[];
  jobs?: Job[];
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatMoney(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("en-NZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusTone(status?: string | null) {
  const s = (status || "").toLowerCase();

  if (["accepted", "completed", "paid"].includes(s)) {
    return "bg-green-100 text-green-900";
  }

  if (["sent", "scheduled", "active"].includes(s)) {
    return "bg-blue-100 text-blue-900";
  }

  if (["draft", "pending"].includes(s)) {
    return "bg-yellow-100 text-yellow-900";
  }

  if (["expired", "declined"].includes(s)) {
    return "bg-red-100 text-red-900";
  }

  return "bg-gray-100 text-gray-900";
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function CustomerPage() {
  const router = useRouter();
  const { uuid } = router.query;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid || typeof uuid !== "string") return;

    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/uuid/${uuid}/details`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load customer");
        }

        setCustomer(data.customer || null);
      } catch (err) {
        console.error(err);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [uuid]);

  const fullName = useMemo(() => {
    return (
      formatFullName(
        customer?.first_name ?? undefined,
        customer?.last_name ?? undefined,
        true
      ) || "Unnamed customer"
    );
  }, [customer]);

  if (loading) {
    return <p className="p-10">Loading customer...</p>;
  }

  if (!customer) {
    return <p className="p-10">Customer not found</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
            <p className="text-sm text-gray-500 mt-1">Customer UUID: {customer.uuid}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {customer.is_blacklisted ? (
              <span className="text-xs font-semibold px-3 py-2 rounded bg-red-100 text-red-900">
                Blacklisted
              </span>
            ) : (
              <span className="text-xs font-semibold px-3 py-2 rounded bg-green-100 text-green-900">
                Active
              </span>
            )}

            {customer.customer_type ? (
              <span className="text-xs font-semibold px-3 py-2 rounded bg-gray-100 text-gray-900">
                Type: {customer.customer_type}
              </span>
            ) : null}

            {customer.created_via ? (
              <span className="text-xs font-semibold px-3 py-2 rounded bg-blue-100 text-blue-900">
                Created via: {customer.created_via}
              </span>
            ) : null}
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-gray-900">{customer.email || "—"}</p>
              </div>

              <div>
                <p className="text-gray-500">Address</p>
                <p className="text-gray-900">{customer.address || "—"}</p>
              </div>

              <div>
                <p className="text-gray-500">Mobile</p>
                <p className="text-gray-900">{customer.mobile_phone || "—"}</p>
              </div>

              <div>
                <p className="text-gray-500">Landline</p>
                <p className="text-gray-900">{customer.landline_phone || "—"}</p>
              </div>

              <div>
                <p className="text-gray-500">Created</p>
                <p className="text-gray-900">{formatDateTime(customer.created_at)}</p>
              </div>

              <div>
                <p className="text-gray-500">Updated</p>
                <p className="text-gray-900">{formatDateTime(customer.updated_at)}</p>
              </div>
            </div>

            {customer.is_blacklisted && customer.blacklisted_reason ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-900">Blacklist Reason</p>
                <p className="text-sm text-red-800 mt-1">{customer.blacklisted_reason}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryStat label="Quotes" value={customer.quote_count ?? customer.quotes?.length ?? 0} />
          <SummaryStat
            label="Active Quotes"
            value={customer.active_quote_count ?? 0}
          />
          <SummaryStat label="Jobs" value={customer.job_count ?? customer.jobs?.length ?? 0} />
          <SummaryStat label="Pending Jobs" value={customer.pending_job_count ?? 0} />
          <SummaryStat label="Completed Jobs" value={customer.completed_job_count ?? 0} />
          <SummaryStat label="Recurrences" value={customer.recurrence_count ?? 0} />
          <SummaryStat
            label="Next Scheduled Job"
            value={formatDateOnly(customer.next_scheduled_job_at)}
          />
          <SummaryStat
            label="Latest Activity"
            value={formatDateTime(customer.latest_activity_at)}
          />
        </section>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Latest Quote Created</p>
                <p className="text-gray-900">{formatDateTime(customer.latest_quote_created_at)}</p>
              </div>

              <div>
                <p className="text-gray-500">Latest Job Created</p>
                <p className="text-gray-900">{formatDateTime(customer.latest_job_created_at)}</p>
              </div>

              <div>
                <p className="text-gray-500">Next Scheduled Job</p>
                <p className="text-gray-900">{formatDateTime(customer.next_scheduled_job_at)}</p>
              </div>

              <div>
                <p className="text-gray-500">Latest Activity</p>
                <p className="text-gray-900">{formatDateTime(customer.latest_activity_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-gray-900">Quotes</h2>
          <span className="text-sm text-gray-500">
            {customer.quotes?.length ?? 0} quote{(customer.quotes?.length ?? 0) === 1 ? "" : "s"}
          </span>
        </div>

        {customer.quotes?.length ? (
          <div className="space-y-4">
            {customer.quotes.map((q) => (
              <Card key={q.uuid} className="rounded-2xl shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Quote UUID: {q.uuid}</p>
                      <p className="text-sm text-gray-500">
                        Created: {formatDateTime(q.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${statusTone(q.status)}`}>
                        {q.status || "unknown"}
                      </span>

                      {q.is_quote_sent_to_client ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-900">
                          Sent to client
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-900">
                          Not sent
                        </span>
                      )}

                      {q.recurrence_frequency ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-900">
                          {q.recurrence_frequency}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Subtotal</p>
                      <p className="text-gray-900">${formatMoney(q.subtotal_amount)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">GST</p>
                      <p className="text-gray-900">${formatMoney(q.gst_amount)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="text-gray-900">${formatMoney(q.total_amount)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Expiry</p>
                      <p className="text-gray-900">{formatDateTime(q.expiry_end)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Contact Name</p>
                      <p className="text-gray-900">
                        {formatFullName(
                          q.contact_first_name ?? undefined,
                          q.contact_last_name ?? undefined,
                          true
                        ) || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Contact Email</p>
                      <p className="text-gray-900">{q.contact_email || "—"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Mobile</p>
                      <p className="text-gray-900">{q.contact_mobile || "—"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Landline</p>
                      <p className="text-gray-900">{q.contact_landline || "—"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Quote Sent At</p>
                      <p className="text-gray-900">{formatDateTime(q.quote_sent_at)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Responded At</p>
                      <p className="text-gray-900">{formatDateTime(q.responded_at)}</p>
                    </div>
                  </div>

                  {q.address ? (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{q.address}</p>
                    </div>
                  ) : null}

                  {q.message ? (
                    <div>
                      <p className="text-sm text-gray-500">Customer Message</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{q.message}</p>
                    </div>
                  ) : null}

                  {q.employer_message ? (
                    <div>
                      <p className="text-sm text-gray-500">Employer Message</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {q.employer_message}
                      </p>
                    </div>
                  ) : null}

                  {q.services?.length ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Services</p>
                      <div className="space-y-2">
                        {q.services.map((service, index) => (
                          <div
                            key={`${q.uuid}-service-${index}`}
                            className="rounded-xl border bg-gray-50 p-3 text-sm"
                          >
                            <p className="font-medium text-gray-900">
                              {service.label || service.value || service.code || "Service"}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-gray-600">
                              <p>Qty: {service.quantity ?? "—"}</p>
                              <p>Unit: ${formatMoney(service.unit_price ?? null)}</p>
                              <p>Line: ${formatMoney(service.line_total ?? null)}</p>
                              <p>ID: {service.service_uuid || "—"}</p>
                            </div>
                            {service.description ? (
                              <p className="mt-2 text-gray-700">{service.description}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {q.images?.length ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Images</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {q.images.map((img, index) => (
                          <a
                            key={`${q.uuid}-img-${index}`}
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border overflow-hidden bg-white hover:shadow transition"
                          >
                            <img
                              src={img.url}
                              alt={img.label || `Quote image ${index + 1}`}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-2 text-sm text-gray-700">
                              {img.label || "Image"}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => router.push(`/dashboard/employee/quotes/uuid/${q.uuid}/details`)}
                    >
                      Open Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">No quotes found for this customer.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-gray-900">Jobs</h2>
          <span className="text-sm text-gray-500">
            {customer.jobs?.length ?? 0} job{(customer.jobs?.length ?? 0) === 1 ? "" : "s"}
          </span>
        </div>

        {customer.jobs?.length ? (
          <div className="space-y-4">
            {customer.jobs.map((j) => (
              <Card key={j.uuid} className="rounded-2xl shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Job UUID: {j.uuid}</p>
                      <p className="text-sm text-gray-500">
                        Created: {formatDateTime(j.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${statusTone(j.status)}`}>
                        {j.status || "unknown"}
                      </span>

                      {j.is_recurring ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-900">
                          Recurring
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-900">
                          One-off
                        </span>
                      )}

                      {j.is_completed ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-900">
                          Completed
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Quote UUID</p>
                      <p className="text-gray-900">{j.quote_uuid || "—"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Scheduled At</p>
                      <p className="text-gray-900">{formatDateTime(j.scheduled_at)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Window</p>
                      <p className="text-gray-900">
                        {j.scheduled_window_mins
                          ? `${j.scheduled_window_mins} mins`
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Completed Date</p>
                      <p className="text-gray-900">{formatDateTime(j.completed_date)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Subtotal</p>
                      <p className="text-gray-900">${formatMoney(j.subtotal_amount)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">GST</p>
                      <p className="text-gray-900">${formatMoney(j.gst_amount)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="text-gray-900">${formatMoney(j.total_amount)}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Updated</p>
                      <p className="text-gray-900">{formatDateTime(j.updated_at)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Frequency</p>
                      <p className="text-gray-900">{j.recurrence_frequency || "—"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Interval</p>
                      <p className="text-gray-900">{j.recurrence_interval ?? "—"}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Recurrence End Date</p>
                      <p className="text-gray-900">{formatDateOnly(j.recurrence_end_date)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Job Address</p>
                    <p className="text-sm text-gray-900">
                      {j.job_address || j.address || "—"}
                    </p>
                  </div>

                  {j.services?.length ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Services</p>
                      <div className="space-y-2">
                        {j.services.map((service, index) => (
                          <div
                            key={`${j.uuid}-service-${index}`}
                            className="rounded-xl border bg-gray-50 p-3 text-sm"
                          >
                            <p className="font-medium text-gray-900">
                              {service.label || service.value || service.code || "Service"}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-gray-600">
                              <p>Qty: {service.quantity ?? "—"}</p>
                              <p>Unit: ${formatMoney(service.unit_price ?? null)}</p>
                              <p>Line: ${formatMoney(service.line_total ?? null)}</p>
                              <p>ID: {service.service_uuid || "—"}</p>
                            </div>
                            {service.description ? (
                              <p className="mt-2 text-gray-700">{service.description}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {j.job_recurrences?.length ? (
                    <div className="mt-2 border-t pt-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Recurrences</p>

                      <div className="space-y-2">
                        {j.job_recurrences
                          .filter((r) => !r.is_deleted)
                          .map((r) => (
                            <div
                              key={r.id}
                              className="rounded-xl border bg-gray-50 p-3"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="text-gray-500">Scheduled:</span>{" "}
                                    <span className="font-medium text-gray-900">
                                      {formatDateTime(r.scheduled_at)}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Status:</span>{" "}
                                    <span className="text-gray-900">{r.status || "—"}</span>
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Completed:</span>{" "}
                                    <span className="text-gray-900">
                                      {r.is_completed ? "Yes" : "No"}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Completed Date:</span>{" "}
                                    <span className="text-gray-900">
                                      {formatDateTime(r.completed_date)}
                                    </span>
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${statusTone(
                                      r.status
                                    )}`}
                                  >
                                    {r.status || "unknown"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No recurrences</p>
                  )}

                  <div className="pt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => router.push(`/employee/jobs/uuid/${j.uuid}`)}
                    >
                      Open Job
                    </Button>

                    {j.quote_uuid ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/employee/quotes/uuid/${j.quote_uuid}/details`)
                        }
                      >
                        Open Linked Quote
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">No jobs found for this customer.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}