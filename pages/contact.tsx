import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import Header from "@/components/headers/Header";
import GoogleAddressAutocomplete from "@/components/GoogleAddressAutocomplete";
import { nzPhoneFromIntl } from "@/utils/phone";
import { useCustomer } from "@/context/CustomerContext";
import { useRouter } from "next/router";
import { SERVICES } from "@/data/services";
type Props = {};

type DynamicImageInput = {
  id: string;
  label: string;
  file: File | null;
  previewUrl: string | null;
};

type RecurrenceFrequency =
  | "one_off"
  | "weekly"
  | "fortnightly"
  | "monthly";

type FormDataType = {
  firstName: string;
  lastName: string;
  mobile: string;
  landline: string;
  email: string;
  message: string;
  address: string;
  recurrenceFrequency: RecurrenceFrequency;
};

type ServiceOption = {
  uuid: string;
  code: string;
  label: string;
  description?: string | null;
  category?: string | null;
  requires_images?: boolean;
  urgent_allowed?: boolean;
  selected: boolean;
};

const MAX_IMAGE_UPLOADS = 10;
const INITIAL_IMAGE_SLOTS = 2;
const URGENT_FEE_AMOUNT = 200;

const RECURRENCE_OPTIONS: Array<{
  value: RecurrenceFrequency;
  label: string;
  description: string;
}> = [
  {
    value: "one_off",
    label: "One-off",
    description: "A single visit only",
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Ongoing weekly service",
  },
  {
    value: "fortnightly",
    label: "Fortnightly",
    description: "Every 2 weeks",
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Once a month",
  },
];

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

const createImageRow = (): DynamicImageInput => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  label: "",
  file: null,
  previewUrl: null,
});

const createInitialImageRows = (): DynamicImageInput[] =>
  Array.from({ length: INITIAL_IMAGE_SLOTS }, () => createImageRow());

