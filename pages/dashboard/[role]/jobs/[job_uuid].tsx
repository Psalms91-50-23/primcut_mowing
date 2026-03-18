import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

type Job = {
  uuid: string;
  customer_uuid: string;
  quote_uuid: string;
  services: any[];
  subtotal_amount?: number | null;
  gst_amount?: number | null;
  total_amount?: number | null;
  scheduled_at?: string | null;
  status?: string | null; // job_status enum as string
  job_images?: any[];
  is_completed?: boolean;
  completed_date?: string | null;
  is_deleted?: boolean;
  is_recurring?: boolean;
  recurrence_interval?: number | null;
  recurrence_end_date?: string | null; // date
  recurrence_frequency?: string | null;
  created_at?: string;
  updated_at?: string;
};

type JobRecurrence = {
  id: number;
  job_uuid: string;
  scheduled_at: string; // timestamptz
  is_completed: boolean;
  completed_date?: string | null;
  status: string; // job_occurrence_status
  is_deleted: boolean;
  deleted_at?: string | null;
  previous_status?: string | null;
  updated_at?: string | null;
};

const Spinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
    <span className="text-white text-lg font-medium">{text}</span>
  </div>
);

export default function JobPage() {
  const router = useRouter();
  const { job_uuid, role } = router.query as { job_uuid?: string; role?: string };
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [recurrences, setRecurrences] = useState<JobRecurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidRole = user && ["owner", "admin", "employee"].includes(user?.role);
  const roleFromUrl = typeof role === "string" ? role : user?.role;

  const sortedRecurrences = useMemo(() => {
    return [...recurrences].sort((a, b) => {
      const da = new Date(a.scheduled_at).getTime();
      const db = new Date(b.scheduled_at).getTime();
      return da - db;
    });
  }, [recurrences]);

  // Fetch job
  useEffect(() => {
    if (!job_uuid || !user || !isValidRole) return;

    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/jobs/${job_uuid}`);
        const contentType = res.headers.get("content-type") || "";

        let data: any;
        if (contentType.includes("application/json")) data = await res.json();
        else {
          const text = await res.text();
          console.error("API returned non-JSON:", text.slice(0, 500));
          throw new Error("Failed to fetch job: backend returned non-JSON");
        }

        if (!res.ok) throw new Error(data.error || "Failed to fetch job");
        setJob(data.job || data);
      } catch (err: any) {
        console.error("Error fetching job:", err.message || err);
        setError(err.message || "Failed to fetch job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [job_uuid, user, isValidRole]);

  // Fetch recurrences when job is recurring
  useEffect(() => {
    if (!job_uuid || !job?.is_recurring) {
      setRecurrences([]);
      return;
    }

    const fetchRecurrences = async () => {
      setRecLoading(true);
      try {
        const res = await fetch(`/api/jobs/${job_uuid}/recurrences`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch job recurrences");
        setRecurrences(data.recurrences || []);
      } catch (err: any) {
        console.error(err);
        // don’t hard-fail page if recurrences fail
        setRecurrences([]);
      } finally {
        setRecLoading(false);
      }
    };

    fetchRecurrences();
  }, [job_uuid, job?.is_recurring]);

  // Update job
  const handleUpdateJob = async () => {
    if (!job_uuid || !job) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job_uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update job");
      setJob(data.job || data);
      alert("Job updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner text="Loading job..." />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!job) return <p>No job found.</p>;

  return (
    <div
      className="flex flex-col items-center min-h-screen p-6 relative"
      style={{
        backgroundImage: `url('/images/emoji_filling_quote.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-green-100/40 backdrop-blur-sm z-0"></div>
      {saving && <Spinner text="Saving..." />}

      <div className="relative z-10 w-full max-w-[42rem] bg-white/90 shadow-2xl rounded-3xl p-4 backdrop-blur-sm sm:p-8">
        {/* Header */}
        <div className="bg-green-900 rounded-t-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h1 className="flex items-center font-bold m-0 p-0 text-white text-xl sm:text-2xl md:text-3xl">
            <span className="text-2xl sm:text-3xl md:text-3xl translate-x-1">H</span>
            <img
              src="/images/happy-house-1.png"
              alt="Happy Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-1"
            />
            <span className="text-xl sm:text-2xl md:text-3xl">ppy Lawns</span>
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div>
              <p className="text-white text-sm">Date</p>
              <p className="text-white text-sm">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-white text-sm">Job ID</p>
              <p className="text-white text-sm">{job.uuid}</p>
            </div>
            {job.scheduled_at && (
              <div>
                <p className="text-white text-sm">Scheduled</p>
                <p className="text-white text-sm">{new Date(job.scheduled_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Core Job Info */}
        <section className="mb-6 border-b border-gray-200 pb-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <label className="flex flex-col w-full">
              Status
              <select
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={job.status || ""}
                onChange={(e) => setJob({ ...job, status: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <label className="flex flex-col w-full">
              Scheduled At
              <input
                type="datetime-local"
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={
                  job.scheduled_at
                    ? new Date(job.scheduled_at).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setJob({
                    ...job,
                    scheduled_at: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
              />
            </label>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border rounded p-3 bg-white shadow-sm">
                <p className="text-xs text-gray-500">Subtotal</p>
                <p className="font-semibold">${Number(job.subtotal_amount ?? 0).toFixed(2)}</p>
              </div>
              <div className="border rounded p-3 bg-white shadow-sm">
                <p className="text-xs text-gray-500">GST</p>
                <p className="font-semibold">${Number(job.gst_amount ?? 0).toFixed(2)}</p>
              </div>
              <div className="border rounded p-3 bg-white shadow-sm">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-semibold">${Number(job.total_amount ?? 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="sm:col-span-2 border rounded p-3 bg-white shadow-sm">
              <p className="text-xs text-gray-500">Links</p>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/${roleFromUrl}/quotes/${job.quote_uuid}`)}
                >
                  View Quote
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/${roleFromUrl}/customers/${job.customer_uuid}`)}
                >
                  View Customer
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Recurrences (if recurring) */}
        <section className="mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-700">Recurrences</h2>
            <span className="text-xs text-gray-500">
              {job.is_recurring ? "Recurring job" : "Not recurring"}
            </span>
          </div>

          {!job.is_recurring ? (
            <p className="text-gray-600">This job has no recurrence schedule.</p>
          ) : recLoading ? (
            <p className="text-gray-600">Loading recurrences...</p>
          ) : sortedRecurrences.length === 0 ? (
            <p className="text-gray-600">No occurrences found yet.</p>
          ) : (
            <div className="space-y-2">
              {sortedRecurrences.map((r) => (
                <div
                  key={r.id}
                  className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {new Date(r.scheduled_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {r.status} {r.is_completed ? "• Completed" : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Occurrence ID</p>
                    <p className="font-mono text-sm">{r.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={() => router.push(`/dashboard/${roleFromUrl || "owner"}`)}>
            Back
          </Button>
          <Button onClick={handleUpdateJob}>Update Job</Button>
        </section>
      </div>
    </div>
  );
}