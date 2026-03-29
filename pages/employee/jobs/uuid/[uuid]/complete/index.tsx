import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  Trash2,
  Upload,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type JobService = {
  code?: string | null;
  unit?: string | null;
  label?: string | null;
  quantity?: number | null;
  line_total?: number | null;
  unit_price?: number | null;
  description?: string | null;
  service_uuid?: string | null;
};

type JobImage = {
  url?: string | null;
  image_url?: string | null;
  path?: string | null;
  label?: string | null;
  file_name?: string | null;
};

type JobRecord = {
  id?: number;
  uuid: string;
  customer_uuid?: string | null;
  quote_uuid?: string | null;
  services: JobService[];
  total_amount?: number | string | null;
  subtotal_amount?: number | string | null;
  gst_amount?: number | string | null;
  urgent_fee_amount?: number | string | null;
  has_urgent_fee?: boolean;
  scheduled_at?: string | null;
  status?: string | null;
  previous_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_date?: string | null;
  is_completed?: boolean;
  is_deleted?: boolean;
  is_recurring?: boolean;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null;
  recurrence_frequency?: string | null;
  job_images?: JobImage[];
  job_address?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  notes?: string | null;
  client_schedule_message?: string | null;
};

type UploadPreview = {
  file: File;
  previewUrl: string;
};

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(amount);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const niceLabel = (value?: string | null) => {
  if (!value) return "—";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

export default function CompleteJobPage() {
  const router = useRouter();
  const { uuid } = router.query;

  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<UploadPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const jobUUID = useMemo(() => {
    if (typeof uuid === "string") return uuid;
    return "";
  }, [uuid]);

  useEffect(() => {
    if (!jobUUID) return;

    let isMounted = true;

    const loadJob = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(`/api/employee/jobs/uuid/${jobUUID}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || data?.message || "Failed to load job");
        }

        if (!isMounted) return;

        const loadedJob: JobRecord = data?.job || data;
        setJob(loadedJob);
        setCompletionNotes(loadedJob?.notes || "");
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(error?.message || "Failed to load job");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobUUID]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [selectedFiles]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const nextPreviews = imageFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...nextPreviews]);
    event.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCompleteJob = async (event: FormEvent) => {
    event.preventDefault();
    if (!jobUUID || !job) return;

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const formData = new FormData();
      formData.append("notes", completionNotes || "");
      formData.append("is_completed", "true");
      formData.append("status", "completed");

      selectedFiles.forEach((item) => {
        formData.append("evidence_images", item.file);
      });

      const response = await fetch(`/api/employee/jobs/uuid/${jobUUID}/complete`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Failed to complete job");
      }

      const updatedJob: JobRecord = data?.job || data;
      setJob(updatedJob);
      setSubmitSuccess("Job marked as completed successfully.");

      selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setSelectedFiles([]);
    } catch (error: any) {
      setSubmitError(error?.message || "Failed to complete job");
    } finally {
      setSubmitting(false);
    }
  };

  const existingImages = job?.job_images || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl p-6">
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading job...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl p-6">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Unable to load job</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    {loadError || "Job could not be found."}
                  </p>

                  <div className="mt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go back
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const alreadyCompleted = !!job.is_completed || job.status === "completed";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-200">
            <Briefcase className="h-4 w-4 text-slate-500" />
            <span className="font-medium text-slate-700">Job ID:</span>
            <span className="text-slate-900">{job.uuid}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Complete Job</h1>
                    <p className="mt-1 text-sm text-slate-600">
                      Review the job details, add optional notes, and upload photos as evidence if needed.
                    </p>
                  </div>

                  <div
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      alreadyCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {alreadyCompleted ? "Completed" : niceLabel(job.status)}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <CalendarDays className="h-4 w-4" />
                      Scheduled
                    </div>
                    <p className="mt-2 text-sm text-slate-900">{formatDateTime(job.scheduled_at)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Clock3 className="h-4 w-4" />
                      Window
                    </div>
                    <p className="mt-2 text-sm text-slate-900">
                      {job.scheduled_window_preset
                        ? `${niceLabel(job.scheduled_window_preset)}${
                            job.scheduled_window_mins ? ` (${job.scheduled_window_mins} mins)` : ""
                          }`
                        : job.scheduled_window_mins
                        ? `${job.scheduled_window_mins} mins`
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <MapPin className="h-4 w-4" />
                      Address
                    </div>
                    <p className="mt-2 text-sm text-slate-900">{job.job_address || "—"}</p>
                  </div>
                </div>

                {job.notes ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FileText className="h-4 w-4" />
                      Existing Notes
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{job.notes}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900">Services</h2>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-100 text-left text-slate-700">
                        <tr>
                          <th className="px-4 py-3 font-medium">Service</th>
                          <th className="px-4 py-3 font-medium">Description</th>
                          <th className="px-4 py-3 font-medium">Qty</th>
                          <th className="px-4 py-3 font-medium">Unit Price</th>
                          <th className="px-4 py-3 font-medium">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(job.services || []).length ? (
                          job.services.map((service, index) => (
                            <tr key={`${service.service_uuid || service.code || service.label || "service"}-${index}`}>
                              <td className="px-4 py-3 text-slate-900">
                                {service.label || service.code || "—"}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {service.description || service.unit || "—"}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {service.quantity ?? "—"}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {service.unit_price != null ? formatMoney(service.unit_price) : "—"}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-900">
                                {service.line_total != null ? formatMoney(service.line_total) : "—"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                              No services found for this job.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 ml-auto max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between py-1 text-sm text-slate-700">
                    <span>Subtotal</span>
                    <span>{formatMoney(job.subtotal_amount)}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 text-sm text-slate-700">
                    <span>GST</span>
                    <span>{formatMoney(job.gst_amount)}</span>
                  </div>

                  {job.has_urgent_fee ? (
                    <div className="flex items-center justify-between py-1 text-sm text-slate-700">
                      <span>Urgent fee</span>
                      <span>{formatMoney(job.urgent_fee_amount)}</span>
                    </div>
                  ) : null}

                  <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                    <span>Total</span>
                    <span>{formatMoney(job.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {existingImages.length ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-slate-700" />
                    <h2 className="text-lg font-semibold text-slate-900">Existing Job Images</h2>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {existingImages.map((image, index) => {
                      const src = image.url || image.image_url || "";
                      return (
                        <div
                          key={`${src}-${index}`}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          {src ? (
                            <img
                              src={src}
                              alt={image.label || `Job image ${index + 1}`}
                              className="h-48 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-400">
                              <ImageIcon className="h-8 w-8" />
                            </div>
                          )}

                          <div className="p-3 text-sm text-slate-600">
                            {image.label || image.file_name || `Image ${index + 1}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900">Completion Form</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Add final notes and upload evidence photos if required.
                </p>

                {submitSuccess ? (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4" />
                      <span>{submitSuccess}</span>
                    </div>
                  </div>
                ) : null}

                {submitError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <div className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4" />
                      <span>{submitError}</span>
                    </div>
                  </div>
                ) : null}

                <form onSubmit={handleCompleteJob} className="mt-4 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Completion Notes
                    </label>
                    <textarea
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Add job completion notes, work performed, issues found, follow-up needed, or leave blank."
                      rows={6}
                      disabled={alreadyCompleted || submitting}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Evidence Photos
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-slate-400 hover:bg-slate-100">
                      <Camera className="h-8 w-8 text-slate-500" />
                      <span className="mt-3 text-sm font-medium text-slate-700">
                        Upload photos
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        JPG, PNG, WEBP. Multiple images allowed.
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={handleFileChange}
                        disabled={alreadyCompleted || submitting}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {selectedFiles.length ? (
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Upload className="h-4 w-4 cursor-pointer" />
                        Selected Photos ({selectedFiles.length})
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedFiles.map((item, index) => (
                          <div
                            key={`${item.file.name}-${index}`}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                          >
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="h-40 w-full object-cover"
                            />
                            <div className="flex items-center justify-between gap-3 p-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-800">
                                  {item.file.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>

                              <Button
                                type="button"
                                className="cursor-pointer"
                                variant="outline"
                                onClick={() => removeSelectedFile(index)}
                                disabled={submitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Marking this job complete should set:
                    <div className="mt-2 space-y-1">
                      <div>• status = completed</div>
                      <div>• is_completed = true</div>
                      <div>• completed_date = now</div>
                      <div>• optional notes and evidence images saved</div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={alreadyCompleted || submitting}
                    className="w-full cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing Job...
                      </>
                    ) : alreadyCompleted ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Job Already Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Job
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-slate-900">Job Summary</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Status</span>
                    <span className="font-medium text-slate-900">{niceLabel(job.status)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Completed</span>
                    <span className="font-medium text-slate-900">
                      {job.is_completed ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Completed date</span>
                    <span className="font-medium text-slate-900">
                      {formatDateTime(job.completed_date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Recurring</span>
                    <span className="font-medium text-slate-900">
                      {job.is_recurring ? niceLabel(job.recurrence_frequency) : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}