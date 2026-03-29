// pages/dashboard/[role]/customers/[uuid].tsx

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import GoogleAddressAutocomplete from "@/components/GoogleAddressAutocomplete";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  Save,
  UserRound,
  Briefcase,
  FileText,
} from "lucide-react";

type Customer = {
  uuid: string;
  first_name: string;
  last_name?: string | null;
  mobile_phone?: string | null;
  landline_phone?: string | null;
  email?: string | null;
  address?: string | null;
  customer_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  is_deleted?: boolean;
  created_by_uuid?: string | null;
  created_via?: string | null;
};

type CustomerJob = {
  uuid: string;
  title?: string | null;
  status?: string | null;
  scheduled_date?: string | null;
  total_amount?: number | null;
};

type CustomerQuote = {
  uuid: string;
  status?: string | null;
  total_amount?: number | null;
  created_at?: string | null;
};

const Spinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="mb-4 h-14 w-14 animate-spin rounded-full border-4 border-white border-t-transparent" />
    <span className="text-base font-medium text-white">{text}</span>
  </div>
);

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(Number(value || 0));
}

function getCustomerName(customer: Customer | null) {
  if (!customer) return "Customer";
  return `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Customer";
}

function badgeClass(status?: string | null) {
  const s = String(status || "").toLowerCase();

  if (["accepted", "completed", "paid", "active"].includes(s)) {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (["pending", "draft", "scheduled"].includes(s)) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (["cancelled", "declined", "deleted"].includes(s)) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function CustomerPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { uuid, role } = router.query as {
    uuid?: string;
    role?: string;
  };

  const roleFromUrl = typeof role === "string" ? role : user?.role;
  const isValidRole = !!user && ["owner", "admin", "employee"].includes(user.role);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const customerName = useMemo(() => getCustomerName(customer), [customer]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!uuid) {
      setLoading(false);
      setError("Customer UUID is missing");
      return;
    }

    if (!user) return;

    if (!isValidRole) {
      setLoading(false);
      setError("You are not allowed to view this customer");
      return;
    }

    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/customers/uuid/${uuid}`);
        const contentType = res.headers.get("content-type") || "";

        let data: any;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error("API returned non-JSON:", text.slice(0, 500));
          throw new Error("Failed to fetch customer: backend returned non-JSON");
        }

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch customer");
        }

        setCustomer(data.customer || data);
      } catch (err: any) {
        console.error("Error fetching customer:", err?.message || err);
        setError(err?.message || "Failed to fetch customer");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [router.isReady, uuid, user, isValidRole]);

  useEffect(() => {
    if (!uuid || !user || !isValidRole) return;

    const fetchRelated = async () => {
      setLoadingRelated(true);

      try {
        const [jobsRes, quotesRes] = await Promise.all([
          fetch(`/api/jobs/customer/${uuid}`).catch(() => null),
          fetch(`/api/quotes/customer/${uuid}`).catch(() => null),
        ]);

        if (jobsRes?.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs || jobsData || []);
        }

        if (quotesRes?.ok) {
          const quotesData = await quotesRes.json();
          setQuotes(quotesData.quotes || quotesData || []);
        }
      } catch (err) {
        console.error("Failed to load related records", err);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [uuid, user, isValidRole]);

  const handleUpdateCustomer = async () => {
    if (!uuid || !customer) return;

    setSaving(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/customers/${uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update customer");
      }

      setCustomer(data.customer || data);
      setSuccessMessage("Customer updated successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner text="Loading customer..." />;
  }

  if (error && !customer) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (!customer) {
    return <p className="p-6">No customer found.</p>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url('/images/emoji_filling_quote.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-white to-emerald-100/70" />

      {saving && <Spinner text="Saving..." />}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push(`/dashboard/${roleFromUrl || "owner"}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Button className="w-full sm:w-auto" onClick={handleUpdateCustomer}>
            <Save className="mr-2 h-4 w-4" />
            Update Customer
          </Button>
        </div>

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-green-900 to-emerald-700 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/70">
                Customer Profile
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">{customerName}</h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/90">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  ID: {customer.uuid}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Type: {customer.customer_type || "individual"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Created: {formatDate(customer.created_at)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Status: {customer.is_deleted ? "Deleted" : "Active"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-white/70">Quotes</p>
                <p className="mt-1 text-2xl font-semibold">{quotes.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-white/70">Jobs</p>
                <p className="mt-1 text-2xl font-semibold">{jobs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {(error || successMessage) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-green-100 p-2 text-green-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Customer Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    Update the customer's contact and address details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">First Name</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    value={customer.first_name || ""}
                    onChange={(e) =>
                      setCustomer({ ...customer, first_name: e.target.value })
                    }
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Last Name</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    value={customer.last_name || ""}
                    onChange={(e) =>
                      setCustomer({ ...customer, last_name: e.target.value })
                    }
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">
                    <Mail className="mr-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      className="w-full bg-transparent py-3 text-sm outline-none"
                      value={customer.email || ""}
                      onChange={(e) =>
                        setCustomer({ ...customer, email: e.target.value })
                      }
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Mobile</span>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">
                    <Phone className="mr-3 h-4 w-4 text-slate-400" />
                    <input
                      className="w-full bg-transparent py-3 text-sm outline-none"
                      value={customer.mobile_phone || ""}
                      onChange={(e) =>
                        setCustomer({ ...customer, mobile_phone: e.target.value })
                      }
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Landline</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    value={customer.landline_phone || ""}
                    onChange={(e) =>
                      setCustomer({ ...customer, landline_phone: e.target.value })
                    }
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Customer Type</span>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">
                    <Building2 className="mr-3 h-4 w-4 text-slate-400" />
                    <select
                      className="w-full bg-transparent py-3 text-sm outline-none"
                      value={customer.customer_type || "individual"}
                      onChange={(e) =>
                        setCustomer({ ...customer, customer_type: e.target.value })
                      }
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                </label>

                <div className="space-y-2 md:col-span-2">
                  <GoogleAddressAutocomplete
                    label="Address Search"
                    value={customer.address || ""}
                    onSelect={(address) =>
                      setCustomer((prev) => (prev ? { ...prev, address } : prev))
                    }
                    placeholder="Search customer address"
                    country="nz"
                    helperText="Search and select a New Zealand address to fill the address field below."
                  />
                </div>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Address</span>
                  <textarea
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    value={customer.address || ""}
                    onChange={(e) =>
                      setCustomer((prev) =>
                        prev ? { ...prev, address: e.target.value } : prev
                      )
                    }
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-2 text-blue-700">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Related Jobs</h2>
                  <p className="text-sm text-slate-500">
                    All jobs linked to this customer.
                  </p>
                </div>
              </div>

              {loadingRelated ? (
                <p className="text-sm text-slate-500">Loading jobs...</p>
              ) : jobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No related jobs found.
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <button
                      key={job.uuid}
                      type="button"
                      onClick={() =>
                        router.push(`/dashboard/${roleFromUrl || "owner"}/jobs/${job.uuid}`)
                      }
                      className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {job.title || `Job ${job.uuid}`}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Scheduled: {formatDate(job.scheduled_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(
                              job.status
                            )}`}
                          >
                            {job.status || "unknown"}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {formatMoney(job.total_amount)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Related Quotes</h2>
                  <p className="text-sm text-slate-500">
                    All quotes linked to this customer.
                  </p>
                </div>
              </div>

              {loadingRelated ? (
                <p className="text-sm text-slate-500">Loading quotes...</p>
              ) : quotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No related quotes found.
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.map((quote) => (
                    <button
                      key={quote.uuid}
                      type="button"
                      onClick={() =>
                        router.push(`/dashboard/${roleFromUrl || "owner"}/quotes/${quote.uuid}`)
                      }
                      className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-slate-900">Quote {quote.uuid}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Created: {formatDate(quote.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(
                              quote.status
                            )}`}
                          >
                            {quote.status || "unknown"}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {formatMoney(quote.total_amount)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Customer Summary
              </h2>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-1 font-medium text-slate-900">{customerName}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-1 break-all font-medium text-slate-900">
                    {customer.email || "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {customer.mobile_phone || customer.landline_phone || "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {customer.address || "—"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Record Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">Created</span>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {formatDate(customer.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">Last Updated</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatDate(customer.updated_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">Customer Type</span>
                  <span className="text-sm font-medium capitalize text-slate-900">
                    {customer.customer_type || "individual"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">Status</span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      customer.is_deleted
                        ? "border-red-200 bg-red-100 text-red-700"
                        : "border-green-200 bg-green-100 text-green-700"
                    }`}
                  >
                    {customer.is_deleted ? "Deleted" : "Active"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}