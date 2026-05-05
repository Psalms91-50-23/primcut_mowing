import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock3,
  RefreshCcw,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, roleRedirectMap } from "../../../../../context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

type JobRecurrenceRecord = {
  id?: number;
  uuid?: string;
  job_uuid?: string | null;
  scheduled_at?: string | null;
  is_completed?: boolean | null;
  completed_date?: string | null;
  status?: string | null;
  deleted_at?: string | null;
  is_deleted?: boolean | null;
  previous_status?: string | null;
  updated_at?: string | null;
  services?: any[] | null;
  subtotal_amount?: number | string | null;
  gst_amount?: number | string | null;
  total_amount?: number | string | null;
  pricing_source?: string | null;
  scheduled_window_mins?: number | null;
  is_custom_schedule?: boolean | null;
  scheduled_window_preset?: string | null;
};

type JobRecord = {
  id?: number;
  uuid?: string;
  customer_uuid?: string | null;
  quote_uuid?: string | null;
  services?: any[] | null;
  total_amount?: number | string | null;
  subtotal_amount?: number | string | null;
  gst_amount?: number | string | null;
  scheduled_at?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  completed_date?: string | null;
  is_completed?: boolean | null;
  is_deleted?: boolean | null;
  is_recurring?: boolean | null;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  recurrence_frequency?: string | null;
  previous_status?: string | null;
  job_address?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  title?: string | null;
  service_name?: string | null;
  recurrences?: JobRecurrenceRecord[];
  job_recurrences?: JobRecurrenceRecord[];
  [key: string]: any;
};

type CustomerRecord = {
  uuid?: string;
  address?: string | null;
  [key: string]: any;
};

function toArray<T = any>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.jobs)) return value.jobs;
  if (Array.isArray(value?.job_recurrences)) return value.job_recurrences;
  return [];
}

function toObject<T = any>(value: any): T | null {
  if (!value) return null;
  if (value.data && !Array.isArray(value.data)) return value.data;
  if (value.customer && !Array.isArray(value.customer)) return value.customer;
  if (value.job && !Array.isArray(value.job)) return value.job;
  if (!Array.isArray(value)) return value;
  return null;
}

function normalizeJob(job: JobRecord): JobRecord {
  return {
    ...job,
    recurrences: Array.isArray(job?.recurrences)
      ? job.recurrences
      : Array.isArray(job?.job_recurrences)
      ? job.job_recurrences
      : [],
  };
}

function getJobRecurrences(job: JobRecord): JobRecurrenceRecord[] {
  return Array.isArray(job?.recurrences)
    ? job.recurrences
    : Array.isArray(job?.job_recurrences)
    ? job.job_recurrences
    : [];
}

function asMoney(value: unknown) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(Number.isFinite(num) ? num : 0);
}

