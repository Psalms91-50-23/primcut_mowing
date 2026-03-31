import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { getWindowPreview } from "@/utils/windowPreview";
import { useUI } from "@/context/UIContext";
import { useAuth, roleRedirectMap } from "@/context/AuthContext";
import { formatDateOnly, pad, toDatetimeLocalValue, toDateLocalValue, localDatetimeToISO, getWindowLabel, localDateToDB } from "@/utils/utils";


type RecurrencePreset = "one_off" | "weekly" | "fortnightly" | "monthly";

type WindowOption = {
  value: string;
  label: string;
  mins: number;
  description?: string;
};

type RecurrenceDraft = {
  scheduledLocal: string;
  scheduledWindowMins: number;
  windowPreset?: string;
  dirty: boolean;
  saving: boolean;
};

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type QuoteService = {
  label?: string;
  value?: string;
  quantity?: number;
  unit_price?: number;
};

type QuoteImage = {
  url: string;
  label?: string;
};

type QuoteRecord = {
  uuid?: string;
  status?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
  contact_mobile?: string;
  contact_landline?: string;
  address?: string;
  message?: string | null;
  employer_message?: string | null;
  services?: QuoteService[];
  images?: QuoteImage[];
  subtotal_amount?: number;
  gst_amount?: number;
  total_amount?: number;
  expiry_end?: string | null;
  created_at?: string | null;
  has_urgent_fee?: boolean;
  urgent_fee_amount?: number | null;
  recurrence_frequency?: RecurrencePreset | null;
};

type CustomerPreview = {
  uuid?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  mobile?: string | null;
  landline?: string | null;
  address?: string | null;
};

type JobImage = {
  url: string;
  label?: string;
};

type JobRecurrenceRecord = {
  id?: number;
  uuid?: string;
  job_uuid?: string;
  scheduled_at?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  schedule_label?: string | null;
  is_custom_schedule?: boolean;
  status?: string | null;
  is_completed?: boolean;
  completed_date?: string | null;
  previous_status?: string | null;
  updated_at?: string | null;
  services?: QuoteService[];
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  total_amount?: number | null;
  pricing_source?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
};

type JobRecord = {
  uuid?: string;
  customer_uuid?: string | null;
  quote_uuid?: string | null;
  status?: string | null;
  services?: QuoteService[];
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  total_amount?: number | null;
  has_urgent_fee?: boolean;
  urgent_fee_amount?: number | null;
  scheduled_at?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  schedule_label?: string | null;
  is_recurring?: boolean;
  recurrence_frequency?: string | null;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  recurrence_summary?: string | null;
  recurrence_count?: number | null;
  job_address?: string | null;
  notes?: string | null;
  client_schedule_message?: string | null;
  is_completed?: boolean;
  completed_date?: string | null;
  previous_status?: string | null;
  job_images?: JobImage[];
  created_at?: string | null;
  updated_at?: string | null;
  customer?: CustomerPreview | null;
  quote?: QuoteRecord | null;
  job_recurrences?: JobRecurrenceRecord[];
};

const WINDOW_OPTIONS: WindowOption[] = [
  { value: "anytime", label: "Anytime (9am–5pm)", mins: 480 },
  { value: "morning", label: "Morning (9am–12pm)", mins: 180 },
  { value: "midday", label: "Midday (12pm–3pm)", mins: 180 },
  { value: "afternoon", label: "Afternoon (3pm–5pm)", mins: 120 },
  // { value: "2hour", label: "2-hour window", mins: 120 },
  // { value: "3hour", label: "3-hour window", mins: 180 },
];

const RECURRENCE_PAGE_LIMIT = 5;
const EXTEND_OPTIONS = [3, 6, 12, 24];

function deriveRecurrencePresetFromJobOrQuote(
  job: JobRecord | null | undefined,
  quote: QuoteRecord | null | undefined
): RecurrencePreset {
  const fromJob = deriveRecurrencePreset(job);

  if (fromJob !== "one_off") {
    return fromJob;
  }

  const quoteFrequency = quote?.recurrence_frequency;

  if (
    quoteFrequency === "weekly" ||
    quoteFrequency === "fortnightly" ||
    quoteFrequency === "monthly"
  ) {
    return quoteFrequency;
  }

  return "one_off";
}

function presetToRecurrenceFields(preset: RecurrencePreset) {
  if (preset === "weekly") {
    return { is_recurring: true, recurrence_frequency: "weekly", recurrence_interval: 1 };
  }
  if (preset === "fortnightly") {
    return { is_recurring: true, recurrence_frequency: "fortnightly", recurrence_interval: 2 };
  }
  if (preset === "monthly") {
    return { is_recurring: true, recurrence_frequency: "monthly", recurrence_interval: 1 };
  }
  return { is_recurring: false, recurrence_frequency: null, recurrence_interval: null };
}

function prettyPreset(p: RecurrencePreset) {
  if (p === "one_off") return "One-off";
  if (p === "weekly") return "Weekly";
  if (p === "fortnightly") return "Fortnightly";
  if (p === "monthly") return "Monthly";
  return "Not recurring";
}

function clampWindowMins(n: any, fallback = 240) {
  const x = parseInt(String(n ?? ""), 10);
  if (Number.isNaN(x) || x <= 0) return fallback;
  return x;
}

