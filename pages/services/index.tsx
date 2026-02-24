import React, { useMemo, useState } from "react";
import Link from "next/link";
import ServiceCard from "../../components/ServiceCard";
import { data } from "@/data/information";
import { useAuth } from "../../context/AuthContext";

type Props = {};

type Category = "All" | "Maintenance" | "Lawns" | "Weeds" | "Removal";

export default function ServicePage(props: Props) {
  const { loading } = useAuth();

  // Optional: if auth isn't required for this page, you can remove the loader entirely.
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 text-base font-medium">Loading services...</p>
      </div>
    );
  }

  // ---- Category mapping by slug (simple + reliable) ----
  const categoryForSlug = (slug?: string): Category => {
    if (!slug) return "All";
    if (slug.includes("property-maintenance")) return "Maintenance";
    if (slug.includes("lawn-mowing")) return "Lawns";
    if (slug.includes("weed")) return "Weeds";
    if (slug.includes("junk") || slug.includes("removal")) return "Removal";
    return "All";
  };

  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const categories: Category[] = ["All", "Maintenance", "Lawns", "Weeds", "Removal"];

  const services = useMemo(() => {
    const all = data.services || [];
    if (activeCategory === "All") return all;
    return all.filter((s) => categoryForSlug(s.slug) === activeCategory);
  }, [activeCategory]);

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-6 md:px-16 py-14 md:py-20">
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
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-8 border-b">
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Our Services
              </h2>
              <p className="text-gray-600 mt-1">
                Click a service to view details, pricing notes, and request a quote.
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
                        : "bg-white text-gray-800 border-gray-200 hover:border-green-300 hover:ring-2 hover:ring-green-200",
                    ].join(" ")}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="pb-16 pt-10 px-6 md:px-16 bg-white text-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.slug ?? index}
                slug={service.slug}
                imgSrc={service.imgSrc}
                title={service.title}
                descriptionHook={service.descriptionHook}
                description={service.description}
                priceLabel={service.priceLabel}
                priceNote={service.priceNote}
              />
            ))}
          </div>
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
                desc: "We’ll confirm scope, pricing, and a time that suits you.",
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