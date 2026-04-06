import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Loader2,
  RefreshCw,
  Filter,
  Search,
  Clock3,
} from "lucide-react";
import { useAuth, roleRedirectMap } from "@/context/AuthContext";
import { formatFullName } from "@/utils/utils";

type JobRecurrence = {
  id: number;
  job_uuid: string;
  scheduled_at: string;
  is_completed: boolean;
  completed_date?: string | null;
  status: string;
  is_deleted?: boolean;
  previous_status?: string | null;
  updated_at?: string | null;
};

type Job = {
  uuid: string;
  status: string;
  scheduled_at?: string | null;
  created_at?: string | null;
  total_amount?: number | null;
  address?: string | null;
  is_recurring?: boolean;
  recurrence_end_date?: string | null;
  future_recurrence_count?: number | null;
  needs_attention?: boolean;
  attention_reason?: string | null;

  quote?: {
    uuid: string;
    contact_first_name?: string | null;
    contact_last_name?: string | null;
  } | null;

  job_recurrences?: JobRecurrence[];
};

type JobsApiResponse = {
  jobs?: Job[];
  total?: number;
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  error?: string;
};

const PAGE_LIMIT = 20;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const SCHEDULE_PRESET_OPTIONS = [
  { value: "", label: "All scheduled dates" },
  { value: "today", label: "Today" },
  { value: "day_prior", label: "1 day prior to scheduled" },
  { value: "seven_days_prior", label: "7 days prior to scheduled" },
];

function formatDateTime(iso?: string | null) {
  if (!iso) return "Not set";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Not set";

  return d.toLocaleString("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(value?: number | null) {
  return Number(value || 0).toLocaleString("en-NZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusBadge(status?: string | null) {
  const s = (status || "").toLowerCase();

  switch (s) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-900",
      };
    case "scheduled":
      return {
        label: "Scheduled",
        className: "bg-blue-100 text-blue-900",
      };
    case "in_progress":
      return {
        label: "In Progress",
        className: "bg-orange-100 text-orange-900",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-red-100 text-red-900",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-emerald-100 text-emerald-900",
      };
    default:
      return {
        label: status || "Unknown",
        className: "bg-gray-100 text-gray-900",
      };
  }
}

