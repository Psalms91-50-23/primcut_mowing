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
  Users,
  ChevronDown,
  ChevronUp,
  Star,
  Receipt,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
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

type CustomerContact = {
  uuid: string;
  first_name?: string | null;
  last_name?: string | null;
  mobile_phone?: string | null;
  landline_phone?: string | null;
  email?: string | null;
  role?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  is_primary?: boolean;
  is_billing_contact?: boolean;
  is_site_contact?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
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

type ContactFormState = {
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  landline_phone: string;
  role: string;
  notes: string;
  internal_notes: string;
  is_primary: boolean;
  is_billing_contact: boolean;
  is_site_contact: boolean;
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
  return d.toLocaleDateString("en-NZ");
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
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

function getContactName(contact?: CustomerContact | null) {
  return `${contact?.first_name || ""} ${contact?.last_name || ""}`.trim() || "Unnamed Contact";
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

function getDefaultContactForm(): ContactFormState {
  return {
    first_name: "",
    last_name: "",
    email: "",
    mobile_phone: "",
    landline_phone: "",
    role: "",
    notes: "",
    internal_notes: "",
    is_primary: false,
    is_billing_contact: false,
    is_site_contact: false,
  };
}

function getContactFormValues(contact?: CustomerContact | null): ContactFormState {
  return {
    first_name: contact?.first_name || "",
    last_name: contact?.last_name || "",
    email: contact?.email || "",
    mobile_phone: contact?.mobile_phone || "",
    landline_phone: contact?.landline_phone || "",
    role: contact?.role || "",
    notes: contact?.notes || "",
    internal_notes: contact?.internal_notes || "",
    is_primary: !!contact?.is_primary,
    is_billing_contact: !!contact?.is_billing_contact,
    is_site_contact: !!contact?.is_site_contact,
  };
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
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </label>
  );
}

function TextAreaGroup({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </label>
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
  const id = `checkbox-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-violet-600 transition duration-200 focus:ring-violet-500 hover:scale-125 hover:cursor-pointer"
      />

      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
    </div>
  );
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
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [quotes, setQuotes] = useState<CustomerQuote[]>([]);
  const [openContactUuid, setOpenContactUuid] = useState<string | null>(null);
  const [deletingContactUuid, setDeletingContactUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [contactMode, setContactMode] = useState<"add" | "edit" | null>(null);
  const [editingContactUuid, setEditingContactUuid] = useState<string | null>(null);
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaveError, setContactSaveError] = useState<string | null>(null);
  const [contactSaveSuccess, setContactSaveSuccess] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormState>(getDefaultContactForm());

  const customerName = useMemo(() => getCustomerName(customer), [customer]);

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aPrimary = a?.is_primary ? 1 : 0;
      const bPrimary = b?.is_primary ? 1 : 0;
      if (aPrimary !== bPrimary) return bPrimary - aPrimary;

      const aTime = new Date(a?.created_at || 0).getTime();
      const bTime = new Date(b?.created_at || 0).getTime();
      return bTime - aTime;
    });
  }, [contacts]);

  const editingContact = useMemo(() => {
    if (!editingContactUuid) return null;
    return contacts.find((contact) => contact.uuid === editingContactUuid) || null;
  }, [contacts, editingContactUuid]);

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
        const [contactsRes, jobsRes, quotesRes] = await Promise.all([
          fetch(`/api/customers/uuid/${uuid}/contacts`).catch(() => null),
          fetch(`/api/jobs/customer/${uuid}`).catch(() => null),
          fetch(`/api/quotes/customer/${uuid}`).catch(() => null),
        ]);

        if (contactsRes?.ok) {
          const contactsData = await contactsRes.json();
          const nextContacts = Array.isArray(contactsData?.contacts)
            ? contactsData.contacts
            : [];

          setContacts(nextContacts);

          if (nextContacts.length > 0) {
            setOpenContactUuid((prev) => {
              if (prev && nextContacts.some((contact: CustomerContact) => contact.uuid === prev)) {
                return prev;
              }

              const primaryContact =
                nextContacts.find((contact: CustomerContact) => contact?.is_primary) ||
                nextContacts[0];

              return primaryContact?.uuid || null;
            });
          } else {
            setOpenContactUuid(null);
          }
        } else {
          setContacts([]);
          setOpenContactUuid(null);
        }

        if (jobsRes?.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs || jobsData || []);
        } else {
          setJobs([]);
        }

        if (quotesRes?.ok) {
          const quotesData = await quotesRes.json();
          setQuotes(quotesData.quotes || quotesData || []);
        } else {
          setQuotes([]);
        }
      } catch (err) {
        console.error("Failed to load related records", err);
        setContacts([]);
        setJobs([]);
        setQuotes([]);
        setOpenContactUuid(null);
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
    setContactSaveError(null);
    setContactSaveSuccess(null);
    setEditingContactUuid(null);
    setContactForm(getDefaultContactForm());
    setContactMode("add");
  };

  const handleStartEditContact = (contact: CustomerContact) => {
    setContactSaveError(null);
    setContactSaveSuccess(null);
    setEditingContactUuid(contact.uuid || null);
    setContactForm(getContactFormValues(contact));
    setContactMode("edit");
    setOpenContactUuid(contact.uuid || null);
  };

  const handleCancelContactForm = () => {
    setContactSaveError(null);
    setContactSaveSuccess(null);
    setEditingContactUuid(null);
    setContactForm(getDefaultContactForm());
    setContactMode(null);
  };

  const handleSaveContact = async () => {
    if (!customer?.uuid) return;

    if (!contactForm.first_name.trim()) {
      setContactSaveError("First name is required.");
      return;
    }

    const isEditing = contactMode === "edit" && !!editingContactUuid;

    if (contactMode === "edit" && !editingContactUuid) {
      setContactSaveError("Contact UUID is required.");
      return;
    }

    try {
      setSavingContact(true);
      setContactSaveError(null);
      setContactSaveSuccess(null);

      const url = isEditing
        ? `/api/customer-contacts/uuid/${editingContactUuid}`
        : `/api/customers/uuid/${customer.uuid}/contacts`;

      const method = isEditing ? "PATCH" : "POST";
      console.log([url])
      const res = await fetch(url, {
        method,
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
          internal_notes: contactForm.internal_notes.trim() || null,
          is_primary: !!contactForm.is_primary,
          is_billing_contact: !!contactForm.is_billing_contact,
          is_site_contact: !!contactForm.is_site_contact,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          payload?.error ||
            (isEditing ? "Failed to update contact." : "Failed to add contact.")
        );
      }

      const savedContact: CustomerContact | null =
        payload?.contact || payload?.data || payload || null;

      const contactsRes = await fetch(`/api/customers/uuid/${customer.uuid}/contacts`, {
        credentials: "include",
      });

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        const nextContacts = Array.isArray(contactsData?.contacts) ? contactsData.contacts : [];

        setContacts(nextContacts);

        if (savedContact?.uuid) {
          setOpenContactUuid(savedContact.uuid);
        } else if (isEditing && editingContactUuid) {
          setOpenContactUuid(editingContactUuid);
        }
      }

      setContactSaveSuccess(
        isEditing
          ? "Alternative contact updated successfully."
          : "Alternative contact added successfully."
      );

      setEditingContactUuid(null);
      setContactForm(getDefaultContactForm());
      setContactMode(null);
    } catch (err: any) {
      setContactSaveError(err?.message || "Failed to save contact.");
    } finally {
      setSavingContact(false);
    }
  };

  const handleSoftDeleteContact = async (contactUuid?: string | null) => {
    if (!contactUuid || !customer?.uuid) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this alternative contact?"
    );

    if (!confirmed) return;

    try {
      setDeletingContactUuid(contactUuid);
      setContactSaveError(null);
      setContactSaveSuccess(null);

      const res = await fetch(`/api/customer-contacts/uuid/${contactUuid}/soft-delete`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to delete contact.");
      }

      setContacts((prev) => prev.filter((contact) => contact.uuid !== contactUuid));

      setOpenContactUuid((prev) => {
        if (prev !== contactUuid) return prev;

        const remaining = contacts.filter((contact) => contact.uuid !== contactUuid);
        const primaryContact =
          remaining.find((contact) => contact?.is_primary) || remaining[0];

        return primaryContact?.uuid || null;
      });

      if (editingContactUuid === contactUuid) {
        setEditingContactUuid(null);
        setContactForm(getDefaultContactForm());
        setContactMode(null);
      }

      setContactSaveSuccess("Alternative contact deleted successfully.");
    } catch (err: any) {
      setContactSaveError(err?.message || "Failed to delete contact.");
    } finally {
      setDeletingContactUuid(null);
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
            className="w-full cursor-pointer sm:w-auto"
            onClick={() => router.push(`/dashboard/${roleFromUrl || "owner"}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
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

            <div className="grid grid-cols-1 gap-3 sm:min-w-[420px] sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-white/70">Contacts</p>
                <p className="mt-1 text-2xl font-semibold">{contacts.length}</p>
              </div>
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
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
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

                <Button
                  type="button"
                  onClick={handleUpdateCustomer}
                  disabled={saving}
                  className="w-full cursor-pointer sm:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Update Customer"}
                </Button>
              </div>
              {/* <div className="mb-5 flex items-center gap-3">
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
              </div> */}

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
                      className="w-full bg-transparent px-2 py-3 text-sm outline-none"
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
                      className="w-full bg-transparent px-2 py-3 text-sm outline-none"
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
                      <option value="business">Business</option>
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
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-violet-100 p-2 text-violet-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Alternative Contacts
                    </h2>
                    <p className="text-sm text-slate-500">
                      Billing, site, or backup contacts linked to this customer.
                    </p>
                  </div>
                </div>

                {contactMode === null ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 cursor-pointer"
                    onClick={handleStartAddContact}
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Button>
                ) : null}
              </div>

              {contactSaveError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {contactSaveError}
                </div>
              ) : null}

              {contactSaveSuccess ? (
                <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {contactSaveSuccess}
                </div>
              ) : null}

              <div
                className={`grid transition-all duration-300 ${
                  contactMode ? "grid-rows-[1fr] mb-5" : "grid-rows-[0fr] mb-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="rounded-3xl border border-violet-200 bg-violet-50/50 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {contactMode === "edit"
                            ? `Edit ${getContactName(editingContact)}`
                            : "Add Alternative Contact"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Save a contact for billing, site access, or backup communication.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelContactForm}
                        disabled={savingContact}
                        className="gap-2 cursor-pointer font-bold group hover:border-red-500"
                      >
                        <X className="h-4 w-4 transition-transform duration-200 group-hover:scale-145 " />
                        Cancel
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <InputGroup
                        label="First Name"
                        value={contactForm.first_name}
                        onChange={(value) => handleContactFormChange("first_name", value)}
                      />

                      <InputGroup
                        label="Last Name"
                        value={contactForm.last_name}
                        onChange={(value) => handleContactFormChange("last_name", value)}
                      />

                      <InputGroup
                        label="Email"
                        type="email"
                        value={contactForm.email}
                        onChange={(value) => handleContactFormChange("email", value)}
                      />

                      <InputGroup
                        label="Role"
                        value={contactForm.role}
                        onChange={(value) => handleContactFormChange("role", value)}
                      />

                      <InputGroup
                        label="Mobile"
                        value={contactForm.mobile_phone}
                        onChange={(value) => handleContactFormChange("mobile_phone", value)}
                      />

                      <InputGroup
                        label="Landline"
                        value={contactForm.landline_phone}
                        onChange={(value) => handleContactFormChange("landline_phone", value)}
                      />

                      <div className="md:col-span-2">
                        <TextAreaGroup
                          label="Notes"
                          value={contactForm.notes}
                          onChange={(value) => handleContactFormChange("notes", value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <TextAreaGroup
                          label="Internal Notes"
                          value={contactForm.internal_notes}
                          onChange={(value) =>
                            handleContactFormChange("internal_notes", value)
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-3">
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
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={handleSaveContact}
                        disabled={savingContact}
                        className="gap-2 hover:cursor-pointer group"
                      >
                        <Save className="h-4 w-4" />
                        {savingContact
                          ? "Saving..."
                          : contactMode === "edit"
                          ? "Save Changes"
                          : "Save Contact"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelContactForm}
                        disabled={savingContact}
                        className="gap-2 cursor-pointer font-bold group hover:border-red-500"
                      >
                        <X className="h-4 w-4 transition-transform duration-200 group-hover:scale-145" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {loadingRelated ? (
                <p className="text-sm text-slate-500">Loading contacts...</p>
              ) : sortedContacts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No alternative contacts found.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedContacts.map((contact) => {
                    const isOpen = openContactUuid === contact.uuid;
                    const isEditingThisContact =
                      contactMode === "edit" && editingContactUuid === contact.uuid;
                    const isDeletingThisContact = deletingContactUuid === contact.uuid;

                    return (
                      <div
                        key={contact.uuid}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-violet-300 hover:shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenContactUuid((prev) =>
                              prev === contact.uuid ? null : contact.uuid || null
                            )
                          }
                          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">
                              {getContactName(contact)}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {contact.is_primary ? (
                                <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                                  Primary
                                </span>
                              ) : null}
                              {contact.is_billing_contact ? (
                                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                  Billing
                                </span>
                              ) : null}
                              {contact.is_site_contact ? (
                                <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                  Site
                                </span>
                              ) : null}
                              {contact.role ? (
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                  {contact.role}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-slate-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-500" />
                            )}
                          </div>
                        </button>

                        {isOpen ? (
                          <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleStartEditContact(contact)}
                                disabled={isDeletingThisContact}
                                className="gap-2 cursor-pointer group"
                              >
                                <Pencil className="h-4 w-4 transition-transform duration-200 group-hover:scale-125" />
                                Edit
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleSoftDeleteContact(contact.uuid)}
                                disabled={isDeletingThisContact}
                                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer group"
                              >
                                <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125" />
                                {isDeletingThisContact ? "Deleting..." : "Delete"}
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Email
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {contact.email || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Role
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {contact.role || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Mobile
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {contact.mobile_phone || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Landline
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {contact.landline_phone || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Notes
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">
                                  {contact.notes || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 md:col-span-2">
                                <p className="text-xs uppercase tracking-wide text-amber-700">
                                  Internal Notes
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">
                                  {contact.internal_notes || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Created
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {formatDateTime(contact.created_at)}
                                </p>
                              </div>

                              <div className="rounded-xl bg-white p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                  Updated
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {formatDateTime(contact.updated_at)}
                                </p>
                              </div>
                            </div>

                            {isEditingThisContact ? (
                              <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                                Editing this contact in the form above.
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
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
                      onClick={() => router.push(`/employee/jobs/uuid/${job.uuid}`)}
                      className="w-full rounded-2xl border border-slate-200 p-4 text-left transition cursor-pointer hover:border-green-300 hover:bg-green-50"
                    >
                      <div className="flex flex-col gap-3 cursor-pointer sm:flex-row sm:items-center sm:justify-between">
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
                      className="w-full rounded-2xl border border-slate-200 p-4 text-left transition cursor-pointer hover:border-green-300 hover:bg-green-50"
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