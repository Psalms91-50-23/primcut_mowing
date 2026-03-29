import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type Service = {
  label?: string;
  value?: string;
  quantity?: number;
  unit_price?: number;
};

type JobImage = {
  url: string;
  label?: string;
};

type CustomerPreview = {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
};

type JobRecurrence = {
  uuid?: string;
  scheduled_at?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  status?: string | null;
  is_completed?: boolean;
  completed_date?: string | null;
};

type JobRecord = {
  uuid?: string;
  status?: string | null;
  services?: Service[];
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  total_amount?: number | null;
  has_urgent_fee?: boolean;
  urgent_fee_amount?: number | null;
  scheduled_at?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  is_recurring?: boolean;
  recurrence_frequency?: string | null;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  recurrence_summary?: string | null;
  recurrence_count?: number | null;
  job_address?: string | null;
  client_schedule_message?: string | null;
  is_completed?: boolean;
  completed_date?: string | null;
  job_images?: JobImage[];
  customer?: CustomerPreview | null;
  job_recurrences?: JobRecurrence[];
  limited?: boolean;
};

function formatMoney(value?: number | string | null) {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (typeof num !== "number" || Number.isNaN(num)) return "—";
  return `$${num.toFixed(2)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "To be confirmed";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "To be confirmed";
  return d.toLocaleString("en-NZ", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

function getWindowLabel(windowPreset?: string | null, windowMins?: number | null) {
  const presetMap: Record<string, string> = {
    anytime: "Anytime (9am–5pm)",
    morning: "Morning (9am–12pm)",
    midday: "Midday (12pm–3pm)",
    afternoon: "Afternoon (3pm–5pm)",
    "2hour": "2-hour arrival window",
    "3hour": "3-hour arrival window",
  };

  if (windowPreset && presetMap[windowPreset]) {
    return presetMap[windowPreset];
  }

  if (windowMins && Number(windowMins) > 0) {
    return `${Number(windowMins)} minute arrival window`;
  }

  return "Arrival window to be confirmed";
}

function formatStatusLabel(status?: string | null) {
  if (!status) return "";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
      {children}
    </span>
  );
}

function Card({
  title,
  children,
  subtitle,
  alignmentText
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  alignmentText?: "left" | "right" | "center";
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className={`text-lg font-semibold text-gray-900 ${alignmentText === "right" ? "text-right" : alignmentText === "center" ? "text-center" : "text-left"}`}>{title}</h2>
        {subtitle ? <p className={`mt-1 text-sm text-gray-600 ${alignmentText === "right" ? "text-right" : alignmentText === "center" ? "text-center" : "text-left"}`}>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  alignmentText
}: {
  label: string;
  value?: React.ReactNode;
  alignmentText?: "left" | "right" | "center";
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className={`text-[11px] font-semibold uppercase tracking-wide text-gray-500 ${alignmentText === "right" ? "text-right" : alignmentText === "center" ? "text-center" : "text-left"}` }>{label}</p>
      <div className={`mt-1 break-words text-sm text-gray-900 ${alignmentText === "right" ? "text-right" : alignmentText === "center" ? "text-center" : "text-left"}`}>
        {value || "—"}
      </div>
    </div>
  );
}

export default function CustomerJobViewPage() {
  const router = useRouter();
  const { uuid } = router.query;

  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid || typeof uuid !== "string") return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch(`/api/jobs/${uuid}/public-view`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Unable to load job details");
        }

        setJob(data?.job || null);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err?.message || "Unable to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [uuid]);

  const customerName = useMemo(() => {
    const fullName = job?.customer?.full_name?.trim();
    if (fullName) return fullName;

    const combinedName = [job?.customer?.first_name, job?.customer?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    return combinedName || "Customer";
  }, [job]);

  const services = useMemo(() => {
    return Array.isArray(job?.services) ? job.services : [];
  }, [job]);

  const urgentFeeAmount = useMemo(() => {
    return Number(job?.urgent_fee_amount ?? 0);
  }, [job]);

  const hasUrgentFee = useMemo(() => {
    return Boolean(job?.has_urgent_fee) && urgentFeeAmount > 0;
  }, [job, urgentFeeAmount]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Job Details | Happy Property</title>
        </Head>

        <main className="min-h-screen bg-gray-50 px-4 py-10">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-72 animate-pulse rounded bg-gray-200" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (errorMsg || !job) {
    return (
      <>
        <Head>
          <title>Job Not Available | Happy Property</title>
        </Head>

        <main className="min-h-screen bg-gray-50 px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900">Job details unavailable</h1>
              <p className="mt-3 text-sm text-gray-600">
                {errorMsg || "This job could not be loaded."}
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Job ${job.uuid || ""} | Happy Property`}</title>
        <meta name="description" content="View your job schedule and service details." />
      </Head>

      <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Job Details</h1>
                  {job.status ? <StatusBadge>{formatStatusLabel(job.status)}</StatusBadge> : null}
                  {job.is_completed ? <StatusBadge>Completed</StatusBadge> : null}
                  {hasUrgentFee ? <StatusBadge>Urgent Service</StatusBadge> : null}
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Reference: <span className="font-medium text-gray-900">{job.uuid || "—"}</span>
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Hello {customerName}, here are your current job details.
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-900">
                <p className="font-semibold">Scheduled date</p>
                <p className="mt-1">
                  {job.scheduled_at ? formatDate(job.scheduled_at) : "To be confirmed"}
                </p>
              </div>
            </div>
          </section>

          {job.client_schedule_message ? (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-green-900">Message from our team</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-green-900">
                {job.client_schedule_message}
              </p>
            </section>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card
                title="Schedule"
                subtitle="Your current booking date and expected arrival window."
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field
                    label="Scheduled date"
                    value={job.scheduled_at ? formatDate(job.scheduled_at) : "To be confirmed"}
                  />
                  {/* <Field
                    label="Date & time reference"
                    value={job.scheduled_at ? formatDateTime(job.scheduled_at) : "To be confirmed"}
                  /> */}
                  <Field
                    label="Arrival window"
                    value={getWindowLabel(job.scheduled_window_preset, job.scheduled_window_mins)}
                  />
                  <Field
                    label="Service type"
                    value={job.is_recurring ? job.recurrence_summary || "Recurring" : "One-off"}
                  />
                </div>
              </Card>

              <Card title="Services" subtitle="The services currently scheduled for this job.">
                {services.length > 0 ? (
                  <div className="space-y-3">
                    {services.map((service, index) => {
                      const quantity = Number(service?.quantity || 1);
                      const unitPrice = Number(service?.unit_price || 0);
                      const lineTotal = quantity * unitPrice;

                      return (
                        <div
                          key={`${service?.label || service?.value || "service"}-${index}`}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {service?.label || service?.value || `Service ${index + 1}`}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">Quantity: {quantity}</p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatMoney(lineTotal)}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Unit: {formatMoney(unitPrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {hasUrgentFee ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-red-900">Urgent service fee</p>
                            <p className="mt-1 text-xs text-red-700">
                              Applied due to priority scheduling.
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-red-900">
                            {formatMoney(urgentFeeAmount)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No services are listed for this job yet.</p>
                )}
              </Card>

              <Card title="Images" subtitle="Photos attached to this job.">
                {job.job_images?.length ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {job.job_images.map((image, index) => (
                      <a
                        key={`${image.url}-${index}`}
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-green-400 hover:shadow-sm"
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={image.url}
                            alt={image.label || `Job image ${index + 1}`}
                            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="border-t border-gray-100 px-3 py-2">
                          <p className="truncate text-xs font-medium text-gray-700">
                            {image.label || `Image ${index + 1}`}
                          </p>
                          <p className="mt-1 text-[11px] text-green-700">Open full image</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No images are attached to this job.</p>
                )}
              </Card>

              {job.is_recurring && job.job_recurrences?.length ? (
                <Card
                  title="Upcoming schedule"
                  subtitle="Future scheduled visits for this recurring job."
                >
                  <div className="space-y-3">
                    {job.job_recurrences.map((recurrence, index) => (
                      <div
                        key={recurrence.uuid || `recurrence-${index}`}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Visit {index + 1}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {recurrence.scheduled_at
                                ? formatDateTime(recurrence.scheduled_at)
                                : "To be confirmed"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {recurrence.status ? (
                              <StatusBadge>{formatStatusLabel(recurrence.status)}</StatusBadge>
                            ) : null}
                            {recurrence.is_completed ? <StatusBadge>Completed</StatusBadge> : null}
                          </div>
                        </div>

                        <div className="mt-3">
                          <Field
                            label="Arrival window"
                            value={getWindowLabel(
                              recurrence.scheduled_window_preset,
                              recurrence.scheduled_window_mins
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>

            <div className="space-y-6">
              <Card title="Summary">
                <div className="space-y-3">
                  <Field label="Customer" value={customerName} />
                  <Field label="Property address" value={job.job_address || "—"} />
                  <Field
                    label="Recurring visits"
                    value={job.is_recurring ? job.recurrence_count ?? 0 : "No"}
                  />
                </div>
              </Card>

              <Card title="Pricing">
                <div className="space-y-3">
                  <Field label="Subtotal" value={formatMoney(job.subtotal_amount)} />
                  <Field label="GST"  value={formatMoney(job.gst_amount)} />
                  {hasUrgentFee ? (
                    <Field label="Urgent fee"  value={formatMoney(urgentFeeAmount)} />
                  ) : null}
                  <Field label="Total" value={formatMoney(job.total_amount)} />
                </div>
              </Card>

              <Card title="Need help?">
                <p className="text-sm leading-6 text-gray-600">
                  If any of these details look incorrect or you need to contact us about this job,
                  please reply to the email you received and our team will assist you.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}