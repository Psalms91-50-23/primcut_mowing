// File: /components/search/QuickFindCards.tsx
import React from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Calendar,
  FileText,
  User,
  Clock3,
  ShieldAlert,
} from "lucide-react";
import { formatFullName } from "@/utils/utils";

/**
 * Quick Find Cards (LIGHTWEIGHT SUMMARY)
 *
 * Goal:
 * - Quick-find returns a small payload (fast query).
 * - Clicking the card navigates to the details page.
 * - Details page then fetches the FULL relational data (jobs/quotes/recurrences).
 *
 * Routes:
 *  - Quote details:    /employee/quotes/uuid/[uuid]/details
 *  - Job details:      /employee/jobs/uuid/[uuid]/details
 *  - Customer details: /employee/customers/uuid/[uuid]/details
 */

export type QuickFindType = "quotes" | "jobs" | "customers";

/** ---------------- Lightweight Summary Types ---------------- */

export type Money = number | string | null;

// QUOTE summary (fast to fetch)
export type QuoteSummary = {
  uuid: string;
  status?: string | null;
  total_amount?: Money;
  updated_at?: string | null;

  contact_first_name?: string | null;
  contact_last_name?: string | null;
  contact_email?: string | null;
  address?: string | null;

  has_job?: boolean | null;
};

// JOB summary (fast to fetch)
export type JobSummary = {
  uuid: string;
  status?: string | null;
  scheduled_at?: string | null;
  total_amount?: Money;

  job_address?: string | null;
  address?: string | null;

  quote_uuid?: string | null;
  customer_uuid?: string | null;

  is_recurring?: boolean | null;
  recurrence_count?: number | null;
};

// CUSTOMER summary (fast to fetch)
export type CustomerSummary = {
  uuid: string;
  first_name: string;
  last_name?: string | null;

  email?: string | null;
  address?: string | null;

  mobile_phone?: string | null;
  landline_phone?: string | null;

  quote_count?: number | null;
  job_count?: number | null;
  recurrence_count?: number | null;

  is_blacklisted?: boolean | null;
  created_via?: string | null;

  active_quote_count?: number | null;
  pending_job_count?: number | null;
  completed_job_count?: number | null;

  latest_quote_created_at?: string | null;
  latest_job_created_at?: string | null;
  next_scheduled_job_at?: string | null;
  latest_activity_at?: string | null;
};

/** ---------------- Helpers ---------------- */

const ROUTES = {
  quote: (uuid: string) => `/employee/quotes/uuid/${uuid}/details`,
  job: (uuid: string) => `/employee/jobs/uuid/${uuid}/details`,
  customer: (uuid: string) => `/employee/customers/uuid/${uuid}/details`,
} as const;

const formatMoney = (n?: Money) => {
  if (n === null || n === undefined) return "—";
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
};

const statusTone = (status?: string | null) => {
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
};

