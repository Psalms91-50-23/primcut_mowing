import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  CalendarDays,
  FileText,
  RefreshCcw,
  User2,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Pencil,
  Save,
  X,
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import  GoogleAddressAutocomplete  from "@/components/GoogleAddressAutocomplete";
import { Button } from "@/components/ui/button";
import { useAuth, roleRedirectMap } from "../../../context/AuthContext";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { formatFullName } from "../../../utils/utils";

type CustomerRecord = {
  id?: number;
  uuid?: string;
  first_name?: string | null;
  last_name?: string | null;
  landline_phone?: string | null;
  email?: string | null;
  address?: string | null;
  customer_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  mobile_phone?: string | null;
  is_deleted?: boolean | null;
  created_by_uuid?: string | null;
  created_via?: string | null;
  is_blacklisted?: boolean | null;
  blacklisted_reason?: string | null;
  blacklisted_at?: string | null;
  blacklisted_by_uuid?: string | null;
  [key: string]: any;
};

type CustomerContactRecord = {
  id?: number;
  uuid?: string;
  customer_uuid?: string;
  first_name?: string;
  last_name?: string | null;
  email?: string | null;
  mobile_phone?: string | null;
  landline_phone?: string | null;
  role?: string | null;
  notes?: string | null;
  is_primary?: boolean;
  is_billing_contact?: boolean;
  is_site_contact?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  is_deleted?: boolean;
  created_by_uuid?: string | null;
  [key: string]: any;
};

type QuoteRecord = {
  id?: number;
  uuid?: string;
  customer_uuid?: string | null;
  services?: any[] | null;
  total_amount?: number | string | null;
  subtotal_amount?: number | string | null;
  gst_amount?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  images?: any[] | null;
  is_deleted?: boolean | null;
  expiry_start?: string | null;
  expiry_end?: string | null;
  is_expired?: boolean | null;
  is_active?: boolean | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  contact_email?: string | null;
  contact_mobile?: string | null;
  contact_landline?: string | null;
  message?: string | null;
  preferred_contact_method?: string | null;
  is_quote_sent_to_client?: boolean | null;
  quote_sent_at?: string | null;
  address?: string | null;
  responded_at?: string | null;
  sent_by_user_uuid?: string | null;
  sent_message_to_client?: string | null;
  finalized_at?: string | null;
  quote_pdf_url?: string | null;
  quote_pdf_version?: number | null;
  quote_version_reason?: string | null;
  employer_message?: string | null;
  stale_at?: string | null;
  previous_status?: string | null;
  quote_number?: string | null;
  [key: string]: any;
};

type JobRecurrenceRecord = {
  id?: number;
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
  uuid?: string;
  scheduled_window_preset?: string | null;
  [key: string]: any;
};

type JobRecord = {
  id?: number;
  uuid?: string;
  customer_uuid?: string | null;
  quote_uuid?: string | null;
  services?: any[] | null;
  total_amount?: number | string | null;
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
  subtotal_amount?: number | string | null;
  gst_amount?: number | string | null;
  job_images?: any[] | null;
  previous_status?: string | null;
  job_address?: string | null;
  scheduled_window_mins?: number | null;
  scheduled_window_preset?: string | null;
  recurrences?: JobRecurrenceRecord[];
  job_recurrences?: JobRecurrenceRecord[];
  title?: string | null;
  service_name?: string | null;
  [key: string]: any;
};

type DashboardData = {
  customer: CustomerRecord | null;
  quotes: QuoteRecord[];
  jobs: JobRecord[];
  contacts: CustomerContactRecord[];
};

type CustomerFormState = {
  first_name: string;
  last_name: string;
  mobile_phone: string;
  landline_phone: string;
  address: string;
};

type ContactFormState = {
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  landline_phone: string;
  role: string;
  notes: string;
  is_primary: boolean;
  is_billing_contact: boolean;
  is_site_contact: boolean;
};

function toArray<T = any>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.quotes)) return value.quotes;
  if (Array.isArray(value?.jobs)) return value.jobs;
  if (Array.isArray(value?.contacts)) return value.contacts;
  if (Array.isArray(value?.customer_contacts)) return value.customer_contacts;
  if (Array.isArray(value?.job_recurrences)) return value.job_recurrences;
  return [];
}

