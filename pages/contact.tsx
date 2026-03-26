import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import supabase from "@/config/db";
import Header from "@/components/headers/Header";
import GoogleAddressAutocomplete from "@/components/GoogleAddressAutocomplete";
import { nzPhoneFromIntl } from "@/utils/phone";
import { useCustomer } from "@/context/CustomerContext";

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
const INITIAL_IMAGE_SLOTS = 4;

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

  const { openImage } = useUI() as {
    openImage?: (url: string) => void;
  };

  const servicesDropdownRef = useRef<HTMLDivElement | null>(null);

  const [imageInputKey, setImageInputKey] = useState(0);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

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

  const selectedServicesCount = services.filter((s) => s.selected).length;
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

  const hasSelectedServices = selectedServices.length > 0;

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

  const selectedServicesSummary = useMemo(() => {
    const selected = services.filter((s) => s.selected);
    if (selected.length === 0) return "Select one or more services";
    if (selected.length <= 2) return selected.map((s) => s.label).join(", ");
    return `${selected[0].label}, ${selected[1].label} +${
      selected.length - 2
    } more`;
  }, [services]);

  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceOption[]> = {};

    for (const service of services) {
      const key = service.category?.trim() || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(service);
    }

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [services]);

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

    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || resolvedFirstName,
      lastName: prev.lastName || resolvedLastName,
      email: prev.email || resolvedEmail,
      mobile: prev.mobile || resolvedMobile,
      landline: prev.landline || resolvedLandline,
      address: prev.address || resolvedAddress,
    }));
  }, [
    loading,
    customerLoading,
    resolvedFirstName,
    resolvedLastName,
    resolvedEmail,
    resolvedMobile,
    resolvedLandline,
    resolvedAddress,
  ]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);

        const res = await fetch("/api/services", {
          method: "GET",
        });

        const result = await res.json();

        console.log("frontend /api/services result:", result);

        if (!res.ok) {
          throw new Error(result?.error || "Failed to load services");
        }

        const serviceRows = Array.isArray(result?.data) ? result.data : [];

        const mappedServices: ServiceOption[] = serviceRows.map(
          (service: any) => ({
            uuid: service.uuid,
            code: service.code,
            label: service.label,
            description: service.description ?? null,
            category: service.category ?? null,
            requires_images: Boolean(service.requires_images),
            urgent_allowed: Boolean(service.urgent_allowed),
            selected: false,
          })
        );

        setServices(mappedServices);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        setServices([]);
        toast.error("Failed to load services. Please refresh the page.");
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const handlePointerDownOutside = (event: Event) => {
      if (!isServicesOpen) return;

      const target = event.target as Node | null;
      if (!target) return;

      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(target)
      ) {
        setIsServicesOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDownOutside, true);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDownOutside,
        true
      );
    };
  }, [isServicesOpen]);

  useEffect(() => {
    return () => {
      imageInputs.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [imageInputs]);

  useEffect(() => {
    if (!allSelectedAllowUrgent && isUrgent) {
      setIsUrgent(false);
    }
  }, [allSelectedAllowUrgent, isUrgent]);

  const handleServiceChange = (index: number) => {
    if (formNotice) {
      setFormNotice(null);
    }

    setServices((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        selected: !next[index].selected,
      };
      return next;
    });
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
    setIsServicesOpen(false);
    setFormNotice(null);
    setIsUrgent(false);
    setImageInputKey((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormNotice(null);

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
      const uploadedImages = await Promise.all(
        filledImageRows.map(async (img, index) => {
          if (!img.file) return null;

          const fileName = `quotes/${Date.now()}_${index}_${img.file.name}`;

          const { error } = await supabase.storage
            .from("quote-images")
            .upload(fileName, img.file);

          if (error) throw error;

          const url = supabase.storage
            .from("quote-images")
            .getPublicUrl(fileName).data.publicUrl;

          return {
            label: img.label.trim() || `Image ${index + 1}`,
            url,
          };
        })
      );

      const imagesPayload = uploadedImages.filter(Boolean);

      const payload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        mobile: formData.mobile.trim(),
        landline: formData.landline.trim(),
        preferred_contact_method: preferredContactMethod,
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim(),
        address: formData.address.trim(),
        recurrence_frequency: formData.recurrenceFrequency,
        urgent: isUrgent,
        services: selectedServicesPayload,
        images: imagesPayload,
      };

      const res = await fetch(`/api/quotes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start text-black pb-5">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/contact_us_1.png')" }}
      />
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="relative z-10 w-full flex flex-col items-center pt-20 px-6 max-w-2xl">
        <div className="relative w-full text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Contact Us
          </h1>
          <p className="text-xl max-w-3xl italic font-bold md:text-xl text-gray-200 mb-4">
            Our team strives to reply to all messages within 2 business working
            days.
          </p>
          <p className="text-lg font-semibold text-gray-100 pb-6 sm:text-base">
            For an accurate quote, please send images.
          </p>
        </div>

        <div className="w-full max-w-xl bg-white/90 rounded-lg p-4 mb-6 text-center shadow">
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

        <div className="w-full max-w-xl">
          <Header />
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full max-w-xl bg-white/85 rounded-b-sm shadow space-y-4 pb-5 px-6 pt-5"
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
            onSelect={(address) =>
              setFormData((prev) => ({
                ...prev,
                address,
              }))
            }
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
              className="input-border w-full border px-3 py-2 rounded resize-none bg-white overflow-y-scroll overflow-x-hidden"
              placeholder="Write any additional details here..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2" ref={servicesDropdownRef}>
            <label className="text-lg py-1 block">Select Services</label>

            {isLoadingServices ? (
              <div className="text-sm text-gray-600">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="text-sm text-red-600">
                No services available right now.
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsServicesOpen((prev) => !prev)}
                  className="w-full border border-gray-300 rounded px-4 py-3 bg-white text-left flex items-center justify-between hover:border-gray-400 hover:cursor-pointer"
                >
                  <span className="truncate pr-4 text-sm sm:text-base">
                    {selectedServicesSummary}
                  </span>
                  <span className="text-sm text-gray-500 shrink-0">
                    {isServicesOpen
                      ? "Close"
                      : selectedServicesCount > 0
                      ? `${selectedServicesCount} selected`
                      : "Open"}
                  </span>
                </button>

                {isServicesOpen && (
                  <div className="absolute z-30 mt-2 w-full max-h-80 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg p-3 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
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

                    {groupedServices.map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 border-b pb-1">
                          {category}
                        </div>

                        <div className="space-y-2">
                          {items.map((service) => {
                            const serviceIndex = services.findIndex(
                              (s) => s.uuid === service.uuid
                            );

                            return (
                              <label
                                key={service.uuid}
                                className="group flex items-start gap-3 rounded border border-gray-100 px-3 py-2 hover:bg-green-700 hover:cursor-pointer transition"
                              >
                                <input
                                  type="checkbox"
                                  checked={service.selected}
                                  onChange={() =>
                                    handleServiceChange(serviceIndex)
                                  }
                                  className="mt-1 hover:cursor-pointer"
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm sm:text-base group-hover:text-white">
                                    {service.label}
                                  </span>

                                  {service.description && (
                                    <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-200">
                                      {service.description}
                                    </span>
                                  )}

                                  {service.requires_images && (
                                    <span className="text-xs text-green-700 pt-1 group-hover:text-green-200">
                                      Images recommended
                                    </span>
                                  )}

                                  {service.urgent_allowed && (
                                    <span className="text-xs text-amber-700 pt-1 group-hover:text-amber-200">
                                      Urgent booking available
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {hasSelectedServices && allSelectedAllowUrgent && (
            <div className="rounded border border-amber-200 bg-amber-50 px-4 py-4 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-amber-600 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-sm sm:text-base text-amber-900">
                    Request urgent priority booking
                  </span>
                  <span className="text-xs sm:text-sm text-amber-800">
                    Urgent service is available for selected maintenance services only and incurs an additional priority fee.
                  </span>
                </div>
              </label>

              {isUrgent && (
                <p className="text-xs text-amber-900 italic">
                  Urgent requests are subject to availability and may include an extra charge.
                </p>
              )}
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

          <div className="py-5">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingServices}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded transition
                ${
                  isSubmitting || isLoadingServices
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-900 hover:cursor-pointer"
                }
                text-white`}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}