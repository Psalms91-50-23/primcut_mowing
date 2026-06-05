import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { SERVICES } from "@/data/services";

type Props = {};

type Service = {
  uuid: string;
  code: string;
  label: string;
  description: string;
  category: string;
  requires_images: boolean;
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

const categoryDescriptions: Record<string, string> = {
  property_maintenance:
    "General property maintenance, handyman work, and custom repair jobs for homes, rentals, and managed properties.",
  interior_repairs:
    "Indoor repair work including walls, fixtures, doors, windows, paint touch ups, sealant replacement, and minor carpentry.",
  exterior_maintenance:
    "Outdoor upkeep and repair work including gutters, fences, gates, decks, pressure washing, and roof moss treatment.",
  lawn_care:
    "Lawn mowing, edging, and weed control to keep outdoor spaces neat, healthy, and easy to maintain.",
  garden_services:
    "Garden tidy-ups, trimming, green waste removal, leaf cleanup, plant removal, and general outdoor maintenance.",
  cleaning:
    "Professional cleaning services including end-of-lease cleaning, deck cleaning, driveway cleaning, and window cleaning.",
  junk_removal:
    "Removal of unwanted items, garage cleanup, and disposal of construction or property waste.",
  renovation:
    "Support for end-of-lease renovation work, property refresh jobs, and furniture or junk removal related to larger tidy-up projects.",
};

const formatCategoryLabel = (category: string) => {
  return (
    categoryLabels[category] ||
    category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

export default function ServicePage(props: Props) {
  const { loading: authLoading } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    // const controller = new AbortController();
    const loadServicesFromJson = () => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const localServices: Service[] = SERVICES.filter(
        (service) => service.is_active && !service.is_deleted
      ).map((service) => ({
        uuid: service.uuid,
        code: service.code,
        label: service.label,
        description: service.description ?? "",
        category: service.category ?? "",
        requires_images: Boolean(service.requires_images),
      }));

      setServices(localServices);
    } catch (err: any) {
      console.error("Failed to load local services:", err);
      setServices([]);
      setServicesError(err?.message || "Failed to load services");
    } finally {
      setServicesLoading(false);
    }
  };

  loadServicesFromJson();
    // const fetchServices = async () => {
    //   try {
    //     setServicesLoading(true);
    //     setServicesError(null);

    //     const res = await fetch("/api/services", {
    //       method: "GET",
    //       // signal: controller.signal,
    //     });

    //     const json = await res.json();

    //     if (!res.ok) {
    //       throw new Error(json?.error || "Failed to fetch services");
    //     }

    //     const incomingServices = Array.isArray(json?.data) ? json.data : [];

    //     setServices(incomingServices);
    //   } catch (err: any) {
    //     if (err?.name === "AbortError") return;

    //     console.error("Failed to fetch services:", err);
    //     setServices([]);
    //     setServicesError(err?.message || "Failed to load services");
    //   } finally {
    //     setServicesLoading(false);
    //   }
    // };

    // fetchServices();

    // return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(services.map((service) => service.category).filter(Boolean))
    ).sort((a, b) => formatCategoryLabel(a).localeCompare(formatCategoryLabel(b)));

    return ["all", ...unique];
  }, [services]);

  const filteredServices = useMemo(() => {
    const result =
      activeCategory === "all"
        ? services
        : services.filter((service) => service.category === activeCategory);

    return [...result].sort((a, b) => a.label.localeCompare(b.label));
  }, [services, activeCategory]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      all: services.length,
    };

    for (const service of services) {
      const key = service.category || "uncategorized";
      counts[key] = (counts[key] || 0) + 1;
    }

    return counts;
  }, [services]);

  if (authLoading || servicesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 text-base font-medium">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white px-6">
        <div className="max-w-6xl mx-auto md:px-0 py-14 md:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border shadow-sm text-sm font-semibold text-green-800">
              ✅ Now taking bookings across Hutt Valley
            </div>

            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Services Built for Busy Homeowners & Property Managers
            </h1>

            <p className="mt-4 max-w-3xl text-base md:text-lg text-gray-700 leading-relaxed">
              Reliable scheduling, clear communication, and a professional finish.
              Explore our services below and request a free quote in minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition shadow"
              >
                Get a Free Quote
              </Link>

              <a
                href="tel:+64000000000"
                className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold hover:border-green-300 hover:ring-2 hover:ring-green-200 transition"
              >
                Call Now
              </a>
            </div>

            <div className="mt-10 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Fast Quotes", desc: "Same day / next day response." },
                { title: "Reliable Scheduling", desc: "We show up when we say we will." },
                { title: "Professional Finish", desc: "We leave the place tidy." },
              ].map((x) => (
                <div
                  key={x.title}
                  className="p-5 rounded-2xl bg-white border shadow-sm text-left"
                >
                  <p className="font-bold text-gray-900">{x.title}</p>
                  <p className="mt-1 text-gray-700 text-sm">{x.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="bg-white px-6">
        <div className="max-w-6xl mx-auto md:px-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-8 border-b">
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Our Services
              </h2>
              <p className="text-gray-600 mt-1">
                Click a category to explore available services and request a quote.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {categories.map((cat) => {
                const active = cat === activeCategory;

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={[
                      "px-4 py-2 rounded-full text-sm font-semibold transition border",
                      active
                        ? "bg-green-700 text-white border-green-700 shadow"
                        : "bg-white text-gray-800 border-gray-200 hover:border-green-300 hover:ring-2 hover:ring-green-200 hover:cursor-pointer",
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
          </div>

          {activeCategory !== "all" && (
            <div className="pt-6">
              <div className="rounded-2xl border bg-green-50 px-5 py-4">
                <p className="font-semibold text-green-900">
                  {formatCategoryLabel(activeCategory)}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  {categoryDescriptions[activeCategory] ||
                    "Explore services in this category."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="pb-16 pt-10 px-6 md:px-16 bg-white text-black">
        <div className="max-w-6xl mx-auto">
          {servicesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <h3 className="text-lg font-bold text-red-800">
                Unable to load services
              </h3>
              <p className="mt-2 text-red-700">{servicesError}</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 p-10 text-center">
              <h3 className="text-xl font-bold text-gray-900">No services found</h3>
              <p className="mt-2 text-gray-600">
                Try another category or contact us for a custom quote.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service.uuid}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        {formatCategoryLabel(service.category)}
                      </p>
                      <h3 className="text-xl font-bold mt-2 text-gray-900">
                        {service.label}
                      </h3>
                    </div>

                    {service.requires_images && (
                      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Photos helpful
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/contact?service=${encodeURIComponent(service.code)}`}
                      className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition"
                    >
                      Request Quote
                    </Link>

                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-5 py-2 rounded-lg border border-gray-200 text-gray-900 font-semibold hover:border-green-300 hover:text-green-700 transition"
                    >
                      Ask a Question
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6 md:px-16 bg-gray-50 text-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-10">
            How It Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Tell us what you need",
                desc: "Select a service and send a quick request—photos help.",
              },
              {
                step: "2",
                title: "We confirm the details",
                desc: "We’ll confirm scope, pricing, and notify you of the scheduled date and time.",
              },
              {
                step: "3",
                title: "We complete the job",
                desc: "Professional finish, clear communication, tidy cleanup.",
              },
            ].map((item) => (
              <div key={item.step} className="p-7 bg-white rounded-2xl border shadow-sm">
                <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <h4 className="mt-4 text-xl font-bold text-gray-900">{item.title}</h4>
                <p className="mt-2 text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 px-6 md:px-16 bg-green-50 text-black">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h3>
          <p className="text-lg md:text-xl text-gray-800 max-w-4xl mx-auto">
            Experienced, reliable, and committed to keeping your yard and property looking their best.
            We specialise in end-of-lease maintenance, garden care, and professional waste removal —
            ensuring every job is done right the first time.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {[
              { title: "Clear Pricing", desc: "Up-front quotes with scope explained." },
              { title: "Dependable", desc: "We arrive on time and communicate clearly." },
              { title: "Tidy Finish", desc: "We clean up and leave the place sharp." },
              { title: "Local Service", desc: "Focused on Hutt Valley and nearby areas." },
            ].map((x) => (
              <div key={x.title} className="p-6 rounded-2xl bg-white border shadow-sm">
                <p className="font-bold text-gray-900">{x.title}</p>
                <p className="mt-2 text-gray-700 text-sm">{x.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-900 text-white text-center">
        <h3 className="text-3xl md:text-4xl font-bold">Ready to get a quote?</h3>
        <p className="mt-4 text-white/80 text-lg">
          Tell us what you need and we’ll get back to you quickly.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/contact"
            className="px-7 py-4 rounded-xl bg-green-700 font-semibold hover:bg-green-800 transition shadow"
          >
            Request a Free Quote
          </Link>
          <a
            href="tel:+64000000000"
            className="px-7 py-4 rounded-xl border border-white/20 font-semibold hover:bg-white hover:text-gray-900 transition"
          >
            Call Now
          </a>
        </div>

        <p className="mt-6 text-sm text-white/60">
          Servicing Lower Hutt & Upper Hutt. Flexible scheduling available.
        </p>
      </section>
    </div>
  );
}