function toObject<T = any>(value: any): T | null {
  if (!value) return null;
  if (value.data && !Array.isArray(value.data)) return value.data;
  if (value.customer && !Array.isArray(value.customer)) return value.customer;
  if (value.contact && !Array.isArray(value.contact)) return value.contact;
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

function formatDate(date?: string | null) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
  }).format(parsed);
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

function normalizeStatus(status?: string | null) {
  return (status || "").trim().toLowerCase();
}

function getQuoteDisplayId(quote: QuoteRecord) {
  return quote.quote_number || quote.uuid || `Quote #${quote.id ?? "—"}`;
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

function getJobDate(job: JobRecord) {
  return job.scheduled_at || job.created_at || null;
}

function getRecurrenceDate(item: JobRecurrenceRecord) {
  return item.scheduled_at || item.completed_date || item.updated_at || null;
}

function getRecurrenceLabel(item: JobRecurrenceRecord) {
  const status = normalizeStatus(item.status);
  if (status) {
    return `Recurring visit • ${status.replaceAll("_", " ")}`;
  }
  return "Recurring visit";
}

function getCustomerFormValues(customer?: CustomerRecord | null): CustomerFormState {
  return {
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    mobile_phone: customer?.mobile_phone || "",
    landline_phone: customer?.landline_phone || "",
    address: customer?.address || "",
  };
}

function getDefaultContactForm(): ContactFormState {
  return {
    first_name: "",
    last_name: "",
    email: "",
    mobile_phone: "",
    landline_phone: "",
    role: "",
    notes: "",
    is_primary: false,
    is_billing_contact: false,
    is_site_contact: false,
  };
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

export default function CustomerDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [customerMissing, setCustomerMissing] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData>({
    customer: null,
    quotes: [],
    jobs: [],
    contacts: [],
  });

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(
    getCustomerFormValues(null)
  );
  const [customerSaveError, setCustomerSaveError] = useState("");
  const [customerSaveSuccess, setCustomerSaveSuccess] = useState("");

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormState>(
    getDefaultContactForm()
  );
  const [contactSaveError, setContactSaveError] = useState("");
  const [contactSaveSuccess, setContactSaveSuccess] = useState("");

  useRoleRedirect("customer");

  const headerName = useMemo(() => {
    const customerName = formatFullName(
      dashboard.customer?.first_name ?? undefined,
      dashboard.customer?.last_name ?? undefined
    );

    if (customerName?.trim()) return customerName;

    return (
      formatFullName(
        user?.first_name ?? undefined,
        user?.last_name ?? undefined
      ) || "there"
    );
  }, [dashboard.customer, user]);

  const loadDashboard = async (isRefresh = false) => {
    if (authLoading) return;
    if (!user) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setCustomerMissing(false);

      let customer: CustomerRecord | null = null;

      try {
        const customerPayload = await tryFetchJson(
          [user?.customer_uuid ? `/api/customers/uuid/${user.customer_uuid}` : ""].filter(Boolean)
        );

        customer = toObject<CustomerRecord>(customerPayload);
      } catch (customerErr: any) {
        console.error("Customer fetch failed:", customerErr);
        customer = null;
        setCustomerMissing(true);
      }

      if (!customer?.uuid) {
        setDashboard({
          customer: null,
          quotes: [],
          jobs: [],
          contacts: [],
        });
        return;
      }

      const customerUuid = customer.uuid;

      const [quotesPayload, jobsPayload, contactsPayload] = await Promise.all([
        tryFetchJson([`/api/customers/uuid/${customerUuid}/quotes`]),
        tryFetchJson([`/api/customers/uuid/${customerUuid}/jobs`]),
        tryFetchJson([`/api/customers/uuid/${customerUuid}/contacts`]),
      ]);

      const normalizedJobs = toArray<JobRecord>(jobsPayload).map(normalizeJob);

      setDashboard({
        customer,
        quotes: toArray<QuoteRecord>(quotesPayload),
        jobs: normalizedJobs,
        contacts: toArray<CustomerContactRecord>(contactsPayload).filter(
          (contact) => !contact?.is_deleted
        ),
      });

      setCustomerForm(getCustomerFormValues(customer));
    } catch (err: any) {
      setError(err?.message || "Failed to load customer dashboard.");
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

    loadDashboard();
  }, [user, router, authLoading]);

  const allRecurrences = useMemo(() => {
    return dashboard.jobs.flatMap((job) => getJobRecurrences(job));
  }, [dashboard.jobs]);

  const stats = useMemo(() => {
    const quoteList = dashboard.quotes || [];
    const jobList = dashboard.jobs || [];
    const recurrenceList = allRecurrences || [];

    const upcomingJobs = jobList.filter((job) => {
      const date = getJobDate(job);
      if (!date) return false;
      return new Date(date).getTime() >= new Date().getTime();
    });

    const pendingQuotes = quoteList.filter((quote) => {
      const status = normalizeStatus(quote.status);
      return ["pending", "sent", "draft", "awaiting_acceptance"].includes(status);
    });

    const acceptedQuotes = quoteList.filter((quote) => {
      const status = normalizeStatus(quote.status);
      return ["accepted", "approved"].includes(status);
    });

    const totalQuoted = quoteList.reduce((sum, quote) => {
      return sum + Number(quote.total_amount || 0);
    }, 0);

    return {
      totalQuotes: quoteList.length,
      pendingQuotes: pendingQuotes.length,
      upcomingJobs: upcomingJobs.length,
      recurringServices: recurrenceList.length,
      acceptedQuotes: acceptedQuotes.length,
      totalQuoted,
    };
  }, [dashboard.quotes, dashboard.jobs, allRecurrences]);

  const recentQuotes = useMemo(() => {
    return [...dashboard.quotes]
      .filter((quote) => !quote?.is_deleted)
      .sort((a, b) => {
        const aTime = new Date(a.created_at || a.updated_at || 0).getTime();
        const bTime = new Date(b.created_at || b.updated_at || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [dashboard.quotes]);

  const upcomingJobs = useMemo(() => {
    return [...dashboard.jobs]
      .filter((job) => {
        if (job?.is_deleted) return false;
        const date = getJobDate(job);
        if (!date) return false;
        return new Date(date).getTime() >= new Date().getTime();
      })
      .sort((a, b) => {
        const aTime = new Date(getJobDate(a) || 0).getTime();
        const bTime = new Date(getJobDate(b) || 0).getTime();
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [dashboard.jobs]);

  const recurringJobs = useMemo(() => {
    return [...allRecurrences]
      .filter((item) => !item?.is_deleted)
      .sort((a, b) => {
        const aTime = new Date(getRecurrenceDate(a) || 0).getTime();
        const bTime = new Date(getRecurrenceDate(b) || 0).getTime();
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [allRecurrences]);

  const visibleContacts = useMemo(() => {
    return [...dashboard.contacts].sort((a, b) => {
      const aPrimary = a.is_primary ? 1 : 0;
      const bPrimary = b.is_primary ? 1 : 0;
      if (aPrimary !== bPrimary) return bPrimary - aPrimary;

      const aTime = new Date(a.created_at || 0).getTime();
      const bTime = new Date(b.created_at || 0).getTime();
      return bTime - aTime;
    });
  }, [dashboard.contacts]);

  const handleCustomerFormChange = (
    field: keyof CustomerFormState,
    value: string
  ) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartEditCustomer = () => {
    setCustomerSaveError("");
    setCustomerSaveSuccess("");
    setCustomerForm(getCustomerFormValues(dashboard.customer));
    setIsEditingCustomer(true);
  };

  const handleCancelEditCustomer = () => {
    setCustomerSaveError("");
    setCustomerSaveSuccess("");
    setCustomerForm(getCustomerFormValues(dashboard.customer));
    setIsEditingCustomer(false);
  };

  const handleSaveCustomer = async () => {
    if (!dashboard.customer?.uuid) return;

    try {
      setSavingCustomer(true);
      setCustomerSaveError("");
      setCustomerSaveSuccess("");

      const res = await fetch(`/api/customers/uuid/${dashboard.customer.uuid}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: customerForm.first_name.trim(),
          last_name: customerForm.last_name.trim(),
          mobile_phone: customerForm.mobile_phone.trim(),
          landline_phone: customerForm.landline_phone.trim(),
          address: customerForm.address.trim(),
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to update customer details.");
      }

      const updatedCustomer =
        toObject<CustomerRecord>(payload) ||
        payload?.customer ||
        payload?.data ||
        null;

      setDashboard((prev) => ({
        ...prev,
        customer: {
          ...(prev.customer || {}),
          ...(updatedCustomer || {}),
          first_name: customerForm.first_name.trim(),
          last_name: customerForm.last_name.trim(),
          mobile_phone: customerForm.mobile_phone.trim(),
          landline_phone: customerForm.landline_phone.trim(),
          address: customerForm.address.trim(),
        },
      }));

      setCustomerSaveSuccess("Customer details updated successfully.");
      setIsEditingCustomer(false);
    } catch (err: any) {
      setCustomerSaveError(err?.message || "Failed to save customer details.");
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleContactFormChange = (
    field: keyof ContactFormState,
    value: string | boolean
  ) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartAddContact = () => {
    setContactSaveError("");
    setContactSaveSuccess("");
    setContactForm(getDefaultContactForm());
    setIsAddingContact(true);
  };

  const handleCancelAddContact = () => {
    setContactSaveError("");
    setContactSaveSuccess("");
    setContactForm(getDefaultContactForm());
    setIsAddingContact(false);
  };

  const handleSaveContact = async () => {
    if (!dashboard.customer?.uuid) return;

    if (!contactForm.first_name.trim()) {
      setContactSaveError("First name is required.");
      return;
    }

    try {
      setSavingContact(true);
      setContactSaveError("");
      setContactSaveSuccess("");

      const res = await fetch(
        `/api/customers/uuid/${dashboard.customer.uuid}/contacts`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: contactForm.first_name.trim(),
            last_name: contactForm.last_name.trim() || null,
            email: contactForm.email.trim() || null,
            mobile_phone: contactForm.mobile_phone.trim() || null,
            landline_phone: contactForm.landline_phone.trim() || null,
            role: contactForm.role.trim() || null,
            notes: contactForm.notes.trim() || null,
            is_primary: !!contactForm.is_primary,
            is_billing_contact: !!contactForm.is_billing_contact,
            is_site_contact: !!contactForm.is_site_contact,
          }),
        }
      );

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to add contact.");
      }

      const newContact =
        toObject<CustomerContactRecord>(payload) ||
        payload?.contact ||
        payload?.data ||
        null;

      if (newContact) {
        setDashboard((prev) => {
          let nextContacts = [...prev.contacts];

          if (newContact.is_primary) {
            nextContacts = nextContacts.map((contact) => ({
              ...contact,
              is_primary: false,
            }));
          }

          return {
            ...prev,
            contacts: [newContact, ...nextContacts],
          };
        });
      } else {
        await loadDashboard(true);
      }

      setContactSaveSuccess("Alternative contact added successfully.");
      setContactForm(getDefaultContactForm());
      setIsAddingContact(false);
    } catch (err: any) {
      setContactSaveError(err?.message || "Failed to save contact.");
    } finally {
      setSavingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customer Dashboard</h1>
            <p className="text-slate-600 mt-2">
              Welcome back, <span className="font-semibold">{headerName}</span>.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="gap-2 hover:cursor-pointer"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={logout} className="hover:cursor-pointer">
              Logout
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700">Unable to load dashboard</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {customerMissing ? (
          <Card className="rounded-2xl shadow-sm border-0 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <User2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Customer profile not found
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Your login account was found, but no customer record is linked yet.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Once a customer profile exists, your quotes, jobs, recurring services,
                    and contact records will appear here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!customerMissing && dashboard.customer ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <StatCard
                title="Total Quotes"
                value={String(stats.totalQuotes)}
                icon={<FileText className="h-5 w-5" />}
              />
              <StatCard
                title="Pending Quotes"
                value={String(stats.pendingQuotes)}
                icon={<Clock3 className="h-5 w-5" />}
              />
              <StatCard
                title="Upcoming Jobs"
                value={String(stats.upcomingJobs)}
                icon={<CalendarDays className="h-5 w-5" />}
              />
              <StatCard
                title="Recurring Services"
                value={String(stats.recurringServices)}
                icon={<RefreshCcw className="h-5 w-5" />}
              />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 flex flex-col gap-6">
                <Card className="rounded-2xl shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                          <User2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">Customer Details</h2>
                          <p className="text-sm text-slate-500">Your profile from backend</p>
                        </div>
                      </div>

                      {!isEditingCustomer ? (
                        <Button
                          variant="outline"
                          onClick={handleStartEditCustomer}
                          className="gap-2 hover:cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      ) : null}
                    </div>

                    {customerSaveError ? (
                      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {customerSaveError}
                      </div>
                    ) : null}

                    {customerSaveSuccess ? (
                      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                        {customerSaveSuccess}
                      </div>
                    ) : null}

                    {!isEditingCustomer ? (
                      <div className="space-y-4 text-sm">
                        <DetailRow label="Full name" value={headerName} />
                        <DetailRow
                          label="Email"
                          value={dashboard.customer?.email || user?.email || "—"}
                        />
                        <DetailRow
                          label="Mobile"
                          value={dashboard.customer?.mobile_phone || "—"}
                        />
                        <DetailRow
                          label="Landline"
                          value={dashboard.customer?.landline_phone || "—"}
                        />
                        <DetailRow
                          label="Address"
                          value={dashboard.customer?.address || "—"}
                        />
                        <DetailRow
                          label="Customer type"
                          value={dashboard.customer?.customer_type || "—"}
                        />
                        <DetailRow
                          label="Customer ID"
                          value={dashboard.customer?.uuid || user?.customer_uuid || "—"}
                        />
                        <DetailRow
                          label="Joined"
                          value={formatDate(dashboard.customer?.created_at)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <InputGroup
                          label="First name"
                          value={customerForm.first_name}
                          onChange={(value) => handleCustomerFormChange("first_name", value)}
                        />

                        <InputGroup
                          label="Last name"
                          value={customerForm.last_name}
                          onChange={(value) => handleCustomerFormChange("last_name", value)}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputGroup
                            label="Mobile"
                            value={customerForm.mobile_phone}
                            onChange={(value) =>
                              handleCustomerFormChange("mobile_phone", value)
                            }
                          />

                          <InputGroup
                            label="Landline"
                            value={customerForm.landline_phone}
                            onChange={(value) =>
                              handleCustomerFormChange("landline_phone", value)
                            }
                          />
                        </div>
                        <GoogleAddressAutocomplete
                          label="Address"
                          value={customerForm.address}
                          onSelect={(value) => handleCustomerFormChange("address", value)}
                          helperText="Start typing and select your address from Google suggestions."
                        />
                        {/* <TextAreaGroup
                          label="Address"
                          value={customerForm.address}
                          onChange={(value) => handleCustomerFormChange("address", value)}
                        /> */}

                        <div className="pt-2 flex flex-wrap gap-3">
                          <Button
                            onClick={handleSaveCustomer}
                            disabled={savingCustomer}
                            className="gap-2 hover:cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            {savingCustomer ? "Saving..." : "Save"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEditCustomer}
                            disabled={savingCustomer}
                            className="gap-2 hover:cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">
                            Alternative Contacts
                          </h2>
                          <p className="text-sm text-slate-500">
                            Billing, site, or backup contacts
                          </p>
                        </div>
                      </div>

                      {!isAddingContact ? (
                        <Button
                          variant="outline"
                          onClick={handleStartAddContact}
                          className="gap-2 hover:cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </Button>
                      ) : null}
                    </div>

                    {contactSaveError ? (
                      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {contactSaveError}
                      </div>
                    ) : null}

                    {contactSaveSuccess ? (
                      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                        {contactSaveSuccess}
                      </div>
                    ) : null}

                    {isAddingContact ? (
                      <div className="space-y-4 mb-5 rounded-xl border border-slate-200 p-4 bg-slate-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputGroup
                            label="First name"
                            value={contactForm.first_name}
                            onChange={(value) =>
                              handleContactFormChange("first_name", value)
                            }
                          />
                          <InputGroup
                            label="Last name"
                            value={contactForm.last_name}
                            onChange={(value) =>
                              handleContactFormChange("last_name", value)
                            }
                          />
                        </div>

                        <InputGroup
                          label="Email"
                          type="email"
                          value={contactForm.email}
                          onChange={(value) => handleContactFormChange("email", value)}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputGroup
                            label="Mobile"
                            value={contactForm.mobile_phone}
                            onChange={(value) =>
                              handleContactFormChange("mobile_phone", value)
                            }
                          />
                          <InputGroup
                            label="Landline"
                            value={contactForm.landline_phone}
                            onChange={(value) =>
                              handleContactFormChange("landline_phone", value)
                            }
                          />
                        </div>

                        <InputGroup
                          label="Role"
                          value={contactForm.role}
                          onChange={(value) => handleContactFormChange("role", value)}
                        />

                        <TextAreaGroup
                          label="Notes"
                          value={contactForm.notes}
                          onChange={(value) => handleContactFormChange("notes", value)}
                        />

                        <div className="grid grid-cols-1 gap-2">
                          <CheckboxRow
                            label="Primary contact"
                            checked={contactForm.is_primary}
                            onChange={(checked) =>
                              handleContactFormChange("is_primary", checked)
                            }
                          />
                          <CheckboxRow
                            label="Billing contact"
                            checked={contactForm.is_billing_contact}
                            onChange={(checked) =>
                              handleContactFormChange("is_billing_contact", checked)
                            }
                          />
                          <CheckboxRow
                            label="Site contact"
                            checked={contactForm.is_site_contact}
                            onChange={(checked) =>
                              handleContactFormChange("is_site_contact", checked)
                            }
                          />
                        </div>

                        <div className="pt-2 flex flex-wrap gap-3">
                          <Button
                            onClick={handleSaveContact}
                            disabled={savingContact}
                            className="gap-2 hover:cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            {savingContact ? "Saving..." : "Save Contact"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelAddContact}
                            disabled={savingContact}
                            className="gap-2 hover:cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {visibleContacts.length === 0 ? (
                      <EmptyState
                        icon={<Users className="h-5 w-5" />}
                        title="No alternative contacts"
                        description="Add extra contacts for billing, site access, or backup communication."
                      />
                    ) : (
                      <div className="space-y-3">
                        {visibleContacts.map((contact) => {
                          const fullName = formatFullName(
                            contact.first_name,
                            contact.last_name || undefined
                          );

                          return (
                            <div
                              key={contact.uuid || contact.id}
                              className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {fullName || "Unnamed contact"}
                                  </p>

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {contact.is_primary ? (
                                      <Badge label="Primary" />
                                    ) : null}
                                    {contact.is_billing_contact ? (
                                      <Badge label="Billing" />
                                    ) : null}
                                    {contact.is_site_contact ? (
                                      <Badge label="Site" />
                                    ) : null}
                                    {contact.role ? <Badge label={contact.role} /> : null}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 space-y-2 text-sm text-slate-600">
                                <InfoLine
                                  icon={<Mail className="h-4 w-4" />}
                                  text={contact.email || "—"}
                                />
                                <InfoLine
                                  icon={<Phone className="h-4 w-4" />}
                                  text={
                                    contact.mobile_phone ||
                                    contact.landline_phone ||
                                    "—"
                                  }
                                />
                                {contact.notes ? (
                                  <InfoLine
                                    icon={<Pencil className="h-4 w-4" />}
                                    text={contact.notes}
                                  />
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-2 flex flex-col gap-6">
                <Card className="rounded-2xl shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Recent Quotes</h2>
                        <p className="text-sm text-slate-500">
                          Latest quotes linked to your customer record
                        </p>
                      </div>
                      <div className="text-sm font-medium text-green-700">
                        Total quoted: {asMoney(stats.totalQuoted)}
                      </div>
                    </div>

                    {recentQuotes.length === 0 ? (
                      <EmptyState
                        icon={<FileText className="h-5 w-5" />}
                        title="No quotes yet"
                        description="Quotes connected to your customer profile will appear here."
                      />
                    ) : (
                      <div className="space-y-3">
                        {recentQuotes.map((quote) => (
                          <div
                            key={quote.uuid || quote.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">
                                {getQuoteDisplayId(quote)}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Created {formatDateTime(quote.created_at)}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Expires {formatDateTime(quote.expiry_end)}
                              </p>
                            </div>

                            <div className="flex flex-col sm:items-end">
                              <span className="text-sm font-medium text-slate-700 capitalize">
                                Status: {quote.status || "—"}
                              </span>
                              <span className="text-base font-semibold text-green-700">
                                {asMoney(quote.total_amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Upcoming Jobs</h2>
                        <p className="text-sm text-slate-500">
                          Scheduled jobs from your customer account
                        </p>
                      </div>
                    </div>

                    {upcomingJobs.length === 0 ? (
                      <EmptyState
                        icon={<Briefcase className="h-5 w-5" />}
                        title="No upcoming jobs"
                        description="Any scheduled jobs for your customer record will show here."
                      />
                    ) : (
                      <div className="space-y-3">
                        {upcomingJobs.map((job) => {
                          const recurrences = getJobRecurrences(job);

                          return (
                            <div
                              key={job.uuid || job.id}
                              className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                            >
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {getJobDisplayName(job)}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                  {job.job_address ||
                                    dashboard.customer?.address ||
                                    "Address not available"}
                                </p>

                                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                                  <span className="text-slate-500">
                                    Status: {job.status || "pending"}
                                  </span>
                                  <span className="text-slate-500">
                                    Total: {asMoney(job.total_amount)}
                                  </span>
                                  {job.is_recurring ? (
                                    <span className="text-green-700 font-medium">
                                      Recurring
                                    </span>
                                  ) : null}
                                </div>

                                {recurrences.length > 0 ? (
                                  <p className="text-xs text-green-700 mt-2">
                                    {recurrences.length} recurring{" "}
                                    {recurrences.length === 1 ? "visit" : "visits"} attached
                                  </p>
                                ) : null}
                              </div>

                              <div className="flex flex-col lg:items-end">
                                <span className="text-sm font-medium text-green-700">
                                  {formatDateTime(getJobDate(job))}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Recurring Services</h2>
                        <p className="text-sm text-slate-500">
                          Scheduled recurrence records attached to your jobs
                        </p>
                      </div>
                    </div>

                    {recurringJobs.length === 0 ? (
                      <EmptyState
                        icon={<RefreshCcw className="h-5 w-5" />}
                        title="No recurring services"
                        description="Recurring job occurrences will appear here when they exist."
                      />
                    ) : (
                      <div className="space-y-3">
                        {recurringJobs.map((item) => (
                          <div
                            key={item.uuid || item.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">
                                {getRecurrenceLabel(item)}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Scheduled: {formatDateTime(item.scheduled_at)}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Total: {asMoney(item.total_amount)}
                              </p>
                            </div>

                            <div className="flex flex-col sm:items-end">
                              <span className="text-sm text-slate-600 capitalize">
                                {item.status || "scheduled"}
                              </span>
                              <span className="text-sm font-medium text-green-700">
                                {item.is_completed ? "Completed" : "Upcoming"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mt-8">
              <Card className="rounded-2xl shadow-sm border-0">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Account Summary</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Accepted quotes: {stats.acceptedQuotes} • Total quoted value:{" "}
                      {asMoney(stats.totalQuoted)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    Customer account connected successfully
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <User2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Account Details</h2>
                    <p className="text-sm text-slate-500">Using your login information</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <DetailRow label="Full name" value={headerName} />
                  <DetailRow label="Email" value={user?.email || "—"} />
                  <DetailRow label="Role" value={user?.role || "—"} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">No customer data yet</h2>
                    <p className="text-sm text-slate-500">
                      Quotes, jobs, recurring services, and contacts will appear once your
                      customer profile is created.
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600">
                  This account is logged in successfully, but no linked customer record was
                  returned from the backend route.
                </p>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl shadow-sm border-0">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-none last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 break-words">{value || "—"}</span>
    </div>
  );
}

function InputGroup({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-green-600"
      />
    </div>
  );
}

function TextAreaGroup({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-slate-600">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-green-600 resize-none"
      />
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 hover:cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300"
      />
      <span>{label}</span>
    </label>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}

function InfoLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="break-words">{text || "—"}</span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50">
      <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
        {icon}
      </div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}