function formatDateTime(date?: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatDateOnly(date?: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function normalizeStatus(status?: string | null) {
  return (status || "").trim().toLowerCase();
}

function formatStatus(status?: string | null) {
  const value = normalizeStatus(status);
  if (!value) return "—";
  return value.replaceAll("_", " ");
}

function getJobDisplayName(job: JobRecord) {
  if (job.title) return job.title;
  if (job.service_name) return job.service_name;

  if (Array.isArray(job.services) && job.services.length > 0) {
    const firstService = job.services[0];
    return (
      firstService?.label ||
      firstService?.value ||
      firstService?.name ||
      `Job ${job.uuid || job.id || ""}`
    );
  }

  return job.uuid || "Untitled job";
}

function getServiceName(service: any) {
  return (
    service?.label ||
    service?.value ||
    service?.name ||
    service?.service_name ||
    "Service"
  );
}

function getServiceQty(service: any) {
  if (service?.quantity === undefined || service?.quantity === null) return null;
  return service.quantity;
}

function getServiceLineTotal(service: any) {
  return service?.unit_price ?? null;
}

async function tryFetchJson(urls: string[], init?: RequestInit) {
  let lastError: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        credentials: "include",
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });

      if (!res.ok) {
        let message = `${res.status} ${res.statusText} for ${url}`;
        try {
          const errPayload = await res.json();
          message = errPayload?.error || errPayload?.message || message;
        } catch {}
        lastError = new Error(message);
        continue;
      }

      const data = await res.json().catch(() => null);
      return data;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  throw new Error("No working endpoint found.");
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-900 sm:text-right">{value}</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

type WindowOption = {
  value: string;
  label: string;
  mins: number;
};

const WINDOW_OPTIONS: WindowOption[] = [
  { value: "anytime", label: "Anytime (9am–5pm)", mins: 480 },
  { value: "morning", label: "Morning (9am–12pm)", mins: 180 },
  { value: "midday", label: "Midday (12pm–3pm)", mins: 180 },
  { value: "afternoon", label: "Afternoon (3pm–5pm)", mins: 120 },
];

function formatScheduledWindow(
  preset?: string | null,
  mins?: number | null
) {
  const normalizedPreset = (preset || "").trim().toLowerCase();

  if (normalizedPreset) {
    const matched = WINDOW_OPTIONS.find(
      (option) => option.value === normalizedPreset
    );

    if (matched) return matched.label;
  }

  if (mins && Number(mins) > 0) {
    return `${mins} minute window`;
  }

  return "—";
}

export default function CustomerJobViewPage() {
  const router = useRouter();
  const { uuid } = router.query;

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);

  useRoleRedirect("customer");

  const loadPage = async (isRefresh = false) => {
    if (authLoading) return;
    if (!user || !uuid || typeof uuid !== "string") return;

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const customerPayload = await tryFetchJson(
        [user?.customer_uuid ? `/api/customers/uuid/${user.customer_uuid}` : ""].filter(Boolean)
      );

      const resolvedCustomer = toObject<CustomerRecord>(customerPayload);

      if (!resolvedCustomer?.uuid) {
        throw new Error("Customer profile not found.");
      }

      const jobsPayload = await tryFetchJson([
        `/api/customers/uuid/${resolvedCustomer.uuid}/jobs`,
      ]);
      const jobs = toArray<JobRecord>(jobsPayload).map(normalizeJob);
      const matchedJob =
        jobs.find((item) => item.uuid === uuid && !item.is_deleted) || null;

      if (!matchedJob) {
        throw new Error("Job not found.");
      }

      setCustomer(resolvedCustomer);
      setJob(matchedJob);
    } catch (err: any) {
      setError(err?.message || "Failed to load job details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/auth");
      return;
    }

    if (user.role !== "customer") {
      const redirectPath = roleRedirectMap[user.role] || "/";
      router.replace(redirectPath);
      return;
    }

    loadPage();
  }, [user, authLoading, uuid]);

  const recurrences = useMemo(() => {
    if (!job) return [];
    return [...getJobRecurrences(job)]
      .filter((item) => !item?.is_deleted)
      .sort((a, b) => {
        const aTime = new Date(a.scheduled_at || a.updated_at || 0).getTime();
        const bTime = new Date(b.scheduled_at || b.updated_at || 0).getTime();
        return aTime - bTime;
      });
  }, [job]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/customer")}
              className="gap-2 hover:cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Job Details</h1>
              <p className="text-sm text-slate-500 mt-1">
                View your scheduled job and related recurring visits
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => loadPage(true)}
            disabled={refreshing}
            className="gap-2 hover:cursor-pointer"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="font-semibold text-red-700">Unable to load job</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </CardContent>
          </Card>
        ) : null}

        {!error && job ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 flex flex-col gap-6">
              <Card className="rounded-2xl shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.uuid || "—"}</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                        {getJobDisplayName(job)}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 capitalize">
                          {formatStatus(job.status)}
                        </span>
                        {job.is_completed ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                            Active
                          </span>
                        )}
                        {job.is_recurring ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Recurring service
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-500">Total</p>
                      <p className="text-2xl font-bold text-green-700">
                        {asMoney(job.total_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <CalendarDays className="h-4 w-4" />
                        Scheduled Date
                      </div>
                      <p className="mt-2 text-sm text-slate-900">
                        {formatDateOnly(job.scheduled_at)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <MapPin className="h-4 w-4" />
                        Address
                      </div>
                      <p className="mt-2 text-sm text-slate-900">
                        {job.job_address || customer?.address || "Address not available"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Clock3 className="h-4 w-4" />
                        Arrival Window
                      </div>
                      <p className="mt-2 text-sm text-slate-900">
                        {formatScheduledWindow(
                          job.scheduled_window_preset,
                          job.scheduled_window_mins
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <RefreshCcw className="h-4 w-4" />
                        Recurrence
                      </div>
                      <p className="mt-2 text-sm text-slate-900 capitalize">
                        {job.is_recurring
                          ? `${job.recurrence_frequency || "recurring"}${
                              job.recurrence_interval
                                ? ` • every ${job.recurrence_interval}`
                                : ""
                            }`
                          : "One-off job"}
                      </p>
                      {job.recurrence_end_date ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Ends: {formatDateOnly(job.recurrence_end_date)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Services</h3>

                  {!Array.isArray(job.services) || job.services.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState
                        title="No services listed"
                        description="No service lines were available for this job."
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {job.services.map((service, index) => (
                        <div
                          key={`${job.uuid || "job"}-service-${index}`}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {getServiceName(service)}
                              </p>
                              {service?.description ? (
                                <p className="mt-1 text-sm text-slate-500">
                                  {service.description}
                                </p>
                              ) : null}
                            </div>

                            <div className="text-left sm:text-right">
                              {getServiceQty(service) !== null ? (
                                <p className="text-sm text-slate-500">
                                  Qty: {getServiceQty(service)}
                                </p>
                              ) : null}
                              <p className="text-sm font-medium text-green-700">
                                {asMoney(getServiceLineTotal(service))}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Recurring Visits
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        All recurrence records linked to this job
                      </p>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {recurrences.length} visit{recurrences.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {recurrences.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState
                        title="No recurrence records"
                        description="No recurring visits are attached to this job yet."
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {recurrences.map((item) => (
                        <Link
                          key={item.uuid || item.id}
                          href={`/dashboard/customer/recurrences/${item.uuid}`}
                          className="block rounded-xl border border-slate-200 bg-white p-4 hover:shadow-xl transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">
                                Recurring Visit {item.uuid ? `• ${item.uuid}` : ""}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Scheduled Date: {formatDateOnly(item.scheduled_at)}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Arrival Window:{" "}
                                {formatScheduledWindow(
                                  item.scheduled_window_preset || job.scheduled_window_preset,
                                  item.scheduled_window_mins ?? job.scheduled_window_mins
                                )}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Total: {asMoney(item.total_amount)}
                              </p>
                            </div>

                            <div className="flex flex-col sm:items-end gap-2">
                              <span className="text-sm text-slate-600 capitalize">
                                {formatStatus(item.status)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                                <ExternalLink className="h-4 w-4" />
                                View details
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-1">
              <Card className="rounded-2xl shadow-sm border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Summary</h3>

                  <div className="mt-4 space-y-3">
                    <DetailRow label="Job UUID" value={job.uuid || "—"} />
                    <DetailRow label="Status" value={formatStatus(job.status)} />
                    <DetailRow
                      label="Scheduled"
                      value={formatDateOnly(job.scheduled_at)}
                    />
                    <DetailRow
                      label="Subtotal"
                      value={asMoney(job.subtotal_amount)}
                    />
                    <DetailRow label="GST" value={asMoney(job.gst_amount)} />
                    <DetailRow label="Total" value={asMoney(job.total_amount)} />
                    <DetailRow
                      label="Completed"
                      value={
                        job.is_completed ? (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <AlertCircle className="h-4 w-4" />
                            No
                          </span>
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}