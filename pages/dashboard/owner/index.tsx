import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  FileText,
  Search,
  Clock3,
  CalendarDays,
  ArrowRight,
  AlertTriangle,
  MessageSquareMore,
} from "lucide-react";
import { useAuth, roleRedirectMap } from "../../../context/AuthContext";
import { useRouter } from "next/router";
import { formatFullName, getDashboardRole } from "@/utils/utils";
import {
  QuickFindResult,
  QuickFindType,
  QuoteSummary,
  JobSummary,
  CustomerSummary,
} from "@/components/search/QuickFindCards";

type QuickFindPreview = QuoteSummary | JobSummary | CustomerSummary | null;

type QuickFindApiResponse = {
  result?: QuoteSummary | JobSummary | CustomerSummary | null;
  error?: string;
};

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

type AttentionBadge = {
  label: string;
  className: string;
};

type UpcomingJobsResponse = {
  jobs?: Job[];
  total?: number;
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
};

type DashboardStatsResponse = {
  activeJobs?: number;
  customers?: number;
  quotesSent?: number;
  upcomingJobs?: number;
  error?: string;
};

type DashboardStats = {
  activeJobs: number;
  customers: number;
  quotesSent: number;
  upcomingJobs: number;
};

type Inquiry = {
  uuid: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  message?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type InquiriesResponse = {
  inquiries?: Inquiry[];
  total?: number;
  page?: number;
  totalPages?: number;
  error?: string;
};

const DASHBOARD_JOB_LIMIT = 10;

function getJobAttentionBadge(job: Job): AttentionBadge | null {
  if (!job?.scheduled_at) {
    return {
      label: "Needs date",
      className: "bg-yellow-100 text-yellow-900",
    };
  }

  if (!job?.needs_attention) return null;

  switch (job.attention_reason) {
    case "missing_schedule":
      return {
        label: "Needs date",
        className: "bg-yellow-100 text-yellow-900",
      };

    case "low_future_recurrences":
      return {
        label:
          typeof job.future_recurrence_count === "number"
            ? `Low recurrences (${job.future_recurrence_count})`
            : "Low recurrences",
        className: "bg-orange-100 text-orange-900",
      };

    case "no_future_recurrences":
      return {
        label: "No future recurrences",
        className: "bg-red-100 text-red-900",
      };

    case "recurrence_ended":
      return {
        label: "Recurrence ended",
        className: "bg-gray-200 text-gray-900",
      };

    default:
      return {
        label: "Needs update",
        className: "bg-yellow-100 text-yellow-900",
      };
  }
}

function JobCard({
  job,
  onClick,
  formatDateTime,
}: {
  job: Job;
  onClick: () => void;
  formatDateTime: (iso?: string | null) => string;
}) {
  const attentionBadge = getJobAttentionBadge(job);

  return (
    <Card className="cursor-pointer hover:shadow-lg transition" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {formatFullName(
                job?.quote?.contact_first_name ?? undefined,
                job?.quote?.contact_last_name ?? undefined,
                true
              ) || "Unnamed customer"}
            </p>

            {job.address && <p className="text-gray-500 truncate">{job.address}</p>}

            <p className="text-sm text-gray-400">Status: {job.status}</p>

            <p className="text-sm text-gray-400">
              Scheduled at: {formatDateTime(job.scheduled_at)}
            </p>

            {job.is_recurring && typeof job.future_recurrence_count === "number" && (
              <p className="text-xs text-gray-500 mt-1">
                Future recurrences: {job.future_recurrence_count}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {attentionBadge && (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${attentionBadge.className}`}
              >
                {attentionBadge.label}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JobSection({
  title,
  subtitle,
  icon,
  jobs,
  total,
  emptyText,
  loading,
  onJobClick,
  onViewAll,
  onLoadMore,
  hasMore,
  loadMoreLoading,
  formatDateTime,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  jobs: Job[];
  total?: number;
  emptyText: string;
  loading?: boolean;
  onJobClick: (jobUUID: string) => void;
  onViewAll?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadMoreLoading?: boolean;
  formatDateTime: (iso?: string | null) => string;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="text-green-700">{icon}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {typeof total === "number" && (
              <span className="text-xs text-gray-500">
                {total} job{total === 1 ? "" : "s"}
              </span>
            )}

            {onViewAll && (
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={onViewAll}
                type="button"
              >
                View all
              </Button>
            )}
          </div>
        </div>

        {loading && jobs.length === 0 ? (
          <p className="text-sm text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-500">{emptyText}</p>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <JobCard
                key={job.uuid}
                job={job}
                formatDateTime={formatDateTime}
                onClick={() => onJobClick(job.uuid)}
              />
            ))}

            {hasMore && onLoadMore && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={onLoadMore}
                  disabled={loadMoreLoading}
                  type="button"
                >
                  {loadMoreLoading ? "Loading more..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");

  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    customers: 0,
    quotesSent: 0,
    upcomingJobs: 0,
  });

  const [quickFindType, setQuickFindType] = useState<QuickFindType>("quotes");
  const [quickFindValue, setQuickFindValue] = useState("");
  const [quickFindPreview, setQuickFindPreview] = useState<QuickFindPreview>(null);
  const [quickFindSearching, setQuickFindSearching] = useState(false);
  const [quickFindError, setQuickFindError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");

  const [draftQuotes, setDraftQuotes] = useState<any[]>([]);
  const [sentQuotes, setSentQuotes] = useState<any[]>([]);
  const [expiredQuotes, setExpiredQuotes] = useState<any[]>([]);
  const [draftPage, setDraftPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [draftTotalPages, setDraftTotalPages] = useState(1);
  const [sentTotalPages, setSentTotalPages] = useState(1);
  const [fetchingDrafts, setFetchingDrafts] = useState(false);
  const [fetchingSent, setFetchingSent] = useState(false);

  const [attentionJobs, setAttentionJobs] = useState<Job[]>([]);
  const [attentionJobsLoading, setAttentionJobsLoading] = useState(false);
  const [attentionJobsTotal, setAttentionJobsTotal] = useState(0);

  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [todayJobsLoading, setTodayJobsLoading] = useState(false);
  const [todayJobsTotal, setTodayJobsTotal] = useState(0);

  const [tomorrowJobs, setTomorrowJobs] = useState<Job[]>([]);
  const [tomorrowJobsLoading, setTomorrowJobsLoading] = useState(false);
  const [tomorrowJobsTotal, setTomorrowJobsTotal] = useState(0);

  const [next7Jobs, setNext7Jobs] = useState<Job[]>([]);
  const [next7JobsLoading, setNext7JobsLoading] = useState(false);
  const [next7JobsTotal, setNext7JobsTotal] = useState(0);
  const [next7JobsPage, setNext7JobsPage] = useState(1);
  const [next7JobsTotalPages, setNext7JobsTotalPages] = useState(1);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesPage, setInquiriesPage] = useState(1);
  const [inquiriesTotal, setInquiriesTotal] = useState(0);
  const [inquiriesTotalPages, setInquiriesTotalPages] = useState(1);

  const dashboardRole = getDashboardRole(user?.role);
  const UUID_REGEX = /^[a-zA-Z0-9]{9}$/;

  const handleReadTerms = () => {
    router.push("/terms-and-conditions");
  };

  const handleCreateTerms = () => {
    router.push("/admin/terms/new");
  };

  const handleReadPrivacy = () => {
    router.push("/privacy-policies");
  };

  const handleCreatePrivacy = () => {
    router.push("/admin/privacy-policies/new");
  };

  const handleGlobalSearch = () => {
    const value = searchValue.trim();

    if (!value) {
      alert("Enter a search value");
      return;
    }

    router.push(`/dashboard/owner/search?q=${encodeURIComponent(value)}`);
  };

  const handleGlobalSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") handleGlobalSearch();
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "Not set";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Not set";
    return d.toLocaleString();
  };

  const getQuoteStatusBadge = (status?: string | null) => {
    const s = (status || "").toLowerCase();

    if (s === "draft") {
      return { label: "Draft", className: "bg-yellow-100 text-yellow-900" };
    }
    if (s === "sent") {
      return { label: "Sent", className: "bg-blue-100 text-blue-900" };
    }
    if (s === "expired") {
      return { label: "Expired", className: "bg-red-100 text-red-900" };
    }

    return { label: status || "Unknown", className: "bg-gray-100 text-gray-900" };
  };

  const getInquiryStatusBadge = (status?: string | null) => {
    const s = (status || "").toLowerCase();

    if (s === "new") {
      return { label: "New", className: "bg-blue-100 text-blue-900" };
    }

    if (s === "in_progress" || s === "in-progress") {
      return { label: "In Progress", className: "bg-yellow-100 text-yellow-900" };
    }

    if (s === "resolved" || s === "completed") {
      return { label: "Resolved", className: "bg-emerald-100 text-emerald-900" };
    }

    return {
      label: status || "Inquiry",
      className: "bg-gray-100 text-gray-900",
    };
  };

  const getQuoteURL = (quoteUUID: string) => `/dashboard/${dashboardRole}/quotes/${quoteUUID}`;
  const getJobURL = (jobUUID: string) => `/${dashboardRole}/jobs/uuid/${jobUUID}`;
  const getInquiryURL = (inquiryUUID: string) => `/employee/inquiry/${inquiryUUID}`;

  const handleQuickFind = async () => {
    const uuid = quickFindValue.trim();

    setQuickFindError(null);
    setQuickFindPreview(null);

    if (!uuid) {
      alert("Enter a UUID.");
      return;
    }

    if (!UUID_REGEX.test(uuid)) {
      alert("UUID must be exactly 9 letters or numbers.");
      return;
    }

    try {
      setQuickFindSearching(true);

      const res = await fetch(`/api/quick-find?type=${quickFindType}&uuid=${uuid}`);
      const data: QuickFindApiResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        setQuickFindError(data?.error || "Search failed");
        return;
      }

      if (!data?.result) {
        setQuickFindError("No results found");
        return;
      }

      setQuickFindPreview(data.result);
    } catch (err: any) {
      setQuickFindError(err?.message || "Search failed");
    } finally {
      setQuickFindSearching(false);
    }
  };

  const handleQuickFindKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") handleQuickFind();
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/dashboard/employee/stats");
      const data: DashboardStatsResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch dashboard stats");
      }

      setStats({
        activeJobs: Number(data.activeJobs || 0),
        customers: Number(data.customers || 0),
        quotesSent: Number(data.quotesSent || 0),
        upcomingJobs: Number(data.upcomingJobs || 0),
      });
    } catch (err) {
      console.error(err);
      setStats({
        activeJobs: 0,
        customers: 0,
        quotesSent: 0,
        upcomingJobs: 0,
      });
    }
  };

  const fetchDraftQuotes = async ({
    pageNumber,
    quoteLimit = 5,
    lengthOfDays = 7,
  }: {
    pageNumber: number;
    quoteLimit?: number;
    lengthOfDays?: number;
  }) => {
    if (fetchingDrafts || pageNumber > draftTotalPages) return;
    setFetchingDrafts(true);

    try {
      const res = await fetch(
        `/api/quotes?status=draft&limit=${quoteLimit}&page=${pageNumber}&olderThan=${lengthOfDays}`
      );
      if (!res.ok) throw new Error("Failed to fetch draft quotes");
      const data = await res.json();

      setDraftQuotes((prev) => [...prev, ...(data.quotes || [])]);
      setDraftPage(data.page);
      setDraftTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingDrafts(false);
    }
  };

  const fetchSentQuotes = async ({
    pageNumber,
    quoteLimit = 5,
    lengthOfDays = 7,
  }: {
    pageNumber: number;
    quoteLimit?: number;
    lengthOfDays?: number;
  }) => {
    if (fetchingSent || pageNumber > sentTotalPages) return;
    setFetchingSent(true);

    try {
      const res = await fetch(
        `/api/quotes?status=sent&limit=${quoteLimit}&page=${pageNumber}&olderThan=${lengthOfDays}`
      );
      if (!res.ok) throw new Error("Failed to fetch sent quotes");
      const data = await res.json();

      setSentQuotes((prev) => [...prev, ...(data.quotes || [])]);
      setSentPage(data.page);
      setSentTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSent(false);
    }
  };

  const fetchExpiredQuotes = async ({
    lengthOfDays = 7,
    quoteLimit = 5,
  }: {
    lengthOfDays?: number;
    quoteLimit?: number;
  }) => {
    try {
      const res = await fetch(
        `/api/quotes?status=expired&limit=${quoteLimit}&olderThan=${lengthOfDays}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch expired quotes");
      setExpiredQuotes(data.quotes || []);
    } catch (err: any) {
      console.error("Error fetching expired quotes:", err.message || err);
      setExpiredQuotes([]);
    }
  };

  const fetchDashboardJobSection = async ({
    range,
    page = 1,
    append = false,
    limit = DASHBOARD_JOB_LIMIT,
  }: {
    range: "attention" | "today" | "tomorrow" | "next7days";
    page?: number;
    append?: boolean;
    limit?: number;
  }) => {
    const setLoadingForRange = (value: boolean) => {
      if (range === "attention") setAttentionJobsLoading(value);
      if (range === "today") setTodayJobsLoading(value);
      if (range === "tomorrow") setTomorrowJobsLoading(value);
      if (range === "next7days") setNext7JobsLoading(value);
    };

    setLoadingForRange(true);

    try {
      const res = await fetch(`/api/dashboard?range=${range}&limit=${limit}&page=${page}`);
      if (!res.ok) throw new Error(`Failed to fetch ${range} jobs`);

      const data: UpcomingJobsResponse = await res.json();
      const jobs = data.jobs || [];
      const total = data.total || jobs.length;

      if (range === "attention") {
        setAttentionJobs(jobs);
        setAttentionJobsTotal(total);
      }

      if (range === "today") {
        setTodayJobs(jobs);
        setTodayJobsTotal(total);
      }

      if (range === "tomorrow") {
        setTomorrowJobs(jobs);
        setTomorrowJobsTotal(total);
      }

      if (range === "next7days") {
        setNext7Jobs((prev) => (append ? [...prev, ...jobs] : jobs));
        setNext7JobsTotal(total);
        setNext7JobsPage(data.page || page);
        setNext7JobsTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      if (range === "attention") {
        setAttentionJobs([]);
        setAttentionJobsTotal(0);
      }
      if (range === "today") {
        setTodayJobs([]);
        setTodayJobsTotal(0);
      }
      if (range === "tomorrow") {
        setTomorrowJobs([]);
        setTomorrowJobsTotal(0);
      }
      if (range === "next7days") {
        if (!append) {
          setNext7Jobs([]);
          setNext7JobsTotal(0);
          setNext7JobsPage(1);
          setNext7JobsTotalPages(1);
        }
      }
    } finally {
      setLoadingForRange(false);
    }
  };

  const fetchInquiries = async ({
    pageNumber = 1,
    inquiryLimit = 5,
    append = false,
  }: {
    pageNumber?: number;
    inquiryLimit?: number;
    append?: boolean;
  }) => {
    if (inquiriesLoading) return;

    setInquiriesLoading(true);

    try {
      const res = await fetch(`/api/inquiries?limit=${inquiryLimit}&page=${pageNumber}`);
      const data: InquiriesResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch inquiries");
      }

      const nextItems = data.inquiries || [];

      setInquiries((prev) => (append ? [...prev, ...nextItems] : nextItems));
      setInquiriesPage(Number(data.page || pageNumber));
      setInquiriesTotal(Number(data.total || nextItems.length));
      setInquiriesTotalPages(Number(data.totalPages || 1));
    } catch (err) {
      console.error(err);
      if (!append) {
        setInquiries([]);
        setInquiriesPage(1);
        setInquiriesTotal(0);
        setInquiriesTotalPages(1);
      }
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleLoadMoreNext7Days = async () => {
    if (next7JobsLoading || next7JobsPage >= next7JobsTotalPages) return;
    await fetchDashboardJobSection({
      range: "next7days",
      page: next7JobsPage + 1,
      append: true,
    });
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) return alert("Enter an email");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) throw new Error("Failed to send invite");
      alert(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("employee");
    } catch (err) {
      console.error(err);
      alert("Error sending invite");
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

      if (user.role !== "owner") {
        router.replace(roleRedirectMap[user.role] || "/");
        return;
      }

      setFullName(formatFullName(user.first_name, user.last_name, false));

      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchExpiredQuotes({ lengthOfDays: 1, quoteLimit: 5 }),
          fetchDraftQuotes({ pageNumber: 1, quoteLimit: 5 }),
          fetchSentQuotes({ pageNumber: 1, quoteLimit: 5 }),
          fetchDashboardJobSection({ range: "attention", limit: DASHBOARD_JOB_LIMIT }),
          fetchDashboardJobSection({ range: "today", limit: DASHBOARD_JOB_LIMIT }),
          fetchDashboardJobSection({ range: "tomorrow", limit: DASHBOARD_JOB_LIMIT }),
          fetchDashboardJobSection({ range: "next7days", limit: DASHBOARD_JOB_LIMIT }),
          fetchInquiries({ pageNumber: 1, inquiryLimit: 5 }),
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-700 border-solid" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-green-900">
              Owner Dashboard
            </h1>

            <p className="text-sm text-gray-600">
              Welcome back {fullName} <span className="wave text-2xl">👋</span>
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto cursor-pointer hover:bg-green-900 hover:text-white"
                onClick={() => router.push("/dashboard/owner/search")}
              >
                <Search className="h-4 w-4 mr-2" />
                Deep Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center sm:justify-start cursor-pointer hover:bg-green-800 hover:text-white min-h-[48px] whitespace-normal text-left"
            onClick={handleReadTerms}
          >
            <FileText className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate sm:whitespace-normal">
              Read Terms & Conditions
            </span>
          </Button>

          <Button
            type="button"
            className="w-full justify-center sm:justify-start bg-emerald-600 text-white hover:bg-emerald-800 cursor-pointer min-h-[48px] whitespace-normal text-left"
            onClick={handleCreateTerms}
          >
            <FileText className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate sm:whitespace-normal">
              Create New Terms & Conditions
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-center sm:justify-start cursor-pointer hover:bg-green-500 hover:text-white min-h-[48px] whitespace-normal text-left"
            onClick={handleReadPrivacy}
          >
            <FileText className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate sm:whitespace-normal">
              Read Privacy Policy
            </span>
          </Button>

          <Button
            type="button"
            className="w-full justify-center sm:justify-start bg-emerald-400 text-white hover:bg-emerald-600 cursor-pointer min-h-[48px] whitespace-normal text-left"
            onClick={handleCreatePrivacy}
          >
            <FileText className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate sm:whitespace-normal">
              Create New Privacy Policy
            </span>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Active Jobs"
            value={String(stats.activeJobs)}
            icon={<Calendar />}
            onClick={() => router.push("/dashboard/owner/jobs?filter=active")}
          />
          <StatCard
            title="Customers"
            value={String(stats.customers)}
            icon={<Users />}
            onClick={() => router.push("/dashboard/owner/customers")}
          />
          <StatCard
            title="Quotes Sent"
            value={String(stats.quotesSent)}
            icon={<FileText />}
            onClick={() => router.push("/dashboard/owner/quotes?status=sent")}
          />
          <StatCard
            title="Upcoming Jobs"
            value={String(stats.upcomingJobs)}
            icon={<Clock3 />}
            onClick={() => router.push("/dashboard/owner/jobs?range=next7days")}
          />
        </section>

        <section className="mb-8">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-700" />
                  <h2 className="text-xl font-semibold">Search</h2>
                </div>
                <p className="text-xs text-gray-500">
                  Search by name, email, phone, address, or UUID
                </p>
              </div>

              <div className="grid gap-2 grid-cols-1 sm:grid-cols-[auto_auto_1fr]">
                <input
                  type="text"
                  placeholder="Search customer, quote, or job..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleGlobalSearchKeyDown}
                  className="border px-3 py-2 rounded w-full order-1 sm:order-3"
                />

                <Button
                  onClick={handleGlobalSearch}
                  size="lg"
                  className="bg-green-600 text-white cursor-pointer hover:bg-green-800 order-2 sm:order-1"
                >
                  Search
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="cursor-pointer order-3 sm:order-2"
                  onClick={() => setSearchValue("")}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <Card className="rounded-2xl shadow-sm lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-700" />
                  <h2 className="text-xl font-semibold">Quick Find</h2>
                </div>
                <p className="text-xs text-gray-500">9-character UUID</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={quickFindType}
                  onChange={(e) => {
                    setQuickFindType(e.target.value as QuickFindType);
                    setQuickFindPreview(null);
                    setQuickFindError(null);
                  }}
                  className="border px-3 py-2 rounded w-full hover:cursor-pointer"
                >
                  <option value="quotes">Quote</option>
                  <option value="jobs">Job</option>
                  <option value="customers">Customer</option>
                </select>

                <input
                  type="text"
                  placeholder="Enter UUID..."
                  value={quickFindValue}
                  maxLength={9}
                  onChange={(e) => setQuickFindValue(e.target.value)}
                  onKeyDown={handleQuickFindKeyDown}
                  className="border px-3 py-2 rounded w-full sm:col-span-2"
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  onClick={handleQuickFind}
                  className="cursor-pointer bg-green-600 text-white hover:bg-green-900 hover:text-white"
                >
                  Go
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer bg-red-500 text-white hover:bg-red-800 hover:text-white"
                  onClick={() => {
                    setQuickFindValue("");
                    setQuickFindPreview(null);
                    setQuickFindError(null);
                  }}
                >
                  Clear
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {quickFindSearching && <p className="text-sm text-gray-500">Searching…</p>}
                {!quickFindSearching && quickFindError && (
                  <p className="text-sm text-red-600">{quickFindError}</p>
                )}
                <QuickFindResult type={quickFindType} result={quickFindPreview} />
              </div>
            </CardContent>
          </Card>
        </section>

        {attentionJobs.length > 0 && (
          <section className="mb-8">
            <Card className="rounded-2xl shadow-sm border-yellow-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-700" />
                    <div>
                      <h2 className="text-xl font-semibold text-yellow-900">
                        Jobs Requiring Attention
                      </h2>
                      <p className="text-xs text-yellow-700">
                        Missing dates, low recurrences, or ended schedules
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-700">
                      {attentionJobsTotal} job{attentionJobsTotal === 1 ? "" : "s"}
                    </span>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => router.push(`/employee/jobs/all`)}
                      // onClick={() => router.push(`/employee/jobs?filter=attention`)}
                    >
                      View all
                    </Button>
                  </div>
                </div>

                {attentionJobsLoading && attentionJobs.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading attention jobs...</p>
                ) : (
                  <div className="space-y-2">
                    {attentionJobs.map((job) => (
                      <JobCard
                        key={job.uuid}
                        job={job}
                        formatDateTime={formatDateTime}
                        onClick={() => router.push(getJobURL(job.uuid))}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <JobSection
            title="Today"
            subtitle="Up to 10 jobs shown on dashboard"
            icon={<Clock3 className="h-5 w-5" />}
            jobs={todayJobs}
            total={todayJobsTotal}
            emptyText="No jobs scheduled for today."
            loading={todayJobsLoading}
            onJobClick={(uuid) => router.push(getJobURL(uuid))}
            onViewAll={() => router.push("/dashboard/owner/jobs?range=today")}
            formatDateTime={formatDateTime}
          />

          <JobSection
            title="Tomorrow"
            subtitle="Up to 10 jobs shown on dashboard"
            icon={<Calendar className="h-5 w-5" />}
            jobs={tomorrowJobs}
            total={tomorrowJobsTotal}
            emptyText="No jobs scheduled for tomorrow."
            loading={tomorrowJobsLoading}
            onJobClick={(uuid) => router.push(getJobURL(uuid))}
            onViewAll={() => router.push("/dashboard/owner/jobs?range=tomorrow")}
            formatDateTime={formatDateTime}
          />

          <JobSection
            title="Next 7 Days"
            subtitle="10 per page with load more"
            icon={<CalendarDays className="h-5 w-5" />}
            jobs={next7Jobs}
            total={next7JobsTotal}
            emptyText="No upcoming jobs in the next 7 days."
            loading={next7JobsLoading}
            onJobClick={(uuid) => router.push(getJobURL(uuid))}
            onViewAll={() => router.push("/dashboard/owner/jobs?range=next7days")}
            onLoadMore={handleLoadMoreNext7Days}
            hasMore={next7JobsPage < next7JobsTotalPages}
            loadMoreLoading={next7JobsLoading}
            formatDateTime={formatDateTime}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="rounded-2xl shadow-sm lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Jobs Workspace</h2>
                  <p className="text-xs text-gray-500">
                    Open the full jobs view for calendar, filters, and all results
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => router.push("/employee/jobs/all")}
                >
                  Open jobs page
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/owner/jobs?range=today")}
                  className="rounded-xl border bg-white p-4 text-left hover:shadow transition cursor-pointer"
                >
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{todayJobsTotal}</p>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/owner/jobs?range=tomorrow")}
                  className="rounded-xl border bg-white p-4 text-left hover:shadow transition cursor-pointer"
                >
                  <p className="text-sm text-gray-500">Tomorrow</p>
                  <p className="text-2xl font-bold text-gray-900">{tomorrowJobsTotal}</p>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/owner/jobs?range=next7days")}
                  className="rounded-xl border bg-white p-4 text-left hover:shadow transition cursor-pointer"
                >
                  <p className="text-sm text-gray-500">Next 7 Days</p>
                  <p className="text-2xl font-bold text-gray-900">{next7JobsTotal}</p>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Draft Quotes</h2>
                  <span className="text-xs text-gray-500">Awaiting Prices</span>
                </div>

                <div className="max-h-72 overflow-auto space-y-2 pb-3 pr-1">
                  {draftQuotes.length === 0 ? (
                    <p>No draft quotes</p>
                  ) : (
                    draftQuotes.map((quote) => {
                      const badge = getQuoteStatusBadge("draft");
                      return (
                        <Card
                          key={quote.uuid}
                          className="cursor-pointer hover:shadow-lg transition"
                          onClick={() => router.push(getQuoteURL(quote.uuid))}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="pt-1 min-w-0">
                                <p className="font-semibold truncate">
                                  {quote.contact_first_name} {quote.contact_last_name}
                                </p>
                                <p className="text-gray-500">Total: ${quote.total_amount}</p>
                              </div>

                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}

                  {fetchingDrafts && (
                    <p className="text-gray-500 text-center py-2">Loading more drafts...</p>
                  )}

                  {!fetchingDrafts && draftPage < draftTotalPages && (
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={() =>
                        fetchDraftQuotes({ pageNumber: draftPage + 1, quoteLimit: 5 })
                      }
                    >
                      Load more drafts
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Sent Quotes</h2>
                  <span className="text-xs text-gray-500">Awaiting Reply</span>
                </div>

                <div className="max-h-72 overflow-auto space-y-2 pb-3 pr-1">
                  {sentQuotes.length === 0 ? (
                    <p>No sent quotes</p>
                  ) : (
                    sentQuotes.map((quote) => {
                      const badge = getQuoteStatusBadge("sent");
                      return (
                        <Card
                          key={quote.uuid}
                          className="cursor-pointer hover:shadow-lg transition"
                          onClick={() => router.push(getQuoteURL(quote.uuid))}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="pt-1 min-w-0">
                                <p className="font-semibold truncate">
                                  {quote.contact_first_name} {quote.contact_last_name}
                                </p>
                                <p className="text-gray-500">Total: ${quote.total_amount}</p>
                              </div>

                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}

                  {fetchingSent && (
                    <p className="text-gray-500 text-center py-2">Loading more sent quotes...</p>
                  )}

                  {!fetchingSent && sentPage < sentTotalPages && (
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={() =>
                        fetchSentQuotes({ pageNumber: sentPage + 1, quoteLimit: 5 })
                      }
                    >
                      Load more sent quotes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquareMore className="h-5 w-5 text-green-700" />
                    <h2 className="text-lg font-semibold">Inquiries</h2>
                  </div>

                  <span className="text-xs text-gray-500">
                    {inquiriesTotal} total
                  </span>
                </div>

                <div className="max-h-72 overflow-auto space-y-2 pb-3 pr-1">
                  {inquiriesLoading && inquiries.length === 0 ? (
                    <p className="text-sm text-gray-500">Loading inquiries...</p>
                  ) : inquiries.length === 0 ? (
                    <p>No inquiries</p>
                  ) : (
                    inquiries.map((inquiry) => {
                      const badge = getInquiryStatusBadge(inquiry.status);
                      const fullInquiryName =
                        formatFullName(
                          inquiry.first_name ?? undefined,
                          inquiry.last_name ?? undefined,
                          true
                        ) || "Unnamed inquiry";

                      return (
                        <Card
                          key={inquiry.uuid}
                          className="cursor-pointer hover:shadow-lg transition"
                          onClick={() => router.push(getInquiryURL(inquiry.uuid))}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 truncate">
                                  {fullInquiryName}
                                </p>

                                {inquiry.address && (
                                  <p className="text-sm text-gray-500 truncate">
                                    {inquiry.address}
                                  </p>
                                )}

                                {(inquiry.mobile || inquiry.phone || inquiry.email) && (
                                  <p className="text-xs text-gray-400 truncate mt-1">
                                    {inquiry.mobile || inquiry.phone || inquiry.email}
                                  </p>
                                )}

                                {inquiry.message && (
                                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                    {inquiry.message}
                                  </p>
                                )}

                                <p className="text-xs text-gray-400 mt-2">
                                  Created: {formatDateTime(inquiry.created_at)}
                                </p>
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
                    })
                  )}

                  {!inquiriesLoading && inquiriesPage < inquiriesTotalPages && (
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={() =>
                        fetchInquiries({
                          pageNumber: inquiriesPage + 1,
                          inquiryLimit: 5,
                          append: true,
                        })
                      }
                    >
                      Load more inquiries
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    type="button"
                    onClick={() => router.push("/employee/inquiries")}
                  >
                    View all inquiries
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Expired Quotes</h2>
                  <span className="text-xs text-gray-500">Follow Up</span>
                </div>

                {expiredQuotes.length === 0 ? (
                  <p>No expired quotes</p>
                ) : (
                  <div className="space-y-2">
                    {expiredQuotes.map((quote) => {
                      const badge = getQuoteStatusBadge("expired");
                      return (
                        <Card
                          key={quote.uuid}
                          className="cursor-pointer hover:shadow-lg transition"
                          onClick={() => router.push(getQuoteURL(quote.uuid))}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="pt-1 min-w-0">
                                <p className="font-semibold truncate">
                                  {quote.contact_first_name} {quote.contact_last_name}
                                </p>
                                <p className="text-gray-500">Total: ${quote.total_amount}</p>
                              </div>

                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`rounded-2xl shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-green-700">{icon}</div>
      </CardContent>
    </Card>
  );
}