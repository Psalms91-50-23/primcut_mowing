import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Job = {
  uuid: string;
  status: string;
  scheduled_at?: string | null;
  job_address?: string | null;
  total_amount?: number | null;
  quote?: {
    contact_first_name?: string | null;
    contact_last_name?: string | null;
  } | null;
};

type JobsResponse = {
  jobs?: Job[];
  total?: number;
  page?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  error?: string;
};

const ALLOWED_RANGES = ["attention", "today", "tomorrow", "next7days"] as const;
type AllowedRange = (typeof ALLOWED_RANGES)[number];

function isAllowedRange(value: string): value is AllowedRange {
  return ALLOWED_RANGES.includes(value as AllowedRange);
}

export default function OwnerJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo<AllowedRange>(() => {
    const raw = router.query.range;
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (value && isAllowedRange(value)) {
      return value;
    }

    return "today";
  }, [router.query.range]);

  const page = useMemo(() => {
    const raw = router.query.page;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  }, [router.query.page]);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "Not set";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Not set";
    return d.toLocaleString();
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/dashboard/jobs?range=${encodeURIComponent(range)}&limit=20&page=${page}`
      );

      const data: JobsResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch jobs");
      }

      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    fetchJobs();
  }, [router.isReady, range, page]);

  const handleRangeChange = (nextRange: AllowedRange) => {
    router.push(`/dashboard/owner/jobs?range=${nextRange}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-sm text-gray-500">
              Showing jobs for: <span className="font-semibold">{range}</span>
            </p>
          </div>

          <Button variant="outline" onClick={() => router.push("/dashboard/owner")}>
            Back to dashboard
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {ALLOWED_RANGES.map((item) => (
            <Button
              key={item}
              type="button"
              variant={item === range ? "default" : "outline"}
              onClick={() => handleRangeChange(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading jobs...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-500">No jobs found.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card
                key={job.uuid}
                className="cursor-pointer hover:shadow-md transition"
                onClick={() => router.push(`/dashboard/owner/jobs/uuid/${job.uuid}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {job.quote?.contact_first_name || ""} {job.quote?.contact_last_name || ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {job.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        Scheduled: {formatDateTime(job.scheduled_at)}
                      </p>
                      {job.job_address && (
                        <p className="text-sm text-gray-500">{job.job_address}</p>
                      )}
                    </div>

                    <div className="text-sm font-medium text-gray-700">
                      ${Number(job.total_amount || 0).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}