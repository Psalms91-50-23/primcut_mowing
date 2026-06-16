import { useEffect, useMemo, useState } from "react";
import Header from "@/components/headers/Header";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { useCustomer } from "@/context/CustomerContext";
import { nzPhoneFromIntl } from "@/utils/phone";
import { SERVICES } from "@/data/services";
import ServiceSelector from "@/components/ServiceSelector";

type ServiceOption = {
  uuid: string;
  code: string;
  label: string;
  description?: string | null;
  category?: string | null;
  requires_images?: boolean;
};

const categoryLabels: Record<string, string> = {
  property_maintenance: "Property Maintenance",
  interior_repairs: "Interior Repairs",
  exterior_maintenance: "Exterior Maintenance",
  lawn_care: "Lawn Care",
  garden_services: "Garden Services",
  cleaning: "Cleaning",
  junk_removal: "Junk Removal",
  renovation: "Renovation",
};

const formatCategoryLabel = (category: string) => {
  if (!category) return "Other";

  return (
    categoryLabels[category] ||
    category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

const getSafeString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export default function InquiryPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { customer, customerLoading } = useCustomer();

  const [hasPrefilledCustomerData, setHasPrefilledCustomerData] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    services: [] as string[],
    message: "",
  });

  const [consent, setConsent] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] =
    useState<string>("all");

  const resolvedFirstName = getSafeString(customer?.first_name);
  const resolvedLastName = getSafeString(customer?.last_name);
  const resolvedEmail = getSafeString(customer?.email);
  const resolvedMobile =
    nzPhoneFromIntl(
      getSafeString(customer?.mobile_phone) || getSafeString(customer?.mobile)
    ) || "";
  const resolvedLandline =
    nzPhoneFromIntl(
      getSafeString(customer?.landline_phone) ||
        getSafeString(customer?.landline)
    ) || "";
  const resolvedPhone = resolvedMobile || resolvedLandline || "";

  useEffect(() => {
    if (authLoading || customerLoading) return;
    if (hasPrefilledCustomerData) return;
    if (!customer) return;

    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || resolvedFirstName,
      lastName: prev.lastName || resolvedLastName,
      email: prev.email || resolvedEmail,
      phone: prev.phone || resolvedPhone,
    }));

    setHasPrefilledCustomerData(true);
  }, [
    authLoading,
    customerLoading,
    customer,
    hasPrefilledCustomerData,
    resolvedFirstName,
    resolvedLastName,
    resolvedEmail,
    resolvedPhone,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleService = (label: string) => {
    setForm((prev) => {
      const alreadySelected = prev.services.includes(label);

      return {
        ...prev,
        services: alreadySelected
          ? prev.services.filter((item) => item !== label)
          : [...prev.services, label],
      };
    });
  };

  const handleClearAllServices = () => {
    setForm((prev) => ({
      ...prev,
      services: [],
    }));
  };

  useEffect(() => {
     const loadServicesFromJson = () => {
    try {
      setIsLoadingServices(true);

      const mappedServices = SERVICES.filter(
        (service) => service.is_active && !service.is_deleted
      ).map((service) => ({
        uuid: service.uuid,
        code: service.code,
        label: service.label,
        description: service.description ?? null,
        category: service.category ?? null,
        requires_images: Boolean(service.requires_images),
      }));

      setServices(mappedServices);
    } catch (error) {
      console.error("Failed to load services from JSON object:", error);
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  loadServicesFromJson();
    // const fetchServices = async () => {
    //   try {
    //     setIsLoadingServices(true);

    //     const res = await fetch("/api/services", {
    //       method: "GET",
    //     });

    //     const result = await res.json();

    //     if (!res.ok) {
    //       throw new Error(result?.error || "Failed to load services");
    //     }

    //     const serviceRows = Array.isArray(result?.data) ? result.data : [];

    //     const mappedServices = serviceRows.map((service: any) => ({
    //       uuid: service.uuid,
    //       code: service.code,
    //       label: service.label,
    //       description: service.description ?? null,
    //       category: service.category ?? null,
    //       requires_images: Boolean(service.requires_images),
    //     }));

    //     setServices(mappedServices);
    //   } catch (error) {
    //     console.error("Failed to fetch services:", error);
    //     setServices([]);
    //   } finally {
    //     setIsLoadingServices(false);
    //   }
    // };

    // fetchServices();
  }, []);

  const selectedServices = useMemo(
    () => services.filter((service) => form.services.includes(service.label)),
    [services, form.services]
  );

  const selectedServicesCount = selectedServices.length;

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(services.map((service) => service.category).filter(Boolean))
    ).sort((a, b) =>
      formatCategoryLabel(String(a)).localeCompare(formatCategoryLabel(String(b)))
    );

    return ["all", ...unique] as string[];
  }, [services]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      all: services.length,
    };

    for (const service of services) {
      const key = service.category || "Other";
      counts[key] = (counts[key] || 0) + 1;
    }

    return counts;
  }, [services]);

  const filteredServices = useMemo(() => {
    const base =
      activeServiceCategory === "all"
        ? services
        : services.filter((service) => service.category === activeServiceCategory);

    const selected = base
      .filter((service) => form.services.includes(service.label))
      .sort((a, b) => a.label.localeCompare(b.label));

    const unselected = base
      .filter((service) => !form.services.includes(service.label))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [...selected, ...unselected];
  }, [services, activeServiceCategory, form.services]);

  const shouldServicesScroll = filteredServices.length > 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to send inquiry");
      }

      setSuccess(true);
      setForm({
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email: resolvedEmail,
        phone: resolvedPhone,
        services: [],
        message: "",
      });
      setConsent(false);
      setActiveServiceCategory("all");
    } catch (err) {
      console.error("Inquiry submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  if ((authLoading || customerLoading) && services.length === 0) {
    return (
      <section className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
          <p className="text-gray-700 text-base font-medium">Loading...</p>
        </div>
      </section>
    );
  }

  if (isLoadingServices && services.length === 0) {
    return (
      <section className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
          <p className="text-gray-700 text-base font-medium">
            Loading services...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0">
        <img
          src="/images/inquiry_emoji_room.png"
          alt="Inquiry background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div
          className="sticky z-50 w-full bg-green-900/60 backdrop-blur-md px-4 py-3 flex items-center justify-between text-white"
          style={{ top: "var(--nav-height)" }}
        >
          <h1 className="flex items-center font-bold m-0 p-0 text-lg sm:text-xl md:text-2xl">
            <span className="text-xl sm:text-2xl md:text-3xl translate-x-1">
              H
            </span>
            <img
              src="/images/happy-house-1.png"
              alt="Happy house Logo"
              className="ml-1 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10"
            />
            <span className="ml-1">ppy Property</span>
          </h1>

          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
           className="md:hidden inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer transition hover:bg-white active:scale-[0.98]"
          >
            ← Back
          </button>
        </div>

        <div className="w-full border-l-8 border-r-8 border-t-8 border-white p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-white">
            Quick Inquiry
          </h1>
          <p className="text-center text-gray-200 mt-3 font-semibold">
            Got a question? Send us a message — no photos needed.
          </p>
        </div>

        {success && (
          <div className="border-white border-l-8 border-r-8">
            <div className="p-6 bg-green-100 text-green-700 text-center">
              Message sent successfully. We&apos;ll get back to you shortly.
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white/95 backdrop-blur shadow p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="off"
                required
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="off"
                required
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone (optional)
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              autoComplete="off"
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-0"
            />
          </div>
          <ServiceSelector
            services={services.map((service) => ({
              ...service,
              selected: form.services.includes(service.label),
            }))}
            categories={categories}
            filteredServices={filteredServices.map((service) => ({
              ...service,
              selected: form.services.includes(service.label),
            }))}
            selectedServices={selectedServices.map((service) => ({
              ...service,
              selected: true,
            }))}
            selectedServicesCount={selectedServicesCount}
            countsByCategory={countsByCategory}
            activeServiceCategory={activeServiceCategory}
            isLoadingServices={isLoadingServices}
            shouldServicesScroll={shouldServicesScroll}
            onCategoryChange={setActiveServiceCategory}
            onServiceChange={(serviceUuid) => {
              const service = services.find((s) => s.uuid === serviceUuid);

              if (service) {
                toggleService(service.label);
              }
            }}
            onClearAll={handleClearAllServices}
            formatCategoryLabel={formatCategoryLabel}
            showServiceBadges={false}
          />

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              autoComplete="off"
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 cursor-pointer"
            />

            <p className="text-sm text-gray-700">
              By submitting this form, you agree that{" "}
              <span className="font-medium">Happy Property</span> may collect and
              store your information for business purposes in accordance with our{" "}
              <a
                href="/privacy-policies"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 hover:text-blue-800"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !consent}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold transition hover:bg-gray-800 hover:cursor-pointer disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}