function JobCard({
  job,
  onClick,
}: {
  job: Job;
  onClick: () => void;
}) {
  const badge = getStatusBadge(job.status);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition rounded-2xl"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">
              {formatFullName(
                job?.quote?.contact_first_name ?? undefined,
                job?.quote?.contact_last_name ?? undefined,
                true
              ) || "Unnamed customer"}
            </p>

            {job.address ? (
              <p className="text-sm text-gray-500 truncate mt-1">{job.address}</p>
            ) : null}

            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                Job UUID: <span className="font-medium text-gray-700">{job.uuid}</span>
              </p>

              <p className="text-sm text-gray-500">
                Status: <span className="font-medium text-gray-700">{job.status || "Unknown"}</span>
              </p>

              <p className="text-sm text-gray-500">
                Scheduled:{" "}
                <span className="font-medium text-gray-700">
                  {formatDateTime(job.scheduled_at)}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Total: <span className="font-medium text-gray-700">${formatMoney(job.total_amount)}</span>
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmployeeJobsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState("");
  const [schedulePreset, setSchedulePreset] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const querySummary = useMemo(() => {
    const bits: string[] = [];

    if (statusFilter) bits.push(`status: ${statusFilter}`);
    if (schedulePreset) bits.push(`preset: ${schedulePreset}`);
    if (scheduledStart) bits.push(`from: ${scheduledStart}`);
    if (scheduledEnd) bits.push(`to: ${scheduledEnd}`);
    if (searchValue.trim()) bits.push(`search: ${searchValue.trim()}`);

    return bits.length > 0 ? bits.join(" • ") : "Showing all jobs";
  }, [statusFilter, schedulePreset, scheduledStart, scheduledEnd, searchValue]);

  const getJobUrl = (jobUUID: string) => `/dashboard/employee/jobs/uuid/${jobUUID}`;

  const buildApiUrl = (pageNumber: number) => {
    const params = new URLSearchParams();

    params.set("limit", String(PAGE_LIMIT));
    params.set("page", String(pageNumber));

    if (statusFilter) params.set("status", statusFilter);
    if (schedulePreset) params.set("scheduledPreset", schedulePreset);
    if (scheduledStart) params.set("scheduledStart", scheduledStart);
    if (scheduledEnd) params.set("scheduledEnd", scheduledEnd);
    if (searchValue.trim()) params.set("search", searchValue.trim());

    return `/api/jobs?${params.toString()}`;
  };

  const fetchJobs = async ({
    nextPage = 1,
    append = false,
  }: {
    nextPage?: number;
    append?: boolean;
  } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const res = await fetch(buildApiUrl(nextPage), {
        credentials: "include",
      });

      const data: JobsApiResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch jobs");
      }

      const nextJobs = Array.isArray(data.jobs) ? data.jobs : [];

      setJobs((prev) => (append ? [...prev, ...nextJobs] : nextJobs));
      setPage(Number(data.page || nextPage));
      setTotalPages(Number(data.totalPages || 1));
      setTotal(Number(data.total || nextJobs.length));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to fetch jobs");

      if (!append) {
        setJobs([]);
        setPage(1);
        setTotalPages(1);
        setTotal(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    if (!user) {
      router.replace("/auth");
      return;
    }

    if (user.role !== "employee") {
      router.replace(roleRedirectMap[user.role] || "/");
      return;
    }

    fetchJobs({ nextPage: 1, append: false });
  }, [router.isReady, user]);

  const handleApplyFilters = () => {
    fetchJobs({ nextPage: 1, append: false });
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setSchedulePreset("");
    setScheduledStart("");
    setScheduledEnd("");
    setSearchValue("");

    setTimeout(() => {
      fetchJobs({ nextPage: 1, append: false });
    }, 0);
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    fetchJobs({ nextPage: page + 1, append: true });
  };

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      fetchJobs({ nextPage: 1, append: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-700" />
                <h1 className="text-xl sm:text-2xl font-bold text-green-900">
                  All Jobs
                </h1>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                Full jobs page with status, schedule presets, and scheduled date range filters
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => router.push("/dashboard/employee")}
              >
                Back to Dashboard
              </Button>

              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => fetchJobs({ nextPage: 1, append: false })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Card className="rounded-2xl shadow-sm mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-green-700" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled preset
                </label>
                <select
                  value={schedulePreset}
                  onChange={(e) => setSchedulePreset(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white"
                >
                  {SCHEDULE_PRESET_OPTIONS.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled start date
                </label>
                <input
                  type="date"
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled end date
                </label>
                <input
                  type="date"
                  value={scheduledEnd}
                  onChange={(e) => setScheduledEnd(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Name, address, UUID..."
                    className="w-full rounded-lg border px-3 py-2 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                className="bg-green-700 hover:bg-green-800 text-white cursor-pointer"
                onClick={handleApplyFilters}
              >
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>

              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-3">{querySummary}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm mb-6">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border p-4 bg-white">
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>

              <div className="rounded-xl border p-4 bg-white">
                <p className="text-sm text-gray-500">Current Page</p>
                <p className="text-2xl font-bold text-gray-900">{page}</p>
              </div>

              <div className="rounded-xl border p-4 bg-white">
                <p className="text-sm text-gray-500">Total Pages</p>
                <p className="text-2xl font-bold text-gray-900">{totalPages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Card className="rounded-2xl shadow-sm border-red-200">
            <CardContent className="p-5">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : jobs.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock3 className="h-4 w-4" />
                <p className="text-sm">No jobs found.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard
                key={job.uuid}
                job={job}
                onClick={() => router.push(getJobUrl(job.uuid))}
              />
            ))}

            {page < totalPages ? (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}