function deriveRecurrencePreset(job: JobRecord | null | undefined): RecurrencePreset {
  const isRecurring = Boolean(job?.is_recurring);
  const freq = job?.recurrence_frequency;
  const interval = job?.recurrence_interval;

  if (!isRecurring) return "one_off";
  if (freq === "weekly" && interval === 1) return "weekly";
  if (freq === "fortnightly" && interval === 2) return "fortnightly";
  if (freq === "monthly" && interval === 1) return "monthly";

  if (freq === "weekly") return "weekly";
  if (freq === "fortnightly") return "fortnightly";
  if (freq === "monthly") return "monthly";

  return "one_off";
}

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
  return d.toLocaleDateString("en-NZ");
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-NZ");
}

function getRecurrenceKey(r: JobRecurrenceRecord) {
  return r.uuid || String(r.id || "");
}

function getRecurrencePatchId(r: JobRecurrenceRecord) {
  return r.id ?? r.uuid;
}

function buildRecurrenceDraft(r: JobRecurrenceRecord, job?: JobRecord | null): RecurrenceDraft {
  const mins = clampWindowMins(r?.scheduled_window_mins ?? job?.scheduled_window_mins, 240);

  return {
    scheduledLocal: toDatetimeLocalValue(r?.scheduled_at),
    scheduledWindowMins: mins,
    windowPreset: r?.scheduled_window_preset ?? job?.scheduled_window_preset ?? "anytime",
    dirty: false,
    saving: false,
  };
}

// -------------------- UI bits --------------------
function SkeletonLine() {
  return <div className="h-4 w-full animate-pulse rounded bg-gray-200" />;
}

