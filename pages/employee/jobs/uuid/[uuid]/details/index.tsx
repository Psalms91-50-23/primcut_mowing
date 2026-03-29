import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  CalendarDays,
  Clock3,
  FileText,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Receipt,
  Image as ImageIcon,
  RotateCcw,
  User2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useAuth, roleRedirectMap } from "@/context/AuthContext";
import { formatFullName } from "@/utils/utils";
import { useUI } from "@/context/UIContext";

type ServiceRecord = {
  code?: string | null;
  unit?: string | null;
  label?: string | null;
  quantity?: number | null;
  line_total?: number | null;
  unit_price?: number | null;
  description?: string | null;
  service_uuid?: string | null;
};

type QuoteImageRecord = {
  url?: string | null;
  image_url?: string | null;
  label?: string | null;
  alt?: string | null;
  file_name?: string | null;
};

type QuoteSummary = {
  uuid?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  status?: string | null;
  total_amount?: number | null;
  images?: QuoteImageRecord[] | null;
};

type JobImageRecord = {
  url?: string | null;
  image_url?: string | null;
  label?: string | null;
  alt?: string | null;
  file_name?: string | null;
};

type JobRecurrenceRecord = {
  id?: number;
  uuid?: string;
  parent_job_uuid?: string | null;
  job_uuid?: string | null;
  scheduled_at?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  recurrence_index?: number | null;
  [key: string]: any;
};

type JobRecord = {
  id?: number;
  uuid?: string;
  customer_uuid?: string | null;
  quote_uuid?: string | null;
  services?: ServiceRecord[];
  total_amount?: number | null;
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  scheduled_at?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  completed_date?: string | null;
  is_completed?: boolean;
  is_deleted?: boolean;
  is_recurring?: boolean;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  recurrence_frequency?: string | null;
  job_images?: JobImageRecord[];
  previous_status?: string | null;
  job_address?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  has_urgent_fee?: boolean | null;
  urgent_fee_amount?: number | null;
  notes?: string | null;
  client_schedule_message?: string | null;
  client_schedule_message_sent_at?: string | null;
  quote?: QuoteSummary | null;
  job_recurrences?: JobRecurrenceRecord[];
};

const Spinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
    <p className="text-sm text-gray-600">{text}</p>
  </div>
);

function formatCurrency(amount?: number | null) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "full",
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

