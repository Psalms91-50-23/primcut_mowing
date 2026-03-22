import { useEffect, useRef, useState } from "react";
import Header from "@/components/headers/Header";

type ServiceOption = {
  uuid: string;
  code: string;
  label: string;
  description?: string | null;
  category?: string | null;
  requires_images?: boolean;
};

export default function InquiryPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    services: [] as string[],
    message: "",
  });

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const servicesDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleService = (code: string) => {
    setForm((prev) => {
      const alreadySelected = prev.services.includes(code);

      return {
        ...prev,
        services: alreadySelected
          ? prev.services.filter((item) => item !== code)
          : [...prev.services, code],
      };
    });
  };

  const getSelectedServiceLabels = () => {
    if (!form.services.length) return "Select services";

    return services
      .filter((service) => form.services.includes(service.code))
      .map((service) => service.label)
      .join(", ");
  };

 useEffect(() => {
  const fetchServices = async () => {
    try {
      setIsLoadingServices(true);

      const res = await fetch("/api/services", {
        method: "GET",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to load services");
      }

      const serviceRows = Array.isArray(result?.data) ? result.data : [];

      const mappedServices = serviceRows.map((service: any) => ({
        uuid: service.uuid,
        code: service.code,
        label: service.label,
      }));

      setServices(mappedServices);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  fetchServices();
}, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        services: [],
        message: "",
      });
      setServicesOpen(false);
    } catch (err) {
      console.error("Inquiry submit error:", err);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="w-full">
          <Header />
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

          <div className="relative" ref={servicesDropdownRef}>
            <label className="block text-sm font-medium mb-1">
              Services (optional)
            </label>

            <button
              type="button"
              onClick={() => setServicesOpen((prev) => !prev)}
              className="w-full border rounded-lg px-4 py-2 text-left bg-white focus:outline-none focus:ring-0 flex items-center justify-between hover:cursor-pointer"
            >
              <span
                className={
                  form.services.length ? "text-black" : "text-gray-500"
                }
              >
                {isLoadingServices ? "Loading services..." : getSelectedServiceLabels()}
              </span>
              <span className="ml-3 text-sm text-gray-500">
                {servicesOpen ? "▲" : "▼"}
              </span>
            </button>

            {servicesOpen && !isLoadingServices && (
              <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto ">
                {services.length > 0 ? (
                  services.map((service) => (
                    <label
                      key={service.uuid}
                      className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer hover:bg-green-700 hover:text-white transition "
                    >
                      <input
                        type="checkbox"
                        checked={form.services.includes(service.label)}
                        onChange={() => toggleService(service.label)}
                        className="h-4 w-4 hover:cursor-pointer"
                      />
                      <span className="text-sm text-gray-800 group-hover:text-white">
                        {service.label}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No services available
                  </div>
                )}
              </div>
            )}
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition hover:cursor-pointer disabled:bg-gray-400 disabled:hover:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}