function Spinner({
  size = "sm",
  label,
}: {
  size?: "sm" | "md";
  label?: string;
}) {
  const dims = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
      <span
        className={`${dims} animate-spin rounded-full border-2 border-gray-300 border-t-green-700`}
      />
      {label ? <span>{label}</span> : null}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
      {children}
    </span>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-900 ">{label}</label>
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer";
  const styles =
    variant === "primary"
      ? "bg-green-700 text-white hover:bg-green-800"
      : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:cursor-pointer";

  return (
    <button type={type} className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Alert({
  tone,
  title,
  message,
}: {
  tone: "error" | "success" | "info";
  title: string;
  message?: string | null;
}) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : tone === "success"
      ? "border-green-200 bg-green-50 text-green-900"
      : "border-gray-200 bg-gray-50 text-gray-900";

  return (
    <div className={`rounded-lg border p-3 ${styles}`}>
      <p className="text-sm font-semibold">{title}</p>
      {message ? <p className="mt-1 text-sm opacity-90">{message}</p> : null}
    </div>
  );
}

function ReadOnlyValue({
  label,
  value,
  textAlignedRight,
  paddingRight,
}: {
  label: string;
  value?: React.ReactNode;
  textAlignedRight?: boolean;
  paddingRight?: string;
}) {
  return (
    <div
      className={`${textAlignedRight ? "text-right" : ""} rounded-lg border border-gray-200 bg-gray-50 p-2 ${paddingRight || ""}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 break-words text-sm text-gray-900">{value || "—"}</div>
    </div>
  );
}

// -------------------- Page --------------------
export default function JobPage() {
  const router = useRouter();
  const { uuid } = router.query;
  const { openImage } = useUI();
  const { user, role } = useAuth();

  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [quote, setQuote] = useState<QuoteRecord | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [recurrences, setRecurrences] = useState<JobRecurrenceRecord[]>([]);
  const [recurrencesLoading, setRecurrencesLoading] = useState(false);
  const [recurrencePage, setRecurrencePage] = useState(1);
  const [pageDirection, setPageDirection] = useState<"next" | "prev" | null>(null);
  const [recurrencePagination, setRecurrencePagination] = useState<PaginationState>({
    page: 1,
    limit: RECURRENCE_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [scheduledDateLocal, setScheduledDateLocal] = useState("");
  const [scheduledWindowMins, setScheduledWindowMins] = useState<number>(240);
  const [scheduledWindowPreset, setScheduledWindowPreset] = useState<string>("anytime");
  const [recurrencePreset, setRecurrencePreset] = useState<RecurrencePreset>("one_off");
  const [endDateLocal, setEndDateLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [clientScheduleMessage, setClientScheduleMessage] = useState("");
  const [dirty, setDirty] = useState(false);

  const [recurrenceDrafts, setRecurrenceDrafts] = useState<Record<string, RecurrenceDraft>>({});

  const [extendCount, setExtendCount] = useState<number>(12);
  const [extending, setExtending] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [sendScheduleEmail, setSendScheduleEmail] = useState(false);
  const [notificationType, setNotificationType] = useState<"schedule_update" | "rescheduled">(
    "schedule_update"
  );

  const fetchJob = async () => {
    if (!uuid) return null;

    setLoading(true);

    try {
      const res = await fetch(`/api/employee/jobs/${uuid}/details`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load job");

      const j = (data.job || null) as JobRecord;
      console.log({j})
      setJob(j);
      setScheduledDateLocal(toDateLocalValue(j?.scheduled_at));
      setScheduledWindowMins(clampWindowMins(j?.scheduled_window_mins, 240));
      setScheduledWindowPreset(j?.scheduled_window_preset || "anytime");
      setRecurrencePreset(deriveRecurrencePreset(j));
      setEndDateLocal(toDateLocalValue(j?.recurrence_end_date));
      setNotes(j?.notes || "");
      setClientScheduleMessage(j?.client_schedule_message || "");
      setDirty(false);

      if (Array.isArray(j?.job_recurrences) && j.job_recurrences.length > 0) {
        setRecurrences(j.job_recurrences);
        setRecurrencePagination({
          page: 1,
          limit: RECURRENCE_PAGE_LIMIT,
          total: j.job_recurrences.length,
          totalPages: Math.max(1, Math.ceil(j.job_recurrences.length / RECURRENCE_PAGE_LIMIT)),
          hasNextPage: j.job_recurrences.length > RECURRENCE_PAGE_LIMIT,
          hasPrevPage: false,
        });

        setRecurrenceDrafts((prev) => {
          const next = { ...prev };
          for (const r of j.job_recurrences || []) {
            const key = getRecurrenceKey(r);
            if (!key) continue;
            next[key] = prev[key] || buildRecurrenceDraft(r, j);
          }
          return next;
        });
      }

      return j;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async (jobRecord?: JobRecord | null) => {
    const relatedQuoteUuid = jobRecord?.quote_uuid || jobRecord?.quote?.uuid;

    if (!relatedQuoteUuid) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const res = await fetch(`/api/quotes/${relatedQuoteUuid}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load quote");

      const fetchedQuote = (data?.quote || null) as QuoteRecord | null;
      setQuote(fetchedQuote);

      setRecurrencePreset((prev) => {
        const derived = deriveRecurrencePresetFromJobOrQuote(jobRecord, fetchedQuote);
        return prev === derived ? prev : derived;
      });
    } catch (err: any) {
      console.error(err);
      setQuoteError(err?.message || "Failed to load quote");

      const fallbackQuote = (jobRecord?.quote || null) as QuoteRecord | null;
      setQuote(fallbackQuote);

      setRecurrencePreset((prev) => {
        const derived = deriveRecurrencePresetFromJobOrQuote(jobRecord, fallbackQuote);
        return prev === derived ? prev : derived;
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  const fetchRecurrences = async (page = 1) => {
    if (!uuid) return;

    setRecurrencesLoading(true);

    try {
      const res = await fetch(
        `/api/employee/jobs/${uuid}/recurrences?page=${page}&limit=${RECURRENCE_PAGE_LIMIT}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load recurrences");

      const fetchedRecurrences = (data?.recurrences || []) as JobRecurrenceRecord[];

      setRecurrences(fetchedRecurrences);
      setRecurrencePagination(
        data?.pagination || {
          page,
          limit: RECURRENCE_PAGE_LIMIT,
          total: fetchedRecurrences.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );

      setRecurrenceDrafts((prev) => {
        const next = { ...prev };

        for (const r of fetchedRecurrences) {
          const key = getRecurrenceKey(r);
          if (!key) continue;

          next[key] = {
            scheduledLocal: toDatetimeLocalValue(r?.scheduled_at),
            scheduledWindowMins: clampWindowMins(
              r?.scheduled_window_mins ?? job?.scheduled_window_mins,
              240
            ),
            windowPreset:
              r?.scheduled_window_preset ??
              prev[key]?.windowPreset ??
              job?.scheduled_window_preset ??
              "anytime",
            dirty: false,
            saving: false,
          };
        }

        return next;
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to load recurrences");
    } finally {
      setRecurrencesLoading(false);
      setPageDirection(null);
    }
  };

  useEffect(() => {
    if (!uuid) return;

    (async () => {
      const loadedJob = await fetchJob();
      if (loadedJob) {
        await fetchQuote(loadedJob);
      }
    })();
  }, [uuid]);

  useEffect(() => {
    if (!uuid) return;
    fetchRecurrences(recurrencePage);
  }, [uuid, recurrencePage]);

  const resolvedQuote = useMemo(() => {
    return quote || job?.quote || null;
  }, [quote, job]);

  const resolvedCustomer = useMemo(() => {
    return job?.customer || null;
  }, [job]);

  const jobAddress = useMemo(() => {
    return job?.job_address || resolvedCustomer?.address || "—";
  }, [job, resolvedCustomer]);

  const quoteAddress = useMemo(() => {
    return resolvedQuote?.address || "—";
  }, [resolvedQuote]);

  const scheduledDateValue = useMemo(() => {
    return scheduledDateLocal || null;
  }, [scheduledDateLocal]);

  const scheduledPreview = useMemo(() => {
    if (!scheduledDateValue) return "Not set";
    return formatDateOnly(scheduledDateValue);
  }, [scheduledDateValue]);

  const masterWindowPreview = useMemo(() => {
    if (!scheduledDateValue) return "—";
    return getWindowLabel(scheduledWindowPreset ?? "anytime", scheduledWindowMins);
  }, [scheduledDateValue, scheduledWindowPreset, scheduledWindowMins]);

  const endDatePreview = useMemo(() => {
    if (!endDateLocal) return "No end date";
    return formatDateOnly(endDateLocal);
  }, [endDateLocal]);

    const resolvedQuoteUrgentFeeAmount = useMemo(() => {
      return Number(resolvedQuote?.urgent_fee_amount ?? 0);
    }, [resolvedQuote]);

  const resolvedJobUrgentFeeAmount = useMemo(() => {
    return Number(job?.urgent_fee_amount ?? 0);
  }, [job]);

  const resolvedQuoteHasUrgentFee = useMemo(() => {
    return Boolean(resolvedQuote?.has_urgent_fee) && resolvedQuoteUrgentFeeAmount > 0;
  }, [resolvedQuote, resolvedQuoteUrgentFeeAmount]);

  const resolvedJobHasUrgentFee = useMemo(() => {
    return Boolean(job?.has_urgent_fee) && resolvedJobUrgentFeeAmount > 0;
  }, [job, resolvedJobUrgentFeeAmount]);

  const canSave = dirty && !saving;
  const nextPageLoading = recurrencesLoading && pageDirection === "next";
  const prevPageLoading = recurrencesLoading && pageDirection === "prev";

  const dashboardPath =
    (role && roleRedirectMap[role]) ||
    (user?.role && roleRedirectMap[user.role]) ||
    "/dashboard";

  const handleBackToDashboard = () => {
    router.push(dashboardPath);
  };

  const handleBackToPreviousPage = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(dashboardPath);
  };

  const onSave = async () => {
    if (!uuid) return;

    if (!dirty) {
      setSuccessMsg("No changes to save.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const scheduled_date = localDateToDB(scheduledDateLocal);

      const { is_recurring, recurrence_frequency, recurrence_interval } =
        presetToRecurrenceFields(recurrencePreset);

      const recurrence_end_date =
        recurrencePreset !== "one_off" ? localDateToDB(endDateLocal) : null;

      console.log("PATCHING SCHEDULE", `/api/employee/jobs/${uuid}/schedule`);

      const res = await fetch(`/api/employee/jobs/${uuid}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "job",
          job: {
            scheduled_date,
            scheduled_window_mins: scheduled_date ? scheduledWindowMins : null,
            scheduled_window_preset: scheduled_date ? scheduledWindowPreset : null,
            is_recurring,
            recurrence_frequency,
            recurrence_interval,
            recurrence_end_date,
            notes,
            client_schedule_message: clientScheduleMessage || null,
            regenerate_recurrences: is_recurring,
            send_schedule_email: sendScheduleEmail,
            notification_type: notificationType,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update job");

      if (data?.emailSent) {
        setSuccessMsg(
          notificationType === "rescheduled"
            ? "Job updated and reschedule email sent to customer."
            : "Job updated and schedule email sent to customer."
        );
      } else if (sendScheduleEmail && data?.emailError) {
        setSuccessMsg(`Job updated, but email was not sent: ${data.emailError}`);
      } else {
        setSuccessMsg("Job updated.");
      }

      setSendScheduleEmail(false);
      setNotificationType("schedule_update");
      setRecurrencePage(1);

      const loadedJob = await fetchJob();
      if (loadedJob) await fetchQuote(loadedJob);
      await fetchRecurrences(1);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const onClear = async () => {
    if (!uuid) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      console.log("PATCHING SCHEDULE on clear", `/api/employee/jobs/${uuid}/schedule`);

      const res = await fetch(`/api/employee/jobs/${uuid}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "job",
          job: {
            scheduled_date: null,
            scheduled_window_mins: null,
            scheduled_window_preset: null,
            is_recurring: false,
            recurrence_frequency: null,
            recurrence_interval: null,
            recurrence_end_date: null,
            notes,
            client_schedule_message: clientScheduleMessage || null,
            regenerate_recurrences: false,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to clear schedule");

      setSuccessMsg("Schedule cleared.");
      setScheduledDateLocal("");
      setScheduledWindowMins(240);
      setScheduledWindowPreset("anytime");
      setRecurrencePreset("one_off");
      setEndDateLocal("");
      setDirty(false);
      setRecurrencePage(1);

      const loadedJob = await fetchJob();
      if (loadedJob) await fetchQuote(loadedJob);
      await fetchRecurrences(1);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to clear schedule");
    } finally {
      setSaving(false);
    }
  };

  const onExtendRecurrences = async () => {
    if (!uuid) return;

    setExtending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      console.log("PATCHING SCHEDULE POST", `/api/employee/jobs/${uuid}/schedule`);
      const res = await fetch(`/api/employee/jobs/${uuid}/recurrences/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: extendCount }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to extend recurrences");

      setSuccessMsg(
        `Added ${data?.insertedCount ?? extendCount} more recurrence${
          (data?.insertedCount ?? extendCount) === 1 ? "" : "s"
        }.`
      );

      setRecurrencePage(1);

      const loadedJob = await fetchJob();
      if (loadedJob) await fetchQuote(loadedJob);
      await fetchRecurrences(1);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to extend recurrences");
    } finally {
      setExtending(false);
    }
  };

  const updateRecurrenceDraft = (recurrenceKey: string, patch: Partial<RecurrenceDraft>) => {
    setRecurrenceDrafts((prev) => ({
      ...prev,
      [recurrenceKey]: {
        ...prev[recurrenceKey],
        ...patch,
      },
    }));
  };

  const onSaveRecurrence = async (recurrence: JobRecurrenceRecord) => {
    if (!uuid) return;

    const recurrenceKey = getRecurrenceKey(recurrence);
    const recurrenceId = getRecurrencePatchId(recurrence);
    if (!recurrenceKey || !recurrenceId) return;

    const draft = recurrenceDrafts[recurrenceKey];
    if (!draft) return;

    updateRecurrenceDraft(recurrenceKey, { saving: true });
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const scheduled_at = draft.scheduledLocal ? localDatetimeToISO(draft.scheduledLocal) : null;
      console.log("PATCHING SCHEDULE onSaveRecurrence", `/api/employee/jobs/${uuid}/schedule`);
      const res = await fetch(`/api/employee/jobs/${uuid}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "recurrence",
          recurrence: {
            id: recurrenceId,
            scheduled_at,
            scheduled_window_mins: scheduled_at ? draft.scheduledWindowMins : null,
            scheduled_window_preset: scheduled_at ? draft.windowPreset ?? "anytime" : null,
            is_custom_schedule: true,
            send_schedule_email: sendScheduleEmail,
            notification_type: notificationType,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update recurrence");

      if (data?.emailSent) {
        setSuccessMsg(
          notificationType === "rescheduled"
            ? "Recurrence updated and reschedule email sent to customer."
            : "Recurrence updated and schedule email sent to customer."
        );
      } else if (sendScheduleEmail && data?.emailError) {
        setSuccessMsg(`Recurrence updated, but email was not sent: ${data.emailError}`);
      } else {
        setSuccessMsg("Recurrence updated.");
      }

      setSendScheduleEmail(false);
      setNotificationType("schedule_update");
      await fetchRecurrences(recurrencePage);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to update recurrence");
      updateRecurrenceDraft(recurrenceKey, { saving: false });
    }
  };

  const onResetRecurrenceToJobDefault = async (recurrence: JobRecurrenceRecord) => {
    if (!uuid) return;

    const recurrenceKey = getRecurrenceKey(recurrence);
    const recurrenceId = getRecurrencePatchId(recurrence);
    if (!recurrenceKey || !recurrenceId) return;

    updateRecurrenceDraft(recurrenceKey, { saving: true });
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      console.log("PATCHING SCHEDULE onResetRecurrenceToJobDefault", `/api/employee/jobs/${uuid}/schedule`);
      const res = await fetch(`/api/employee/jobs/${uuid}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "recurrence",
          recurrence: {
            id: recurrenceId,
            reset_to_job_default: true,
            is_custom_schedule: false,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to reset recurrence");

      setSuccessMsg(`Recurrence reset to job default.`);
      await fetchRecurrences(recurrencePage);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to reset recurrence");
      updateRecurrenceDraft(recurrenceKey, { saving: false });
    }
  };

  const goToNextRecurrencePage = () => {
    if (!recurrencePagination.hasNextPage || recurrencesLoading) return;
    setPageDirection("next");
    setRecurrencePage((p) => p + 1);
  };

  const goToPrevRecurrencePage = () => {
    if (!recurrencePagination.hasPrevPage || recurrencesLoading) return;
    setPageDirection("prev");
    setRecurrencePage((p) => Math.max(p - 1, 1));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="space-y-3 rounded-xl border bg-white p-5 xl:col-span-2">
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </div>
          <div className="space-y-3 rounded-xl border bg-white p-5">
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </div>
          <div className="space-y-3 rounded-xl border bg-white p-5">
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl p-6 md:p-10">
        <Alert
          tone="error"
          title="Job not found"
          message="This job might have been deleted or the UUID is invalid."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Job</h1>
            <Badge>{job.uuid}</Badge>
            <Badge>{job.status || "unknown"}</Badge>
            {job.is_recurring ? <Badge>Recurring</Badge> : <Badge>One-off</Badge>}
            {job.is_completed ? <Badge>Completed</Badge> : null}
            {resolvedJobHasUrgentFee ? <Badge>Urgent fee applied</Badge> : null}
          </div>
          <p className="text-sm text-gray-600">{jobAddress}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={handleBackToPreviousPage}
            disabled={saving || extending}
          >
            Back to previous page
          </Button>

          <Button
            variant="secondary"
            onClick={handleBackToDashboard}
            disabled={saving || extending}
          >
            Back to dashboard
          </Button>

          <Button onClick={onSave} disabled={!canSave}>
            {saving ? "Saving..." : "Save job changes"}
          </Button>
        </div>
      </div>

      {errorMsg && <Alert tone="error" title="Couldn’t save changes" message={errorMsg} />}
      {successMsg && <Alert tone="success" title="Updated" message={successMsg} />}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="space-y-5 rounded-xl border bg-white p-5 xl:col-span-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <p className="text-sm text-gray-600">
              Master schedule plus individual recurrence overrides.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 sm:col-span-2">
              <p className="text-xs font-medium text-gray-500">Job address</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{jobAddress}</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Customer</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {resolvedCustomer?.full_name || "—"}
              </p>
              <p className="mt-1 text-xs text-gray-500">{resolvedCustomer?.email || "—"}</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Total</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatMoney(job.total_amount)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Subtotal: {formatMoney(job.subtotal_amount)} • GST: {formatMoney(job.gst_amount)}
              </p>
              {resolvedJobHasUrgentFee ? (
                <p className="mt-1 text-xs font-medium text-red-700">
                  Includes urgent fee in subtotal: {formatMoney(resolvedJobUrgentFeeAmount)}
                </p>
              ) : null}
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Master date + arrival window</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {scheduledDateLocal ? `${scheduledPreview} • ${masterWindowPreview}` : "Not set"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                preset: {String(scheduledWindowPreset)} | mins: {String(scheduledWindowMins)}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Recurrence</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {job.recurrence_summary ||
                  (job.is_recurring
                    ? `${job.recurrence_frequency} (every ${job.recurrence_interval})`
                    : "Not recurring")}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Recurrence end</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {job.recurrence_end_date ? formatDate(job.recurrence_end_date) : "No end date"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 sm:col-span-2">
              <p className="text-xs font-medium text-gray-500">Client schedule message</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                {job.client_schedule_message || "No client schedule message saved."}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Created</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatDateTime(job.created_at)}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500">Last updated</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatDateTime(job.updated_at)}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Internal job notes</p>
              <p className="mt-1 text-xs text-gray-600">
                Staff-only execution notes for this job.
              </p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setDirty(true);
              }}
              placeholder="Add internal notes for staff..."
              className="min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700"
            />
          </div>

          {job.is_recurring && (
            <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Generate more recurrences</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Add more future recurrence rows for this job without changing the master
                    schedule.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-[160px]">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Number to add
                    </label>
                    <select
                      value={extendCount}
                      onChange={(e) => setExtendCount(parseInt(e.target.value, 10))}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700"
                      disabled={extending || saving}
                    >
                      {EXTEND_OPTIONS.map((count) => (
                        <option key={count} value={count}>
                          Add {count}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button onClick={onExtendRecurrences} disabled={extending || saving}>
                    {extending ? "Generating..." : "Generate more"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recurrence instances</h3>
              <p className="text-xs text-gray-500">
                {recurrencePagination.total ? `${recurrencePagination.total} total` : "None yet"}
              </p>
            </div>

            {recurrencesLoading && recurrences.length > 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <Spinner size="sm" label="Loading next recurrences..." />
              </div>
            ) : null}

            {recurrencesLoading && recurrences.length === 0 ? (
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
                <Spinner size="md" label="Loading recurrences..." />
              </div>
            ) : recurrences.length > 0 ? (
              <div className="space-y-3">
                {recurrences.map((r) => {
                  const recurrenceKey = getRecurrenceKey(r);
                  const draft = recurrenceKey ? recurrenceDrafts[recurrenceKey] : undefined;

                  const previewISO = draft?.scheduledLocal
                    ? localDatetimeToISO(draft.scheduledLocal)
                    : null;

                  const previewWindow = previewISO
                    ? getWindowPreview(
                        previewISO,
                        draft?.windowPreset ?? "anytime",
                        draft?.scheduledWindowMins
                      )
                    : "—";

                  return (
                    <div
                      key={recurrenceKey || String(r.id || Math.random())}
                      className="space-y-4 rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              Recurrence {r.uuid || (r.id ? `#${r.id}` : "")}
                            </p>
                            <Badge>{r.status || "unknown"}</Badge>
                            {r.is_custom_schedule ? (
                              <Badge>Custom schedule</Badge>
                            ) : (
                              <Badge>Job default</Badge>
                            )}
                            {r.is_completed ? <Badge>Completed</Badge> : null}
                          </div>

                          <p className="mt-1 text-sm text-gray-700">
                            {r.scheduled_at ? formatDateTime(r.scheduled_at) : "No scheduled date"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Arrival window:{" "}
                            {r.scheduled_at
                              ? getWindowPreview(
                                  r.scheduled_at,
                                  r.scheduled_window_preset ??
                                    job.scheduled_window_preset ??
                                    "anytime",
                                  r.scheduled_window_mins ?? job.scheduled_window_mins ?? 240
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-900">
                        <div>
                          <span className="font-semibold">Pricing:</span>{" "}
                          {formatMoney(r.total_amount ?? job.total_amount)} • Source:{" "}
                          {r.pricing_source || "job default"}
                        </div>
                        {resolvedJobHasUrgentFee ? (
                          <div className="mt-1">
                            <span className="font-semibold">Urgent fee:</span>{" "}
                            {formatMoney(resolvedJobUrgentFeeAmount)}
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                        <span className="font-semibold">Job location:</span> {jobAddress}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field
                          label="Override start"
                          hint="Move only this recurrence without changing the whole job."
                        >
                          <input
                            type="datetime-local"
                            value={draft?.scheduledLocal || ""}
                            onChange={(e) =>
                              recurrenceKey &&
                              updateRecurrenceDraft(recurrenceKey, {
                                scheduledLocal: e.target.value,
                                dirty: true,
                              })
                            }
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700"
                          />
                        </Field>

                        <Field label="Override window" hint="This applies only to this recurrence.">
                          <select
                            value={draft?.windowPreset ?? "anytime"}
                            onChange={(e) => {
                              const selected = WINDOW_OPTIONS.find(
                                (o) => o.value === e.target.value
                              );
                              if (!recurrenceKey) return;
                              updateRecurrenceDraft(recurrenceKey, {
                                windowPreset: e.target.value,
                                scheduledWindowMins: selected?.mins ?? 240,
                                dirty: true,
                              });
                            }}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700"
                          >
                            {WINDOW_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      <div className="text-xs text-gray-600">
                        Preview:{" "}
                        <span className="font-medium text-gray-900">
                          {previewISO
                            ? `${new Date(previewISO).toLocaleString("en-NZ")} • ${previewWindow}`
                            : "—"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => onSaveRecurrence(r)}
                          disabled={!draft?.dirty || draft?.saving}
                        >
                          {draft?.saving ? "Saving..." : "Save recurrence"}
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => onResetRecurrenceToJobDefault(r)}
                          disabled={draft?.saving}
                        >
                          Reset to job default
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-500">
                    Page {recurrencePagination.page} of {recurrencePagination.totalPages}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={goToPrevRecurrencePage}
                      disabled={!recurrencePagination.hasPrevPage || recurrencesLoading}
                    >
                      {prevPageLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-700" />
                          Loading...
                        </span>
                      ) : (
                        "Previous"
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={goToNextRecurrencePage}
                      disabled={!recurrencePagination.hasNextPage || recurrencesLoading}
                    >
                      {nextPageLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-700" />
                          Loading...
                        </span>
                      ) : (
                        "Next"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
                No recurrence instances yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 rounded-xl border bg-white p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Master schedule</h2>
            <p className="text-sm text-gray-600">
              Choose the job date here. Arrival time range is controlled by the arrival window.
            </p>
          </div>

          <Field
            label="Master date"
            hint="Choose the job date only. The time range comes from the arrival window below."
          >
            <input
              type="date"
              value={scheduledDateLocal}
              onChange={(e) => {
                setScheduledDateLocal(e.target.value);
                setDirty(true);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700 hover:cursor-pointer"
            />
            <div className="mt-2 text-xs text-gray-600 ">
              Preview: <span className="font-medium text-gray-900">{scheduledPreview}</span>
            </div>
          </Field>

          <Field
            label="Master arrival window"
            hint="This sets the expected time range for the selected date and future generated recurrences."
          >
            <select
              value={scheduledWindowPreset}
              onChange={(e) => {
                const selected = WINDOW_OPTIONS.find((opt) => opt.value === e.target.value);
                setScheduledWindowPreset(e.target.value);
                setScheduledWindowMins(selected?.mins ?? 240);
                setDirty(true);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700 hover:cursor-pointer"
              disabled={!scheduledDateLocal}
            >
              {WINDOW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="mt-2 text-xs text-gray-600">
              Window: <span className="font-medium text-gray-900">{masterWindowPreview}</span>
            </div>
          </Field>

          <Field label="Recurring service" hint="Choose cadence only if the client requested it.">
            <select
              value={recurrencePreset}
              onChange={(e) => {
                setRecurrencePreset(e.target.value as RecurrencePreset);
                setDirty(true);
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700 hover:cursor-pointer"
            >
              <option value="one_off">One-Off</option>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
            </select>

            <div className="mt-2 text-xs text-gray-600">
              Selected:{" "}
              <span className="font-medium text-gray-900">{prettyPreset(recurrencePreset)}</span>
            </div>
          </Field>

          {recurrencePreset !== "one_off" && (
            <Field label="Recurrence end date (optional)" hint="Leave blank for no end date.">
              <input
                type="date"
                value={endDateLocal}
                onChange={(e) => {
                  setEndDateLocal(e.target.value);
                  setDirty(true);
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700"
              />
              <div className="mt-2 text-xs text-gray-600">
                Preview: <span className="font-medium text-gray-900">{endDatePreview}</span>
              </div>
            </Field>
          )}

          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Customer schedule message</p>
              <p className="mt-1 text-xs text-gray-600">
                This message can be sent to the customer with the schedule update email.
              </p>
            </div>

            <textarea
              value={clientScheduleMessage}
              onChange={(e) => {
                setClientScheduleMessage(e.target.value);
                setDirty(true);
              }}
              placeholder="Add a customer-facing schedule message..."
              className="min-h-[140px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-700 focus:ring-1 focus:ring-green-700"
            />

            <p className="text-xs text-gray-500">
              Example: This job has been scheduled as a priority request. We will aim to attend on
              the date shown below, or the next available day if required.
            </p>
          </div>
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={sendScheduleEmail}
              onChange={(e) => setSendScheduleEmail(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700 hover:cursor-pointer"
            />
            Send email to customer
          </label>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={onSave} disabled={!canSave}>
              {saving ? "Saving..." : "Save job changes"}
            </Button>
            <Button variant="secondary" onClick={onClear} disabled={saving || extending}>
              Clear schedule + recurrence
            </Button>
          </div>

          {!dirty ? (
            <p className="text-xs text-gray-500">No unsaved job changes.</p>
          ) : (
            <p className="text-xs text-gray-500">
              You have unsaved changes. Click <span className="font-medium">Save job changes</span>.
            </p>
          )}
        </div>

        <div className="space-y-5 rounded-xl border bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quote summary</h2>
              <p className="text-sm text-gray-600">
                Read-only reference from the original quote for this job.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {resolvedQuote?.status ? <Badge>{resolvedQuote.status}</Badge> : null}
              {resolvedQuoteHasUrgentFee ? <Badge>Urgent fee on quote</Badge> : null}
            </div>
          </div>

          {quoteLoading ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <Spinner size="sm" label="Loading quote..." />
            </div>
          ) : resolvedQuote ? (
            <>
              {quoteError ? (
                <Alert tone="info" title="Using available quote snapshot" message={quoteError} />
              ) : null}

              <div className="grid grid-cols-1 gap-3">
                <ReadOnlyValue label="Job address" value={jobAddress} />
                <ReadOnlyValue label="Quote address" value={quoteAddress} />
                <ReadOnlyValue label="Quote UUID" value={resolvedQuote?.uuid || job?.quote_uuid || "—"} />
                <ReadOnlyValue
                  label="Customer"
                  value={
                    resolvedCustomer?.full_name ||
                    `${resolvedQuote?.contact_first_name || ""} ${resolvedQuote?.contact_last_name || ""}`.trim() ||
                    "—"
                  }
                />
                <ReadOnlyValue label="Email" value={resolvedQuote?.contact_email || resolvedCustomer?.email || "—"} />
                <ReadOnlyValue label="Mobile" value={resolvedQuote?.contact_mobile || resolvedCustomer?.mobile || "—"} />
                <ReadOnlyValue label="Landline" value={resolvedQuote?.contact_landline || resolvedCustomer?.landline || "—"} />
                <ReadOnlyValue
                  label="Quote created"
                  value={resolvedQuote?.created_at ? formatDate(resolvedQuote.created_at) : "—"}
                />
                <ReadOnlyValue label="Quote total" value={formatMoney(resolvedQuote?.total_amount)} />
                <ReadOnlyValue
                  label="Quote frequency"
                  value={prettyPreset(
                    (resolvedQuote?.recurrence_frequency as RecurrencePreset) || "one_off"
                  )}
                />
                <ReadOnlyValue
                  label="Urgent fee"
                  value={
                    resolvedQuoteHasUrgentFee
                      ? formatMoney(resolvedQuoteUrgentFeeAmount)
                      : "No urgent fee"
                  }
                />
                <ReadOnlyValue
                  label="Expiry"
                  value={resolvedQuote?.expiry_end ? formatDate(resolvedQuote.expiry_end) : "No expiry date"}
                />
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Services</p>
                  <Badge>{resolvedQuote?.services?.length || job?.services?.length || 0}</Badge>
                </div>

                {(resolvedQuote?.services?.length || job?.services?.length) ? (
                  <div className="space-y-2">
                    {(resolvedQuote?.services || job?.services || []).map(
                      (service: QuoteService, index: number) => {
                        const quantity = Number(service?.quantity || 0);
                        const unitPrice = Number(service?.unit_price || 0);
                        const lineTotal = quantity * unitPrice;

                        return (
                          <div
                            key={`${service?.value || service?.label || "service"}-${index}`}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {service?.label || service?.value || `Service ${index + 1}`}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Qty: {quantity || 0} • Unit price: {formatMoney(unitPrice)}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatMoney(lineTotal)}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}

                    {resolvedQuoteHasUrgentFee ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-red-900">Urgent fee</p>
                            <p className="mt-1 text-xs text-red-700">
                              Applied to this quote due to urgency.
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-red-900">
                            {formatMoney(resolvedQuoteUrgentFeeAmount)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No services found on this quote.</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <ReadOnlyValue
                  label="Subtotal"
                  textAlignedRight
                  paddingRight="pr-5"
                  value={formatMoney(resolvedQuote?.subtotal_amount ?? job?.subtotal_amount)}
                />
                <ReadOnlyValue
                  label="GST"
                  textAlignedRight
                  paddingRight="pr-5"
                  value={formatMoney(resolvedQuote?.gst_amount ?? job?.gst_amount)}
                />
                <ReadOnlyValue
                  label="Total"
                  textAlignedRight
                  paddingRight="pr-5"
                  value={formatMoney(resolvedQuote?.total_amount ?? job?.total_amount)}
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Job pricing snapshot</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <ReadOnlyValue
                    label="Job subtotal"
                    textAlignedRight
                    value={formatMoney(job?.subtotal_amount)}
                  />
                  <ReadOnlyValue
                    label="Job GST"
                    textAlignedRight
                    paddingRight="pr-5"
                    value={formatMoney(job?.gst_amount)}
                  />
                  <ReadOnlyValue
                    label="Job total"
                    textAlignedRight
                    paddingRight="pr-5"
                    value={formatMoney(job?.total_amount)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-900">Client message</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {resolvedQuote?.message || "No client message provided."}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-900">Internal / employer note</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {resolvedQuote?.employer_message || "No internal note provided."}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Quote images</p>
                  <Badge>{resolvedQuote?.images?.length || 0}</Badge>
                </div>

                {resolvedQuote?.images?.length ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {resolvedQuote.images.map((image: QuoteImage, index: number) => (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        onClick={() => openImage(image.url)}
                        className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition hover:cursor-pointer hover:border-green-400 hover:shadow-sm"
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={image.url}
                            alt={image.label || `Quote image ${index + 1}`}
                            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="border-t border-gray-100 px-3 py-2">
                          <p className="truncate text-xs font-medium text-gray-700">
                            {image.label || `Image ${index + 1}`}
                          </p>
                          <p className="mt-1 text-[11px] text-green-700">Click to enlarge</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No quote images attached.</p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Job images</p>
                  <Badge>{job?.job_images?.length || 0}</Badge>
                </div>

                {job?.job_images?.length ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {job.job_images.map((image: JobImage, index: number) => (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        onClick={() => openImage(image.url)}
                        className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition hover:cursor-pointer hover:border-green-400 hover:shadow-sm"
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
                          <p className="mt-1 text-[11px] text-green-700">Click to enlarge</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No job images attached.</p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
              No linked quote found for this job.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}