const getSafeString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export default function ContactPage(props: Props) {
  const { loading } = useAuth();
  const { customer, customerLoading } = useCustomer();
  const [hasPrefilledCustomerData, setHasPrefilledCustomerData] = useState(false);
  const router = useRouter();
  const { openImage } = useUI() as {
    openImage?: (url: string) => void;
  };

  const [imageInputKey, setImageInputKey] = useState(0);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] = useState<string>("all");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    mobile: "",
    landline: "",
    email: "",
    message: "",
    address: "",
    recurrenceFrequency: "one_off",
  });

  const [imageInputs, setImageInputs] =
    useState<DynamicImageInput[]>(createInitialImageRows());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  const [preferredContactMethod, setPreferredContactMethod] = useState<
    "mobile" | "landline" | "email"
  >("email");

  const [services, setServices] = useState<ServiceOption[]>([]);

  const canAddMoreImages = imageInputs.length < MAX_IMAGE_UPLOADS;

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
  const resolvedAddress = getSafeString(customer?.address);

  const selectedServices = useMemo(
    () => services.filter((s) => s.selected),
    [services]
  );

  const selectedServicesCount = selectedServices.length;
  const hasSelectedServices = selectedServices.length > 0;
  const hasMultipleSelectedServices = selectedServices.length > 1;

  const allSelectedAllowUrgent = useMemo(() => {
    if (!hasSelectedServices) return false;
    return selectedServices.every((s) => Boolean(s.urgent_allowed));
  }, [selectedServices, hasSelectedServices]);

  const hasMixedUrgentEligibility = useMemo(() => {
    if (!hasSelectedServices) return false;

    const hasUrgentAllowed = selectedServices.some((s) =>
      Boolean(s.urgent_allowed)
    );
    const hasUrgentBlocked = selectedServices.some(
      (s) => !Boolean(s.urgent_allowed)
    );

    return hasUrgentAllowed && hasUrgentBlocked;
  }, [selectedServices, hasSelectedServices]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(services.map((service) => service.category).filter(Boolean))
    ).sort((a, b) =>
      formatCategoryLabel(String(a)).localeCompare(formatCategoryLabel(String(b)))
    );

    return ["all", ...unique] as string[];
  }, [services]);

  const filteredServices = useMemo(() => {
    const base =
      activeServiceCategory === "all"
        ? services
        : services.filter((service) => service.category === activeServiceCategory);

    const selected = base
      .filter((service) => service.selected)
      .sort((a, b) => a.label.localeCompare(b.label));

    const unselected = base
      .filter((service) => !service.selected)
      .sort((a, b) => a.label.localeCompare(b.label));

    return [...selected, ...unselected];
  }, [services, activeServiceCategory]);

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

  const shouldServicesScroll = filteredServices.length > 4;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (formNotice) {
      setFormNotice(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecurrenceChange = (value: RecurrenceFrequency) => {
    if (formNotice) {
      setFormNotice(null);
    }

    setFormData((prev) => ({
      ...prev,
      recurrenceFrequency: value,
    }));
  };

  useEffect(() => {
    if (loading || customerLoading) return;
    if (hasPrefilledCustomerData) return;
    if (!customer) return;

    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || resolvedFirstName,
      lastName: prev.lastName || resolvedLastName,
      email: prev.email || resolvedEmail,
      mobile: prev.mobile || resolvedMobile,
      landline: prev.landline || resolvedLandline,
      address: prev.address || resolvedAddress,
    }));

    if (resolvedMobile) {
      setPreferredContactMethod("mobile");
    } else if (resolvedLandline) {
      setPreferredContactMethod("landline");
    } else {
      setPreferredContactMethod("email");
    }

    setHasPrefilledCustomerData(true);
  }, [
    loading,
    customerLoading,
    customer,
    hasPrefilledCustomerData,
    resolvedFirstName,
    resolvedLastName,
    resolvedEmail,
    resolvedMobile,
    resolvedLandline,
    resolvedAddress,
  ]);

  useEffect(() => {

    const loadServicesFromJson = () => {
    try {
      setIsLoadingServices(true);

      const mappedServices: ServiceOption[] = SERVICES.map((service) => ({
        uuid: service.uuid,
        code: service.code,
        label: service.label,
        description: service.description ?? null,
        category: service.category ?? null,
        requires_images: Boolean(service.requires_images),
        urgent_allowed: Boolean(service.urgent_allowed),
        selected: false,
      }));

      setServices(mappedServices);
    } catch (error) {
      console.error("Failed to load services from JSON object:", error);
      setServices([]);
      toast.error("Failed to load services. Please refresh the page.");
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

    //     const mappedServices: ServiceOption[] = serviceRows.map(
    //       (service: any) => ({
    //         uuid: service.uuid,
    //         code: service.code,
    //         label: service.label,
    //         description: service.description ?? null,
    //         category: service.category ?? null,
    //         requires_images: Boolean(service.requires_images),
    //         urgent_allowed: Boolean(service.urgent_allowed),
    //         selected: false,
    //       })
    //     );

    //     setServices(mappedServices);
    //   } catch (error) {
    //     console.error("Failed to fetch services:", error);
    //     setServices([]);
    //     toast.error("Failed to load services. Please refresh the page.");
    //   } finally {
    //     setIsLoadingServices(false);
    //   }
    // };

    // fetchServices();
  }, []);

  useEffect(() => {
    return () => {
      imageInputs.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [imageInputs]);

  const handleAddressSelect = React.useCallback((address: string) => {
    setFormData((prev) => ({
      ...prev,
      address,
    }));
  }, []);

  useEffect(() => {
    if ((!allSelectedAllowUrgent || hasMultipleSelectedServices) && isUrgent) {
      setIsUrgent(false);
    }
  }, [allSelectedAllowUrgent, hasMultipleSelectedServices, isUrgent]);

  const handleServiceChange = (serviceUuid: string) => {
    if (formNotice) {
      setFormNotice(null);
    }

    setServices((prev) =>
      prev.map((service) =>
        service.uuid === serviceUuid
          ? { ...service, selected: !service.selected }
          : service
      )
    );
  };

  const handleClearAllServices = () => {
    if (formNotice) {
      setFormNotice(null);
    }

    setServices((prev) =>
      prev.map((service) => ({ ...service, selected: false }))
    );
    setIsUrgent(false);
  };

  const handleImageLabelChange = (id: string, value: string) => {
    if (formNotice) {
      setFormNotice(null);
    }

    setImageInputs((prev) =>
      prev.map((img) => (img.id === id ? { ...img, label: value } : img))
    );
  };

  const handleImageFileChange = (id: string, file: File | null) => {
    if (formNotice) {
      setFormNotice(null);
    }

    setImageInputs((prev) =>
      prev.map((img) => {
        if (img.id !== id) return img;

        if (file && file.size > 10 * 1024 * 1024) {
          alert("File is too large. Max 10MB per image.");
          return img;
        }

        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }

        if (!file) {
          return {
            ...img,
            file: null,
            previewUrl: null,
          };
        }

        return {
          ...img,
          file,
          previewUrl: URL.createObjectURL(file),
        };
      })
    );
  };

  const handleAddImageSlot = () => {
    if (formNotice) {
      setFormNotice(null);
    }

    if (imageInputs.length >= MAX_IMAGE_UPLOADS) {
      toast.error(`You can upload a maximum of ${MAX_IMAGE_UPLOADS} images.`);
      return;
    }

    setImageInputs((prev) => [...prev, createImageRow()]);
  };

  const handleRemoveImageSlot = (id: string) => {
    if (formNotice) {
      setFormNotice(null);
    }

    setImageInputs((prev) => {
      if (prev.length === 1) {
        const only = prev[0];
        if (only.previewUrl) {
          URL.revokeObjectURL(only.previewUrl);
        }
        return [createImageRow()];
      }

      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return prev.filter((img) => img.id !== id);
    });
  };

  const handleOpenPreview = (url: string) => {
    if (openImage) {
      openImage(url);
      return;
    }

    window.open(url, "_blank");
  };

  const resetForm = () => {
    imageInputs.forEach((img) => {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });

    setFormData({
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      mobile: resolvedMobile,
      landline: resolvedLandline,
      email: resolvedEmail,
      message: "",
      address: resolvedAddress,
      recurrenceFrequency: "one_off",
    });

    setImageInputs(createInitialImageRows());
    setServices((prev) => prev.map((s) => ({ ...s, selected: false })));
    setPreferredContactMethod("email");
    setFormNotice(null);
    setIsUrgent(false);
    setActiveServiceCategory("all");
    setAgreedToPrivacy(false);
    setImageInputKey((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormNotice(null);

    if (!agreedToPrivacy) {
      alert(
        "Please confirm that you agree to our use of your information for business purposes before sending your message."
      );
      setIsSubmitting(false);
      return;
    }

    if (!formData.mobile.trim() && !formData.landline.trim()) {
      alert("Please provide at least a mobile or landline number.");
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.address.trim()) {
      alert("Please enter your address.");
      setIsSubmitting(false);
      return;
    }

    const selectedServicesPayload = services
      .filter((s) => s.selected)
      .map((s) => ({
        service_uuid: s.uuid,
        code: s.code,
        label: s.label,
        description: s.description || null,
        quantity: 1,
        unit_price: 0,
        line_total: 0,
      }));

    if (selectedServicesPayload.length === 0) {
      alert("Please select at least one service.");
      setIsSubmitting(false);
      return;
    }

    if (isUrgent && selectedServicesPayload.length > 1) {
      alert(
        "Only 1 urgent request can be done per job. Please select one service only to request urgent priority booking."
      );
      setIsSubmitting(false);
      return;
    }

    const filledImageRows = imageInputs.filter((img) => img.file !== null);
    const hasAtLeastOneImage = filledImageRows.length > 0;

    if (filledImageRows.length > MAX_IMAGE_UPLOADS) {
      alert(`You can upload a maximum of ${MAX_IMAGE_UPLOADS} images.`);
      setIsSubmitting(false);
      return;
    }

    const selectedRequireImages = services
      .filter((s) => s.selected)
      .some((s) => s.requires_images);

    if (selectedRequireImages && !hasAtLeastOneImage) {
      alert("Please upload at least one image for the selected service.");
      setIsSubmitting(false);
      return;
    }

    try {
      const submitFormData = new FormData();

      submitFormData.append("first_name", formData.firstName.trim());
      submitFormData.append("last_name", formData.lastName.trim());
      submitFormData.append("mobile", formData.mobile.trim());
      submitFormData.append("landline", formData.landline.trim());
      submitFormData.append(
        "preferred_contact_method",
        preferredContactMethod
      );
      submitFormData.append("email", formData.email.trim().toLowerCase());
      submitFormData.append("message", formData.message.trim());
      submitFormData.append("address", formData.address.trim());
      submitFormData.append(
        "recurrence_frequency",
        formData.recurrenceFrequency
      );
      submitFormData.append("urgent", String(isUrgent));
      submitFormData.append("privacy_consent", String(agreedToPrivacy));
      submitFormData.append("services", JSON.stringify(selectedServicesPayload));

      filledImageRows.forEach((img, index) => {
        if (!img.file) return;
        submitFormData.append("images", img.file);
        submitFormData.append(
          "image_labels",
          img.label.trim() || `Image ${index + 1}`
        );
      });

      const res = await fetch(`/api/quotes/create`, {
        method: "POST",
        body: submitFormData,
      });

      const responseData = await res.json().catch(() => null);

      if (res.ok) {
        toast.success("Message sent successfully!");
        resetForm();
      } else {
        if (responseData?.code === "CUSTOMER_BLACKLISTED") {
          setFormNotice(
            "Thank you for your enquiry. We are unable to process your request through the online form at this time. Please contact the business directly and our team will be happy to assist you further."
          );
          setIsSubmitting(false);
          return;
        }

        alert(
          responseData?.error || "Failed to send message. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while sending your quote. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || customerLoading) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="text-gray-700 text-base font-medium">Loading ...</p>
    </div>
  );
}

return (
  <div className="relative min-h-screen w-full flex flex-col justify-start text-black pb-5">
    {/* Background */}
    <div
      className="absolute inset-0 z-0 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/contact_us_1.png')" }}
    />
    <div className="absolute inset-0 z-0 bg-black/50"></div>

    {/* Content wrapper */}
    <div
      className="relative z-10 w-full px-6"
      style={{ paddingTop: "var(--nav-height)" }}
    >
      {/* Inner width controller */}
      <div className="mx-auto w-full max-w-2xl flex flex-col items-center">

        {/* Sticky top bar */}
        <div
          className="sticky z-50 w-full"
          style={{ top: "var(--nav-height)" }}
        >
          <div className="block md:hidden">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition hover:bg-white active:scale-[0.98] hover:cursor-pointer"
          >
            ← Back
          </button>
        </div>
        </div>

        {/* Title section */}
        <div className="w-full text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Contact Us
          </h1>
          <p className="text-xl italic font-bold text-gray-200 mb-4">
            Our team strives to reply to all messages within 2 business working
            days.
          </p>
          <p className="text-lg font-semibold text-gray-100 pb-6">
            For an accurate quote, please send images.
          </p>
        </div>

        {/* Inquiry box */}
        <div className="w-full bg-white/90 rounded-lg p-4 mb-6 text-center shadow">
          <p className="text-sm text-gray-700 mb-3">
            Not ready to upload images or need a quick answer?
          </p>

          <button
            type="button"
            onClick={() => (window.location.href = "/inquiry")}
            className="px-5 py-2 bg-black text-white font-semibold rounded hover:bg-black/95 transition hover:cursor-pointer"
          >
            Send a Quick Inquiry
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Simple message, no photos required
          </p>
        </div>

        {/* Header */}
        <div className="w-full">
          <Header />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full bg-white/85 rounded-b-sm shadow space-y-4 pb-5 px-6 pt-5"
        >
          {formNotice && (
            <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {formNotice}
            </div>
          )}

          <div className="flex flex-row gap-4">
            <div className="w-1/2">
              <label htmlFor="firstName" className="block font-medium mb-1 py-2">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                autoComplete="off"
                value={formData.firstName}
                onChange={handleChange}
                className="input-border w-full border px-3 py-2 rounded bg-white"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div className="w-1/2">
              <label htmlFor="lastName" className="block font-medium mb-1 py-2">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                autoComplete="off"
                value={formData.lastName}
                onChange={handleChange}
                className="input-border w-full border px-3 py-2 rounded bg-white"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <GoogleAddressAutocomplete
            label="Address"
            value={formData.address}
            onSelect={handleAddressSelect}
            helperText="Start typing and select your address from Google suggestions."
          />

          <div className="flex flex-col">
            <div className="flex flex-row gap-4">
              <div className="w-1/2">
                <label className="block font-medium mb-1 py-2">Mobile</label>
                <input
                  name="mobile"
                  type="text"
                  autoComplete="off"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="input-border w-full border px-3 py-2 rounded bg-white"
                  placeholder="Mobile number"
                />
              </div>

              <div className="w-1/2">
                <label className="block font-medium mb-1 py-2">Landline</label>
                <input
                  name="landline"
                  type="text"
                  autoComplete="off"
                  value={formData.landline}
                  onChange={handleChange}
                  className="input-border w-full border px-3 py-2 rounded bg-white"
                  placeholder="Landline number"
                />
              </div>
            </div>

            <span className="text-xs italic py-3">
              At least one contact number is required and add area code for
              landline, but you may add both if you’d like.
            </span>

            <div className="relative flex flex-col pt-1">
              <label className="py-2 mb-1">Preferred contact method</label>
              <select
                value={preferredContactMethod}
                onChange={(e) =>
                  setPreferredContactMethod(
                    e.target.value as "mobile" | "landline" | "email"
                  )
                }
                className="input-border w-full border py-3 rounded hover:cursor-pointer px-3 bg-white"
              >
                <option value="mobile">Mobile</option>
                <option value="landline">Landline</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block font-medium mb-1 py-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              id="email"
              autoComplete="off"
              value={formData.email}
              onChange={handleChange}
              className="input-border w-full border px-3 py-2 rounded bg-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2 py-2">
              How often would you like the service?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RECURRENCE_OPTIONS.map((option) => {
                const isSelected =
                  formData.recurrenceFrequency === option.value;

                return (
                  <label
                    key={option.value}
                    className={`rounded border px-4 py-3 bg-white transition hover:cursor-pointer ${
                      isSelected
                        ? "border-green-700 ring-1 ring-green-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="recurrenceFrequency"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleRecurrenceChange(option.value)}
                        className="mt-1 hover:cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm sm:text-base">
                          {option.label}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <p className="text-xs italic text-gray-600 pt-2">
              Choose one-off for a single visit, or select a recurring option
              for regular ongoing work.
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block font-medium mb-1 py-2">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              autoComplete="off"
              value={formData.message}
              onChange={handleChange}
              className="input-border w-full border px-3 py-2 rounded resize-y bg-white overflow-y-scroll overflow-x-hidden"
              placeholder="Write any additional details here..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-lg py-1 block">Select Services</label>
              <p className="text-sm text-gray-600">
                Selected services stay at the top and can be removed without scrolling.
              </p>
            </div>

            {isLoadingServices ? (
              <div className="text-sm text-gray-600">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-sm text-red-600">
                No services available right now.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = cat === activeServiceCategory;
                    const hasSelectedInCategory =
                      cat === "all"
                        ? selectedServices.length > 0
                        : services.some(
                            (service) =>
                              service.category === cat && service.selected
                          );

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveServiceCategory(cat)}
                        className={[
                          "px-4 py-2 rounded-full text-sm font-semibold transition border hover:cursor-pointer",
                          active
                            ? "bg-green-700 text-white border-green-700 shadow"
                            : hasSelectedInCategory
                            ? "bg-green-50 text-green-800 border-green-300"
                            : "bg-white text-gray-800 border-gray-200 hover:border-green-300 hover:ring-2 hover:ring-green-200",
                        ].join(" ")}
                      >
                        {cat === "all" ? "All Services" : formatCategoryLabel(cat)}
                        <span className="ml-2 opacity-80">
                          ({countsByCategory[cat] || 0})
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3">
                  <div className="text-sm font-medium text-gray-700">
                    {selectedServicesCount > 0
                      ? `${selectedServicesCount} service${
                          selectedServicesCount > 1 ? "s" : ""
                        } selected`
                      : "Choose one or more services"}
                  </div>

                  {selectedServicesCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllServices}
                      className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline hover:cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {selectedServicesCount > 0 && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                    <p className="text-xs font-semibold text-green-800 mb-2">
                      Selected services
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedServices
                        .slice()
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map((service) => (
                          <button
                            key={service.uuid}
                            type="button"
                            onClick={() => handleServiceChange(service.uuid)}
                            className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 hover:cursor-pointer"
                          >
                            <span>{service.label}</span>
                            <span className="text-xs">✕</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {filteredServices.length === 0 ? (
                  <div className="rounded border bg-gray-50 p-6 text-center text-sm text-gray-600">
                    No services found in this category.
                  </div>
                ) : (
                  <div
                    className={`rounded-xl border border-gray-200 bg-white/60 p-2 ${
                      shouldServicesScroll
                        ? "max-h-[34rem] overflow-y-auto pr-1"
                        : "overflow-visible"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-3">
                      {filteredServices.map((service) => {
                        const isSelected = service.selected;

                        return (
                          <button
                            key={service.uuid}
                            type="button"
                            onClick={() => handleServiceChange(service.uuid)}
                            className={`w-full text-left rounded-xl border p-4 transition hover:cursor-pointer ${
                              isSelected
                                ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                                : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-semibold ${
                                    isSelected ? "text-green-700" : "text-gray-600"
                                  }`}
                                >
                                  {formatCategoryLabel(service.category || "Other")}
                                </p>

                                <h3 className="text-base sm:text-lg font-bold mt-1 text-gray-900">
                                  {service.label}
                                </h3>

                                {service.description && (
                                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                                    {service.description}
                                  </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {service.requires_images && (
                                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                      Photos helpful
                                    </span>
                                  )}

                                  {service.urgent_allowed && (
                                    <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                      Urgent booking available
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold border ${
                                  isSelected
                                    ? "bg-green-700 text-white border-green-700"
                                    : "bg-white text-gray-600 border-gray-300"
                                }`}
                              >
                                {isSelected ? "Selected" : "Click to select"}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {hasSelectedServices && allSelectedAllowUrgent && (
            <div className="rounded border border-amber-200 bg-amber-50 px-4 py-4 space-y-3">
              <label
                className={`flex items-start gap-3 ${
                  hasMultipleSelectedServices
                    ? "cursor-not-allowed opacity-80"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  disabled={hasMultipleSelectedServices}
                  className="mt-1 h-4 w-4 shrink-0 accent-amber-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm sm:text-base text-amber-900">
                    Request urgent priority booking
                  </span>
                  <span className="text-xs sm:text-sm text-amber-800">
                    Urgent service is available for selected maintenance services and includes an additional{" "}
                    <strong>${URGENT_FEE_AMOUNT} + GST</strong> priority fee.
                  </span>
                </div>
              </label>

              {hasMultipleSelectedServices ? (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  Only 1 urgent request can be done per job. Please select one
                  service only to request urgent priority booking.
                </div>
              ) : isUrgent ? (
                <div className="text-xs text-amber-900 italic space-y-1">
                  <p>
                    Urgent requests are prioritised and scheduled as soon as
                    possible, subject to availability.
                  </p>
                  <p>
                    The urgent fee will be included in your quote total before
                    acceptance.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {hasMixedUrgentEligibility && (
            <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              Urgent booking is only available when all selected services are
              urgent-eligible. For lawn care or mixed bookings, please submit a
              separate request if you need urgent maintenance work.
            </div>
          )}

          <div className="space-y-4">
            <div className="font-semibold">Upload Images</div>
            <p className="text-xs italic text-gray-700">
              Please upload images if needed. Maximum {MAX_IMAGE_UPLOADS} images.
            </p>

            <div className="text-xs text-gray-600">
              {imageInputs.length} / {MAX_IMAGE_UPLOADS} image slots used
            </div>

            {imageInputs.map((img, index) => (
              <div
                key={img.id}
                className="rounded border border-gray-200 p-3 bg-white/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    Image {index + 1}
                  </div>

                  {imageInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageSlot(img.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline hover:cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder={`Image ${index + 1} eg front yard`}
                  value={img.label}
                  onChange={(e) => handleImageLabelChange(img.id, e.target.value)}
                  className="input-border w-full border px-3 py-2 rounded"
                />

                <input
                  key={`${imageInputKey}_${img.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageFileChange(img.id, e.target.files?.[0] || null)
                  }
                  className="input-border w-full border px-3 py-2 rounded hover:cursor-pointer"
                />

                {img.previewUrl && (
                  <div className="space-y-2 block w-22 h-24 overflow-hidden rounded">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(img.previewUrl!)}
                      className="block w-22 h-16 overflow-hidden rounded bg-gray-100 hover:opacity-90 transition hover:cursor-pointer"
                    >
                      <img
                        src={img.previewUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full rounded object-cover"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPreview(img.previewUrl!)}
                      className="text-xs text-green-700 hover:text-green-900 hover:underline hover:cursor-pointer"
                    >
                      Click to enlarge
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddImageSlot}
              disabled={!canAddMoreImages}
              className={`w-full border border-dashed py-2 rounded transition ${
                canAddMoreImages
                  ? "border-green-700 text-green-700 hover:bg-green-50 hover:cursor-pointer"
                  : "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50"
              }`}
            >
              {canAddMoreImages
                ? "+ Add another image"
                : `Maximum ${MAX_IMAGE_UPLOADS} images reached`}
            </button>
          </div>

          <div className="rounded border border-gray-200 bg-white px-4 py-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-green-700 cursor-pointer"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                By using our services, you agree that Happy Property may collect,
                store, and use your information for business purposes related to
                your enquiry, quote, booking, and service delivery. Read our{" "}
                <a
                  href="/privacy-policies"
                  className="text-green-700 font-semibold underline hover:text-green-900"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </div>

          <div className="py-5">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingServices || !agreedToPrivacy}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded transition
                ${
                  isSubmitting || isLoadingServices || !agreedToPrivacy
                    ? "bg-green-600/70 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-900 hover:cursor-pointer"
                }
                text-white`}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

            {!agreedToPrivacy && (
              <p className="text-xs text-red-600 mt-2 text-center">
                Please confirm the privacy checkbox before sending your message.
              </p>
            )}
          </div>

        </form>
      </div>
    </div>
  </div>
  );
}