import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, roleRedirectMap } from "../../../../context/AuthContext";
import { formatFullName, getDashboardRole } from "@/utils/utils";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Search,
  XCircle,
  CheckCircle2,
  Wrench,
  ClipboardList,
} from "lucide-react";

type Job = {
  uuid: string;
  status?: string | null;
  scheduled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  total_amount?: number | null;
  address?: string | null;
  is_recurring?: boolean;
  recurrence_frequency?: string | null;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  schedule_label?: string | null;

  quote?: {
    uuid?: string | null;
    contact_first_name?: string | null;
    contact_last_name?: string | null;
  } | null;

  customer?: {
    uuid?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
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
  error?: string;
};

type StatusKey =
  | "all"
  | "pending"
  | "scheduled"
  | "in_progress"
  | "cancelled"
  | "completed";

export default function OwnerJobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const dashboardRole = getDashboardRole(user?.role);

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");

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

  const fetchJobs = async () => {
    try {
      setFetching(true);

      const res = await fetch("/api/jobs/all", {
        method: "GET",
        credentials: "include",
      });

      const data: JobsResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch jobs");
      }

      setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setJobs([]);
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
        await fetchJobs();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user]);

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

  const filteredJobs = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    return jobs.filter((job) => {
      const fullName =
        formatFullName(
          job?.quote?.contact_first_name ?? job?.customer?.first_name ?? undefined,
          job?.quote?.contact_last_name ?? job?.customer?.last_name ?? undefined,
          true
        ) || "";

      const matchesStatus =
        statusFilter === "all" ? true : normalizeStatus(job.status) === statusFilter;

      if (!matchesStatus) return false;

      if (!term) return true;

      const serviceLabels = Array.isArray(job.services)
        ? job.services
          .map((service) => service?.label || service?.value || "")
          .join(" ")
        : "";

      const fields = [
        job.uuid,
        job.status,
        job.address,
        job.schedule_label,
        fullName,
        job?.quote?.uuid,
        job?.customer?.email,
        job?.customer?.phone,
        serviceLabels,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return fields.some((value) => value.includes(term));
    });
  }, [jobs, statusFilter, searchValue]);

  const handleOpenJob = (jobUUID: string) => {
    router.push(`/${dashboardRole}/jobs/uuid/${jobUUID}`);
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
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-green-900">
                  All Jobs
                </h1>
                <p className="text-sm text-gray-600">
                  View all jobs and filter by current status
                </p>
              </div>

              <div className="w-full lg:w-auto lg:shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full lg:w-auto cursor-pointer border-green-200 bg-white text-green-900 hover:bg-green-50 hover:text-green-900 shadow-sm"
                  onClick={() => router.push(`/${dashboardRole}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
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
                    {fetching
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
                className={`rounded-2xl shadow-sm cursor-pointer transition hover:shadow-md border ${isActive ? card.activeClasses : "border-gray-200 bg-white"
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
            className={`rounded-2xl shadow-sm cursor-pointer transition hover:shadow-md border ${statusFilter === "all" ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
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

        {fetching && jobs.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Loading jobs...
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center">
              <ClipboardList className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900">No jobs found</h2>
              <p className="text-sm text-gray-500 mt-1">
                No jobs matched the current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredJobs.map((job) => {
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

              return (
                <Card
                  key={job.uuid}
                  className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition"
                  onClick={() => handleOpenJob(job.uuid)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-lg font-semibold text-gray-900 truncate">
                            {customerName}
                          </h2>

                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusMeta.className}`}
                          >
                            {statusMeta.icon}
                            {statusMeta.label}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mb-2">Job UUID: {job.uuid}</p>

                        {job.address && (
                          <p className="text-sm text-gray-600 truncate">{job.address}</p>
                        )}

                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-500">
                            Scheduled: {formatDateTime(job.scheduled_at)}
                          </p>

                          <p className="text-sm text-gray-500">
                            Created: {formatDateTime(job.created_at)}
                          </p>

                          <p className="text-sm text-gray-500">
                            Total: {formatMoney(job.total_amount)}
                          </p>

                          {job.is_recurring && (
                            <p className="text-sm text-gray-500">
                              Recurring: {job.recurrence_frequency || "Yes"}
                            </p>
                          )}
                        </div>

                        {servicesText && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            Services: {servicesText}
                          </p>
                        )}

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-xs text-gray-400">
                            {job.schedule_label || "Open job details"}
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer w-full sm:w-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenJob(job.uuid);
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}