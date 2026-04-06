import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, roleRedirectMap } from "../../../../context/AuthContext";
import { formatFullName } from "@/utils/utils";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Search,
  XCircle,
  CheckCircle2,
  Wrench,
  ClipboardList,
  RefreshCw,
  Filter,
} from "lucide-react";

type Job = {
  uuid: string;
  job_uuid?: string | null;
  recurrence_uuid?: string | null;
  recurrence_id?: number | null;
  kind?: "job" | "recurrence";
  status?: string | null;
  scheduled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  subtotal_amount?: number | null;
  gst_amount?: number | null;
  total_amount?: number | null;
  has_urgent_fee?: boolean | null;
  urgent_fee_amount?: number | null;

  address?: string | null;
  job_address?: string | null;
  is_recurring?: boolean;
  recurrence_frequency?: string | null;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  schedule_label?: string | null;

  quote?: {
    uuid?: string | null;
    contact_first_name?: string | null;
    contact_last_name?: string | null;
    contact_email?: string | null;
  } | null;

  customer?: {
    uuid?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    mobile_phone?: string | null;
    landline_phone?: string | null;
  } | null;

  services?: Array<{
    label?: string;
    value?: string;
    quantity?: number;
    unit_price?: number;
  }> | null;
};

type JobsResponse = {
  jobs?: Job[];
  total?: number;
  totalCount?: number;
  error?: string;
};

type StatusKey =
  | "all"
  | "pending"
  | "scheduled"
  | "in_progress"
  | "cancelled"
  | "completed";

type JobSectionKey = "all" | "today" | "tomorrow" | "sevenDays" | "custom";