function formatStatus(status?: string | null) {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getImageUrl(image?: JobImageRecord | QuoteImageRecord) {
  return image?.url || image?.image_url || "";
}

function recurrenceLabel(job?: JobRecord | null) {
  if (!job?.recurrence_frequency) return "One-off";

  const frequency = formatStatus(job.recurrence_frequency);

  if (!job.is_recurring) {
    return frequency;
  }

  const interval = Number(job.recurrence_interval || 1);
  if (interval <= 1) return frequency;

  return `Every ${interval} ${frequency.toLowerCase()}`;
}

function calculateSubtotalFromServices(services: ServiceRecord[] = []) {
  return services.reduce((sum, service) => {
    const quantity = Number(service.quantity ?? 0);
    const unitPrice = Number(service.unit_price ?? 0);
    const lineTotal = Number(service.line_total ?? 0);

    if (lineTotal > 0) return sum + lineTotal;
    return sum + quantity * unitPrice;
  }, 0);
}

export default function EmployeesJobsDetailsPage() {
  const router = useRouter();
  const { uuid } = router.query;
  const { user, loading, role } = useAuth();
  const { openImage } = useUI();

  const [job, setJob] = useState<JobRecord | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const dashboardPath =
    (role && roleRedirectMap[role]) ||
    (user?.role && roleRedirectMap[user.role]) ||
    "/dashboard";

  const fetchJob = async (showRefreshState = false) => {
    if (!uuid || typeof uuid !== "string") return;

    try {
      if (showRefreshState) setRefreshing(true);
      else setPageLoading(true);

      setError("");

      const response = await fetch(`/api/jobs/${uuid}/details`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch job details");
      }
      setJob(data.job || null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch job details");
      setJob(null);
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!router.isReady || typeof uuid !== "string") return;
    fetchJob();
  }, [router.isReady, uuid]);

  const services = useMemo(() => job?.services || [], [job]);
  const recurrences = useMemo(() => job?.job_recurrences || [], [job]);
  const jobImages = useMemo(() => job?.job_images || [], [job]);
  const quoteImages = useMemo(() => job?.quote?.images || [], [job]);

  const servicesSubtotal = useMemo(
    () => calculateSubtotalFromServices(services),
    [services]
  );

  const urgentFeeAmount = Number(job?.urgent_fee_amount ?? 0);
  const hasUrgentFee = Boolean(job?.has_urgent_fee) && urgentFeeAmount > 0;

  const subtotalAmount =
    job?.subtotal_amount != null
      ? Number(job.subtotal_amount)
      : servicesSubtotal + urgentFeeAmount;

  const serviceSubtotalDisplay =
    job?.subtotal_amount != null && hasUrgentFee
      ? Math.max(0, subtotalAmount - urgentFeeAmount)
      : servicesSubtotal;

  const gstAmount =
    job?.gst_amount != null ? Number(job.gst_amount) : subtotalAmount * 0.15;

  const totalAmount =
    job?.total_amount != null ? Number(job.total_amount) : subtotalAmount + gstAmount;

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

  const handleCompleteJob = () => {
    const targetUuid = job?.uuid || uuid;
    if (!targetUuid || typeof targetUuid !== "string") return;
    router.push(`/employee/jobs/uuid/${targetUuid}/complete`);
  };

  const handleCancelJob = () => {
    const targetUuid = job?.uuid || uuid;
    if (!targetUuid || typeof targetUuid !== "string") return;
    router.push(`/employee/jobs/uuid/${targetUuid}/cancel`);
  };


  const handleEditJob = () => {
    const targetUuid = job?.uuid || uuid;
    if (!targetUuid || typeof targetUuid !== "string") return;
    router.push(`/employee/jobs/uuid/${targetUuid}`);
  };

  if (loading || pageLoading) {
    return <Spinner text="Loading job details..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-red-600">You must be logged in to view this page.</div>
      </div>
    );
  }

  if (!["employee", "owner", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-red-600">You do not have permission to view this page.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review the job, quote summary, services, and recurrence details.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleBackToPreviousPage}
              className="border-gray-300 hover:cursor-pointer"
            >
              Back to Previous Page
            </Button>

            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="border-gray-300 hover:cursor-pointer"
            >
              Back to Dashboard
            </Button>

            <Button
              onClick={handleEditJob}
              className="hover:cursor-pointer"
              disabled={!job?.uuid && typeof uuid !== "string"}
            >
              Edit Job
            </Button>

            <Button
              onClick={handleCompleteJob}
              className="hover:cursor-pointer"
              disabled={!job?.uuid && typeof uuid !== "string"}
            >
              Complete Job
            </Button>

            <Button
              onClick={handleCancelJob}
              className="bg-red-500 hover:bg-red-800 text-white hover:cursor-pointer"
              disabled={!job?.uuid && typeof uuid !== "string"}
            >
              Cancel Job
            </Button>

            <Button
              variant="outline"
              onClick={() => fetchJob(true)}
              disabled={refreshing}
              className="border-gray-300 hover:cursor-pointer"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <h2 className="font-semibold text-red-800">Unable to load job</h2>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!error && !job ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">No job details found.</p>
            </CardContent>
          </Card>
        ) : null}

        {!error && job ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Job Summary</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Job ID</p>
                      <p className="mt-1 font-semibold text-gray-900">{job.uuid || "—"}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</p>
                      <p className="mt-1 font-semibold text-gray-900">{formatStatus(job.status)}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Scheduled At</p>
                      <p className="mt-1 font-semibold text-gray-900">{formatDateTime(job.scheduled_at)}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Schedule Window</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {job.scheduled_window_mins ? `${job.scheduled_window_mins} mins` : "—"}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created</p>
                      <p className="mt-1 font-semibold text-gray-900">{formatDateTime(job.created_at)}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Updated</p>
                      <p className="mt-1 font-semibold text-gray-900">{formatDateTime(job.updated_at)}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Completed</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {job.is_completed ? formatDateOnly(job.completed_date) : "Not completed"}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Previous Status</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {job.previous_status ? formatStatus(job.previous_status) : "—"}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-white p-4 md:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Urgency</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {hasUrgentFee
                          ? `Urgent service applied (${formatCurrency(urgentFeeAmount)})`
                          : "Standard priority"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border bg-white p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-700" />
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Job Address</p>
                    </div>
                    <p className="font-semibold text-gray-900">{job.job_address || "No address available"}</p>
                  </div>

                  {job.notes ? (
                    <div className="mt-4 rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{job.notes}</p>
                    </div>
                  ) : null}

                  {job.client_schedule_message ? (
                    <div className="mt-4 rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Client Schedule Message
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                        {job.client_schedule_message}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        Sent: {formatDateTime(job.client_schedule_message_sent_at)}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Quote Summary</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Quote ID</p>
                      <p className="mt-1 font-semibold text-gray-900">{job.quote?.uuid || job.quote_uuid || "—"}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Quote Status</p>
                      <p className="mt-1 font-semibold text-gray-900">{formatStatus(job.quote?.status)}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Contact Name</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatFullName(job.quote?.contact_first_name || "", job.quote?.contact_last_name || "") || "—"}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Quote Total</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {formatCurrency(job.quote?.total_amount ?? totalAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                  </div>

                  {services.length === 0 ? (
                    <p className="text-sm text-gray-600">No services found for this job.</p>
                  ) : (
                    <div className="space-y-4">
                      {services.map((service, index) => {
                        const quantity = Number(service.quantity ?? 0);
                        const unitPrice = Number(service.unit_price ?? 0);
                        const lineTotal =
                          Number(service.line_total ?? 0) > 0
                            ? Number(service.line_total)
                            : quantity * unitPrice;

                        return (
                          <div
                            key={`${service.service_uuid || service.code || "service"}-${index}`}
                            className="rounded-xl border bg-white p-4"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {service.label || "Unnamed Service"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                  {service.description || "No description available."}
                                </p>
                              </div>

                              <div className="min-w-[180px] rounded-lg bg-gray-50 p-3 text-sm">
                                <div className="flex items-center justify-between py-1">
                                  <span className="text-gray-600">Quantity</span>
                                  <span className="font-medium text-gray-900">{quantity}</span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                  <span className="text-gray-600">Unit Price</span>
                                  <span className="font-medium text-gray-900">{formatCurrency(unitPrice)}</span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                  <span className="text-gray-600">Line Total</span>
                                  <span className="font-semibold text-gray-900">{formatCurrency(lineTotal)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {hasUrgentFee ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">Urgent Service Fee</h3>
                              <p className="mt-1 text-sm text-gray-700">
                                High-priority or urgent scheduling charge applied to this job.
                              </p>
                            </div>
                            <span className="text-base font-bold text-gray-900">
                              {formatCurrency(urgentFeeAmount)}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      <div className="rounded-xl border bg-gray-50 p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Services Subtotal</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(serviceSubtotalDisplay)}
                            </span>
                          </div>

                          {hasUrgentFee ? (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Urgent Fee</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(urgentFeeAmount)}
                              </span>
                            </div>
                          ) : null}

                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-900">{formatCurrency(subtotalAmount)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">GST</span>
                            <span className="font-medium text-gray-900">{formatCurrency(gstAmount)}</span>
                          </div>

                          <div className="flex items-center justify-between border-t pt-2">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-green-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Recurrence</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Recurring Job</p>
                      <p className="mt-1 font-semibold text-gray-900">{job.is_recurring ? "Yes" : "No"}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Frequency</p>
                      <p className="mt-1 font-semibold text-gray-900">{recurrenceLabel(job)}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Interval</p>
                      <p className="mt-1 font-semibold text-gray-900">{job.recurrence_interval ?? "—"}</p>
                    </div>

                    <div className="rounded-lg border bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">End Date</p>
                      <p className="mt-1 font-semibold text-gray-900">{formatDateOnly(job.recurrence_end_date)}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="mb-3 text-base font-semibold text-gray-900">Generated Recurrences</h3>

                    {recurrences.length === 0 ? (
                      <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
                        No recurrence records found.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">#</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">UUID</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Scheduled At</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {recurrences.map((recurrence, index) => (
                              <tr key={recurrence.uuid || recurrence.id || index}>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {recurrence.recurrence_index ?? index + 1}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {recurrence.uuid || recurrence.job_uuid || "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {formatDateTime(recurrence.scheduled_at)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {formatStatus(recurrence.status)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {formatDateTime(recurrence.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Quote Images</h2>
                  </div>

                  {quoteImages.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
                      No quote images attached.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                      {quoteImages.map((image, index) => {
                        const imageUrl = getImageUrl(image);
                        return (
                          <button
                            key={`${imageUrl}-${index}`}
                            type="button"
                            onClick={() => imageUrl && openImage(imageUrl)}
                            className="overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:shadow-md"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={image.alt || image.label || `Quote image ${index + 1}`}
                                className="h-44 w-full cursor-pointer object-cover transition-transform hover:scale-[1.05]"
                              />
                            ) : (
                              <div className="flex h-44 items-center justify-center bg-gray-100 text-sm text-gray-500">
                                No preview
                              </div>
                            )}
                            <div className="p-3">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {image.label || image.file_name || `Image ${index + 1}`}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Job Images</h2>
                  </div>

                  {jobImages.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
                      No images attached to this job.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                      {jobImages.map((image, index) => {
                        const imageUrl = getImageUrl(image);
                        return (
                          <button
                            key={`${imageUrl}-${index}`}
                            type="button"
                            onClick={() => imageUrl && openImage(imageUrl)}
                            className="overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:shadow-md"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={image.alt || image.label || `Job image ${index + 1}`}
                                className="h-44 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-44 items-center justify-center bg-gray-100 text-sm text-gray-500">
                                No preview
                              </div>
                            )}
                            <div className="p-3">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {image.label || image.file_name || `Image ${index + 1}`}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-green-700" />
                    <h2 className="text-lg font-semibold text-gray-900">Quick Summary</h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-600">Job Status</span>
                      <span className="font-medium text-gray-900">{formatStatus(job.status)}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-600">Quote Status</span>
                      <span className="font-medium text-gray-900">{formatStatus(job.quote?.status)}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-600">Recurring</span>
                      <span className="font-medium text-gray-900">{job.is_recurring ? "Yes" : "No"}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-600">Services</span>
                      <span className="font-medium text-gray-900">{services.length}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-600">Recurrences</span>
                      <span className="font-medium text-gray-900">{recurrences.length}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-600">Quote Images</span>
                      <span className="font-medium text-gray-900">{quoteImages.length}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-600">Job Images</span>
                      <span className="font-medium text-gray-900">{jobImages.length}</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-600">Urgent Fee</span>
                      <span className="font-medium text-gray-900">
                        {hasUrgentFee ? formatCurrency(urgentFeeAmount) : "No"}
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <User2 className="h-5 w-5 text-green-700" />
                    <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {formatFullName(job.quote?.contact_first_name || "", job.quote?.contact_last_name || "") || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Customer ID</p>
                      <p className="mt-1 font-medium text-gray-900">{job.customer_uuid || "—"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Quote ID</p>
                      <p className="mt-1 font-medium text-gray-900">{job.quote_uuid || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-green-700" />
                    <h2 className="text-lg font-semibold text-gray-900">Flags</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      {job.is_completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm text-gray-800">
                        {job.is_completed ? "Job completed" : "Job not completed"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      {job.is_deleted ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-800">
                        {job.is_deleted ? "Marked as deleted" : "Active job"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      {job.is_recurring ? (
                        <RefreshCcw className="h-4 w-4 text-blue-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-800">
                        {job.is_recurring ? "Recurring schedule enabled" : "One-off job"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      {hasUrgentFee ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-800">
                        {hasUrgentFee
                          ? `Urgent fee applied (${formatCurrency(urgentFeeAmount)})`
                          : "No urgent fee applied"}
                      </span>
                    </div>
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