const ClickableCard = ({
  onClick,
  title,
  subtitleLines,
  badges,
  icon,
}: {
  onClick: () => void;
  title: string;
  subtitleLines: string[];
  badges?: React.ReactNode;
  icon: React.ReactNode;
}) => {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="cursor-pointer hover:shadow-lg transition rounded-2xl"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {icon}
              <p className="font-semibold truncate">{title}</p>
            </div>

            <div className="mt-1 space-y-0.5">
              {subtitleLines.filter(Boolean).map((line, idx) => (
                <p key={idx} className="text-sm text-gray-600 truncate">
                  {line}
                </p>
              ))}
            </div>

            {badges ? <div className="mt-2 flex flex-wrap gap-2">{badges}</div> : null}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Open</span>
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/** ---------------- Cards ---------------- */

export function QuoteResultCard({ quote }: { quote: QuoteSummary }) {
  const router = useRouter();

  const name =
    formatFullName(
      quote.contact_first_name ?? undefined,
      quote.contact_last_name ?? undefined,
      true
    ) || "Unnamed customer";

  return (
    <ClickableCard
      onClick={() => router.push(ROUTES.quote(quote.uuid))}
      title={name}
      icon={<FileText className="w-5 h-5 text-green-800" />}
      subtitleLines={[
        `Quote UUID: ${quote.uuid}`,
        quote.address ? quote.address : "",
        quote.contact_email ? quote.contact_email : "",
      ]}
      badges={
        <>
          <span className={`text-xs px-2 py-1 rounded ${statusTone(quote.status)}`}>
            {quote.status || "unknown"}
          </span>

          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-900">
            Total: ${formatMoney(quote.total_amount)}
          </span>

          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-900">
            Updated: {formatDate(quote.updated_at)}
          </span>

          {quote.has_job ? (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-900">
              Job created
            </span>
          ) : null}
        </>
      }
    />
  );
}

export function JobResultCard({ job }: { job: JobSummary }) {
  const router = useRouter();

  const title = `Job • ${job.uuid}`;
  const addr = job.job_address || job.address || "";

  const recurringLabel =
    job.is_recurring ||
    (job.recurrence_count !== null &&
      job.recurrence_count !== undefined &&
      job.recurrence_count > 0)
      ? "Recurring"
      : null;

  return (
    <ClickableCard
      onClick={() => router.push(ROUTES.job(job.uuid))}
      title={title}
      icon={<Calendar className="w-5 h-5 text-green-800" />}
      subtitleLines={[
        job.quote_uuid ? `Quote UUID: ${job.quote_uuid}` : "",
        addr ? addr : "",
        job.scheduled_at ? `Scheduled: ${formatDate(job.scheduled_at)}` : "Scheduled: Not set",
      ]}
      badges={
        <>
          <span className={`text-xs px-2 py-1 rounded ${statusTone(job.status)}`}>
            {job.status || "unknown"}
          </span>

          {job.total_amount !== null && job.total_amount !== undefined ? (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-900">
              Total: ${formatMoney(job.total_amount)}
            </span>
          ) : null}

          {recurringLabel ? (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-900">
              {recurringLabel}
            </span>
          ) : null}

          {job.recurrence_count !== null && job.recurrence_count !== undefined ? (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-900">
              Occurrences: {job.recurrence_count}
            </span>
          ) : null}
        </>
      }
    />
  );
}

export function CustomerResultCard({ customer }: { customer: CustomerSummary }) {
  const router = useRouter();

  const name =
    formatFullName(customer.first_name ?? undefined, customer.last_name ?? undefined, true) ||
    "Unnamed customer";

  const mobile = customer.mobile_phone || null;
  const landline = customer.landline_phone || null;

  return (
    <ClickableCard
      onClick={() => router.push(ROUTES.customer(customer.uuid))}
      title={name}
      icon={<User className="w-5 h-5 text-green-800" />}
      subtitleLines={[
        `Customer UUID: ${customer.uuid}`,
        customer.email ? customer.email : "",
        customer.address ? customer.address : "",
        customer.created_via ? `Created via: ${customer.created_via}` : "",
      ]}
      badges={
        <>
          {customer.is_blacklisted ? (
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-900 inline-flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Blacklisted
            </span>
          ) : null}

          {customer.quote_count !== null && customer.quote_count !== undefined ? (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-900">
              Quotes: {customer.quote_count}
            </span>
          ) : null}

          {customer.active_quote_count !== null &&
          customer.active_quote_count !== undefined ? (
            <span className="text-xs px-2 py-1 rounded bg-sky-100 text-sky-900">
              Active Quotes: {customer.active_quote_count}
            </span>
          ) : null}

          {customer.job_count !== null && customer.job_count !== undefined ? (
            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-900">
              Jobs: {customer.job_count}
            </span>
          ) : null}

          {customer.pending_job_count !== null &&
          customer.pending_job_count !== undefined ? (
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-900">
              Pending Jobs: {customer.pending_job_count}
            </span>
          ) : null}

          {customer.completed_job_count !== null &&
          customer.completed_job_count !== undefined ? (
            <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-900">
              Completed Jobs: {customer.completed_job_count}
            </span>
          ) : null}

          {customer.recurrence_count !== null &&
          customer.recurrence_count !== undefined ? (
            <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-900">
              Occurrences: {customer.recurrence_count}
            </span>
          ) : null}

          {mobile && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-900">
              Mobile: {mobile}
            </span>
          )}

          {landline && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-900">
              Landline: {landline}
            </span>
          )}

          {customer.next_scheduled_job_at ? (
            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-900 inline-flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              Next Job: {formatDate(customer.next_scheduled_job_at)}
            </span>
          ) : null}

          {customer.latest_activity_at ? (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-900">
              Latest Activity: {formatDateTime(customer.latest_activity_at)}
            </span>
          ) : null}
        </>
      }
    />
  );
}

/** ---------------- Switcher ---------------- */

export function QuickFindResult({
  type,
  result,
}: {
  type: QuickFindType;
  result: QuoteSummary | JobSummary | CustomerSummary | null;
}) {
  if (!result) return null;

  if (type === "quotes") return <QuoteResultCard quote={result as QuoteSummary} />;
  if (type === "jobs") return <JobResultCard job={result as JobSummary} />;
  return <CustomerResultCard customer={result as CustomerSummary} />;
}