export default function EmployeeJobsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [fetchingAll, setFetchingAll] = useState(false);
  const [fetchingToday, setFetchingToday] = useState(false);
  const [fetchingTomorrow, setFetchingTomorrow] = useState(false);
  const [fetchingSevenDays, setFetchingSevenDays] = useState(false);
  const [fetchingCustom, setFetchingCustom] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [tomorrowJobs, setTomorrowJobs] = useState<Job[]>([]);
  const [sevenDaysJobs, setSevenDaysJobs] = useState<Job[]>([]);
  const [customRangeJobs, setCustomRangeJobs] = useState<Job[]>([]);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");

  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "Not scheduled";

    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Not scheduled";

    return d.toLocaleString("en-NZ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatMoney = (amount?: number | null) => {
    const value = Number(amount || 0);
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(value);
  };

  const normalizeStatus = (status?: string | null): StatusKey => {
    const s = String(status || "").trim().toLowerCase();

    if (s === "pending") return "pending";
    if (s === "scheduled") return "scheduled";
    if (s === "in_progress" || s === "in-progress") return "in_progress";
    if (s === "cancelled" || s === "canceled") return "cancelled";
    if (s === "completed") return "completed";

    return "all";
  };

  const getStatusMeta = (status?: string | null) => {
    const normalized = normalizeStatus(status);

    if (normalized === "pending") {
      return {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-900 border-yellow-200",
        icon: <ClipboardList className="h-5 w-5" />,
      };
    }

    if (normalized === "scheduled") {
      return {
        label: "Scheduled",
        className: "bg-blue-100 text-blue-900 border-blue-200",
        icon: <Calendar className="h-5 w-5" />,
      };
    }

    if (normalized === "in_progress") {
      return {
        label: "In Progress",
        className: "bg-purple-100 text-purple-900 border-purple-200",
        icon: <Wrench className="h-5 w-5" />,
      };
    }

    if (normalized === "cancelled") {
      return {
        label: "Cancelled",
        className: "bg-red-100 text-red-900 border-red-200",
        icon: <XCircle className="h-5 w-5" />,
      };
    }

    if (normalized === "completed") {
      return {
        label: "Completed",
        className: "bg-emerald-100 text-emerald-900 border-emerald-200",
        icon: <CheckCircle2 className="h-5 w-5" />,
      };
    }

    return {
      label: status || "Unknown",
      className: "bg-gray-100 text-gray-900 border-gray-200",
      icon: <Clock3 className="h-5 w-5" />,
    };
  };

  const buildAllJobsUrl = ({ status }: { status?: string }) => {
    const params = new URLSearchParams();

    if (status && status !== "all") {
      params.set("status", status);
    }

    return `/api/jobs/all${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const buildScheduledUrl = ({
    scheduledPreset,
    scheduledStart,
    scheduledEnd,
  }: {
    scheduledPreset?: "today" | "day_prior" | "seven_days_prior";
    scheduledStart?: string;
    scheduledEnd?: string;
  }) => {
    const params = new URLSearchParams();

    if (scheduledPreset) {
      params.set("scheduledPreset", scheduledPreset);
    }

    if (scheduledStart) {
      params.set("scheduledStart", scheduledStart);
    }

    if (scheduledEnd) {
      params.set("scheduledEnd", scheduledEnd);
    }

    return `/api/jobs/scheduled${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const fetchAllJobs = async (status?: string) => {
    try {
      setFetchingAll(true);

      const res = await fetch(buildAllJobsUrl({ status }), {
        method: "GET",
        credentials: "include",
      });

      const data: JobsResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch jobs");
      }

      setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
    } catch (err) {
      console.error("Failed to fetch all jobs:", err);
      setJobs([]);
    } finally {
      setFetchingAll(false);
    }
  };

  const fetchScheduledSection = async (
    section: Exclude<JobSectionKey, "all">,
    options?: {
      scheduledPreset?: "today" | "day_prior" | "seven_days_prior";
      scheduledStart?: string;
      scheduledEnd?: string;
    }
  ) => {
    const setFetching = (value: boolean) => {
      if (section === "today") setFetchingToday(value);
      if (section === "tomorrow") setFetchingTomorrow(value);
      if (section === "sevenDays") setFetchingSevenDays(value);
      if (section === "custom") setFetchingCustom(value);
    };

    try {
      setFetching(true);

      const res = await fetch(buildScheduledUrl(options || {}), {
        method: "GET",
        credentials: "include",
      });

      const data: JobsResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch scheduled jobs");
      }

      const nextJobs = Array.isArray(data?.jobs) ? data.jobs : [];

      if (section === "today") setTodayJobs(nextJobs);
      if (section === "tomorrow") setTomorrowJobs(nextJobs);
      if (section === "sevenDays") setSevenDaysJobs(nextJobs);
      if (section === "custom") setCustomRangeJobs(nextJobs);
    } catch (err) {
      console.error(`Failed to fetch ${section} scheduled jobs:`, err);

      if (section === "today") setTodayJobs([]);
      if (section === "tomorrow") setTomorrowJobs([]);
      if (section === "sevenDays") setSevenDaysJobs([]);
      if (section === "custom") setCustomRangeJobs([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      if (!user) {
        router.replace("/auth");
        return;
      }

      if (!["owner", "employee", "admin"].includes(user.role)) {
        router.replace(roleRedirectMap[user.role] || "/");
        return;
      }

      try {
        await Promise.all([
          fetchAllJobs(statusFilter),
          fetchScheduledSection("today", {
            scheduledPreset: "today",
          }),
          fetchScheduledSection("tomorrow", {
            scheduledPreset: "day_prior",
          }),
          fetchScheduledSection("sevenDays", {
            scheduledPreset: "seven_days_prior",
          }),
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user, statusFilter]);

  const handleApplyCustomRange = async () => {
    if (!scheduledStart && !scheduledEnd) {
      setCustomRangeJobs([]);
      return;
    }

    await fetchScheduledSection("custom", {
      scheduledStart,
      scheduledEnd,
    });
  };

  const handleClearCustomRange = () => {
    setScheduledStart("");
    setScheduledEnd("");
    setCustomRangeJobs([]);
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchAllJobs(statusFilter),
      fetchScheduledSection("today", {
        scheduledPreset: "today",
      }),
      fetchScheduledSection("tomorrow", {
        scheduledPreset: "day_prior",
      }),
      fetchScheduledSection("sevenDays", {
        scheduledPreset: "seven_days_prior",
      }),
      ...(scheduledStart || scheduledEnd
        ? [
            fetchScheduledSection("custom", {
              scheduledStart,
              scheduledEnd,
            }),
          ]
        : []),
    ]);
  };

  const statusCounts = useMemo(() => {
    const counts = {
      all: jobs.length,
      pending: 0,
      scheduled: 0,
      in_progress: 0,
      cancelled: 0,
      completed: 0,
    };

    for (const job of jobs) {
      const normalized = normalizeStatus(job.status);
      if (normalized !== "all") {
        counts[normalized] += 1;
      }
    }

    return counts;
  }, [jobs]);

  const filterBySearch = (jobList: Job[]) => {
    const term = searchValue.trim().toLowerCase();

    return jobList.filter((job) => {
      const fullName =
        formatFullName(
          job?.quote?.contact_first_name ?? job?.customer?.first_name ?? undefined,
          job?.quote?.contact_last_name ?? job?.customer?.last_name ?? undefined,
          true
        ) || "";

      if (!term) return true;

      const serviceLabels = Array.isArray(job.services)
        ? job.services.map((service) => service?.label || service?.value || "").join(" ")
        : "";

      const fields = [
        job.uuid,
        job.job_uuid,
        job.recurrence_uuid,
        job.status,
        job.address,
        job.job_address,
        job.schedule_label,
        fullName,
        job?.quote?.uuid,
        job?.quote?.contact_email,
        job?.customer?.email,
        job?.customer?.phone,
        job?.customer?.mobile_phone,
        job?.customer?.landline_phone,
        serviceLabels,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return fields.some((value) => value.includes(term));
    });
  };

  const filteredJobs = useMemo(() => filterBySearch(jobs), [jobs, searchValue]);
  const filteredTodayJobs = useMemo(() => filterBySearch(todayJobs), [todayJobs, searchValue]);
  const filteredTomorrowJobs = useMemo(
    () => filterBySearch(tomorrowJobs),
    [tomorrowJobs, searchValue]
  );
  const filteredSevenDaysJobs = useMemo(
    () => filterBySearch(sevenDaysJobs),
    [sevenDaysJobs, searchValue]
  );
  const filteredCustomRangeJobs = useMemo(
    () => filterBySearch(customRangeJobs),
    [customRangeJobs, searchValue]
  );

  const handleOpenJob = (job: Job) => {
    const targetUuid = job.job_uuid || job.uuid;
    router.push(`/employee/jobs/uuid/${targetUuid}`);
  };

  const statusCards: Array<{
    key: StatusKey;
    title: string;
    count: number;
    icon: React.ReactNode;
    activeClasses: string;
  }> = [
    {
      key: "pending",
      title: "Pending",
      count: statusCounts.pending,
      icon: <ClipboardList className="h-5 w-5" />,
      activeClasses: "border-yellow-300 bg-yellow-50",
    },
    {
      key: "scheduled",
      title: "Scheduled",
      count: statusCounts.scheduled,
      icon: <Calendar className="h-5 w-5" />,
      activeClasses: "border-blue-300 bg-blue-50",
    },
    {
      key: "in_progress",
      title: "In Progress",
      count: statusCounts.in_progress,
      icon: <Wrench className="h-5 w-5" />,
      activeClasses: "border-purple-300 bg-purple-50",
    },
    {
      key: "cancelled",
      title: "Cancelled",
      count: statusCounts.cancelled,
      icon: <XCircle className="h-5 w-5" />,
      activeClasses: "border-red-300 bg-red-50",
    },
    {
      key: "completed",
      title: "Completed",
      count: statusCounts.completed,
      icon: <CheckCircle2 className="h-5 w-5" />,
      activeClasses: "border-emerald-300 bg-emerald-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-700 border-solid" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#f1f5f9_55%,_#eef2f7)]">
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-green-900">
                  All Jobs
                </h1>
                <p className="text-sm text-gray-600">
                  Jobs overview with scheduled sections and custom date range
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto cursor-pointer border-green-200 bg-white text-green-900 hover:bg-green-50 hover:text-green-900 shadow-sm"
                  onClick={() => router.push(`/employee`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto cursor-pointer"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <Card className="rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by job UUID, customer, address, service, or status..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-full rounded-lg border bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusKey)}
                    className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200 cursor-pointer appearance-none"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xs text-gray-500">
                    {fetchingAll
                      ? "Loading jobs..."
                      : `${jobs.length} total job${jobs.length === 1 ? "" : "s"}`}
                  </p>

                  <p className="text-xs text-gray-500">
                    Showing {filteredJobs.length} result
                    {filteredJobs.length === 1 ? "" : "s"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          {statusCards.map((card) => {
            const isActive = statusFilter === card.key;

            return (
              <Card
                key={card.key}
                className={`rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70 ${
                  isActive ? card.activeClasses : "border-gray-200 bg-white"
                }`}
                onClick={() => setStatusFilter(card.key)}
              >
                <CardContent className="p-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                  </div>
                  <div className="text-green-700">{card.icon}</div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mb-6">
          <Card
            className={`rounded-2xl shadow-sm cursor-pointer transition hover:shadow-md border ${
              statusFilter === "all"
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-white"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">All Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
              </div>
              <div className="text-green-700">
                <Clock3 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </section>

        <JobsSection
          title="Jobs Need To Be Done Today"
          subtitle="Scheduled jobs and recurring occurrences for today"
          jobs={filteredTodayJobs}
          loading={fetchingToday}
          onOpenJob={handleOpenJob}
          formatDateTime={formatDateTime}
          formatMoney={formatMoney}
          getStatusMeta={getStatusMeta}
        />

        <JobsSection
          title="Jobs Tomorrow"
          subtitle="Scheduled jobs and recurring occurrences for tomorrow"
          jobs={filteredTomorrowJobs}
          loading={fetchingTomorrow}
          onOpenJob={handleOpenJob}
          formatDateTime={formatDateTime}
          formatMoney={formatMoney}
          getStatusMeta={getStatusMeta}
        />

        <JobsSection
          title="Jobs 7 Days In The Future"
          subtitle="Scheduled jobs and recurring occurrences 7 days from now"
          jobs={filteredSevenDaysJobs}
          loading={fetchingSevenDays}
          onOpenJob={handleOpenJob}
          formatDateTime={formatDateTime}
          formatMoney={formatMoney}
          getStatusMeta={getStatusMeta}
        />

        <section className="mb-8">
          <Card className="rounded-2xl shadow-sm border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-green-700" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Customer Scheduled Jobs By Date Range
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose a start and end date to fetch scheduled jobs and recurring occurrences
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto] gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    End date
                  </label>
                  <input
                    type="date"
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <Button
                  type="button"
                  className="cursor-pointer self-end"
                  onClick={handleApplyCustomRange}
                >
                  Apply
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer self-end"
                  onClick={handleClearCustomRange}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <JobsSection
          title="Custom Scheduled Date Range"
          subtitle="Scheduled jobs and recurring occurrences returned from backend for the selected range"
          jobs={filteredCustomRangeJobs}
          loading={fetchingCustom}
          onOpenJob={handleOpenJob}
          formatDateTime={formatDateTime}
          formatMoney={formatMoney}
          getStatusMeta={getStatusMeta}
          emptyText="Choose a start and end date, then click Apply."
        />

        <JobsSection
          title="All Jobs"
          subtitle="Full parent jobs list filtered by selected status and search"
          jobs={filteredJobs}
          loading={fetchingAll}
          onOpenJob={handleOpenJob}
          formatDateTime={formatDateTime}
          formatMoney={formatMoney}
          getStatusMeta={getStatusMeta}
        />
      </div>
    </div>
  );
}

function JobsSection({
  title,
  subtitle,
  jobs,
  loading,
  onOpenJob,
  formatDateTime,
  formatMoney,
  getStatusMeta,
  emptyText = "No jobs found for this section.",
}: {
  title: string;
  subtitle?: string;
  jobs: Job[];
  loading?: boolean;
  onOpenJob: (job: Job) => void;
  formatDateTime: (iso?: string | null) => string;
  formatMoney: (amount?: number | null) => string;
  getStatusMeta: (status?: string | null) => {
    label: string;
    className: string;
    icon: React.ReactNode;
  };
  emptyText?: string;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-700 shadow-sm">
            <Calendar className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h2>
            {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
          {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
        </span>
      </div>

      {loading ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            Loading jobs...
          </CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-8 text-center">
            <ClipboardList className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
            <p className="text-sm text-gray-500 mt-1">{emptyText}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={`${title}-${job.kind || "job"}-${job.recurrence_uuid || job.uuid}`}
              job={job}
              onOpen={() => onOpenJob(job)}
              formatDateTime={formatDateTime}
              formatMoney={formatMoney}
              getStatusMeta={getStatusMeta}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function JobCard({
  job,
  onOpen,
  formatDateTime,
  formatMoney,
  getStatusMeta,
}: {
  job: Job;
  onOpen: () => void;
  formatDateTime: (iso?: string | null) => string;
  formatMoney: (amount?: number | null) => string;
  getStatusMeta: (status?: string | null) => {
    label: string;
    className: string;
    icon: React.ReactNode;
  };
}) {
  const statusMeta = getStatusMeta(job.status);

  const customerName =
    formatFullName(
      job?.quote?.contact_first_name ?? job?.customer?.first_name ?? undefined,
      job?.quote?.contact_last_name ?? job?.customer?.last_name ?? undefined,
      true
    ) || "Unnamed customer";

  const servicesText = Array.isArray(job.services)
    ? job.services
        .map((service) => service?.label || service?.value)
        .filter(Boolean)
        .join(", ")
    : "";

  const safeAddress = job.address || job.job_address || "";
  const isRecurringOccurrence =
    job.kind === "recurrence" || Boolean(job.recurrence_uuid);

  const subtotalAmount = Number(job.subtotal_amount ?? 0);
  const gstAmount = Number(job.gst_amount ?? 0);
  const totalAmount = Number(job.total_amount ?? 0);
  const urgentFeeAmount = Number(job.urgent_fee_amount ?? 0);

  const hasUrgentFee =
    Boolean(job.has_urgent_fee) && urgentFeeAmount > 0;

  const serviceCosts = Math.max(
    0,
    subtotalAmount - (hasUrgentFee ? urgentFeeAmount : 0)
  );

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-xl hover:shadow-slate-200/70 cursor-pointer"
      onClick={onOpen}
    >
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400" />

      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-green-100/60 to-emerald-50/20 blur-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                  {customerName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Job UUID: {job.job_uuid || job.uuid}
                </p>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                {isRecurringOccurrence && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 whitespace-nowrap">
                    Recurring Occurrence
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${statusMeta.className}`}
                >
                  {statusMeta.icon}
                  {statusMeta.label}
                </span>
              </div>
            </div>

            {safeAddress && (
              <div className="mb-4 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                <p className="text-sm text-slate-600 truncate">{safeAddress}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoTile
                label="Scheduled"
                value={formatDateTime(job.scheduled_at)}
              />
              <InfoTile
                label="Created"
                value={formatDateTime(job.created_at)}
              />
              <InfoTile
                label="Recurring"
                value={job.is_recurring ? job.recurrence_frequency || "Yes" : "No"}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Pricing
                  </p>
                  <p className="text-sm text-slate-500">
                    Cost summary for this job
                  </p>
                </div>
              </div>

              <div
                className={`grid gap-3 ${
                  hasUrgentFee
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                <PriceTile
                  label="Service Costs"
                  value={formatMoney(serviceCosts)}
                />

                {hasUrgentFee && (
                  <PriceTile
                    label="Urgent Fee"
                    value={formatMoney(urgentFeeAmount)}
                    tone="warning"
                  />
                )}

                <PriceTile
                  label="Subtotal"
                  value={formatMoney(subtotalAmount)}
                />

                <PriceTile
                  label="GST"
                  value={formatMoney(gstAmount)}
                />

                <PriceTile
                  label="Total"
                  value={formatMoney(totalAmount)}
                  tone="strong"
                />
              </div>
            </div>

            {servicesText && (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                  Services
                </p>
                <p className="text-sm text-slate-600 line-clamp-2">{servicesText}</p>
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-slate-400">
                {job.schedule_label || "Open job details"}
              </p>

              <Button
                type="button"
                variant="outline"
                className="cursor-pointer w-full sm:w-auto border-slate-200 bg-white hover:bg-slate-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
              >
                Open Job
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceTile({
  label,
  value,
  tone = "default",
  className = "",
}: {
  label: string;
  value: string;
  tone?: "default" | "strong" | "warning";
  className?: string;
}) {
  const toneClasses =
    tone === "strong"
      ? "border-green-200 bg-green-50/80"
      : tone === "warning"
      ? "border-amber-200 bg-amber-50/80"
      : "border-slate-200 bg-white";

  const valueClasses =
    tone === "strong"
      ? "text-green-800"
      : tone === "warning"
      ? "text-amber-800"
      : "text-slate-800";

  return (
    <div
      className={`rounded-xl border px-3 py-3 min-h-[80px] flex flex-col justify-between ${toneClasses} ${className}`}
    >
      {/* Top (label) */}
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      {/* Bottom (value) */}
      <p className={`text-sm sm:text-base font-semibold ${valueClasses}`}>
        {value}
      </p>
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700 leading-snug">{value}</p>
    </div>
  );
}