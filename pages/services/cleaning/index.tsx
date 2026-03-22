import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  CheckCircle2,
  Droplets,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const highlights = [
  "Deck cleaning for timber outdoor areas",
  "Driveway and path surface cleaning",
  "Photos required for accurate quoting",
  "Reliable exterior cleaning for homes and rentals",
];

const cleaningServices = [
  {
    title: "Deck Cleaning",
    description:
      "Cleaning of decks, patios, and outdoor timber surfaces to improve presentation and remove built-up dirt and grime.",
  },
  {
    title: "Driveway Cleaning",
    description:
      "Cleaning of driveways, paths, and paved outdoor areas for a tidier and better-presented exterior.",
  },
];

const includedItems = [
  "Exterior surface cleaning for selected outdoor areas",
  "Deck and hard-surface cleaning based on site condition",
  "Ideal for residential properties and rental tidy-ups",
  "Quoted based on photos and visible surface condition",
];

const whyChooseUs = [
  "Helps improve street appeal and presentation",
  "Great for pre-sale, rental, and general property upkeep",
  "Clear quoting process using submitted photos",
  "Simple, reliable service with practical results",
];

export default function CleaningPage() {
  return (
    <>
      <Head>
        <title>Cleaning Services Lower Hutt & Upper Hutt | Happy Property</title>
        <meta
          name="description"
          content="Exterior cleaning services in Lower Hutt and Upper Hutt, including deck cleaning and driveway cleaning. Reliable service for homes and rentals."
        />

        <meta
          property="og:title"
          content="Cleaning Services in Lower Hutt & Upper Hutt | Happy Property"
        />
        <meta
          property="og:description"
          content="Deck cleaning and driveway cleaning for homes and rentals across Lower Hutt and Upper Hutt."
        />
        <meta
          property="og:url"
          content="https://happyproperty.co.nz/cleaning"
        />
        <meta
          property="og:image"
          content="https://happyproperty.co.nz/images/cleaning.jpg"
        />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Cleaning Services in Lower Hutt & Upper Hutt | Happy Property"
        />
        <meta
          name="twitter:description"
          content="Deck cleaning and driveway cleaning for tidy, better-presented outdoor spaces."
        />
        <meta
          name="twitter:image"
          content="https://happyproperty.co.nz/images/cleaning.jpg"
        />
      </Head>

      <main className="bg-white text-slate-900">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-black group">
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <img
                src="/images/drive-way-clean.png"
                alt="Exterior cleaning services"
                className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-700"
                />
            </div>

            <div className="absolute inset-0 bg-black/60 transition duration-500 group-hover:bg-black/40" />

            <div className="relative mx-auto flex min-h-[540px] max-w-7xl items-center px-6 py-16 sm:min-h-[620px] sm:px-8 lg:px-12">
                <div className="max-w-3xl text-white">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" />
                    Exterior Cleaning Services
                </div>

                <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                    Exterior cleaning that keeps outdoor areas looking tidy
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                    Practical exterior cleaning services for decks, driveways, and
                    outdoor surfaces. Ideal for homes, rentals, and general property
                    presentation.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    {highlights.map((item) => (
                    <span
                        key={item}
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 backdrop-blur-sm"
                    >
                        {item}
                    </span>
                    ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
                    >
                    Get a Free Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>

                    <a
                    href="#services"
                    className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
                    >
                    View Services
                    </a>
                </div>
                </div>
            </div>
        </section>

        {/* Services */}
        <section
          id="services"
          className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Cleaning Services
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Current services in this category
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              This page matches your current cleaning category, which includes
              deck cleaning and driveway cleaning. Quotes for these services
              should request photos first.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {cleaningServices.map((service) => (
              <div
                key={service.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="inline-flex rounded-2xl bg-slate-100 p-3">
                  <Droplets className="h-5 w-5 text-slate-800" />
                </div>

                <h3 className="mt-4 text-xl font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>

                <div className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Photos required for quoting
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Included + Sidebar */}
        <section className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-12 lg:pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                What’s Included
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Straightforward exterior cleaning service
              </h2>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4">
                  {includedItems.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
                      <p className="text-base text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-14">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Why Choose Happy Property
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Cleaning that supports property presentation
                </h2>

                <div className="mt-8 grid gap-4">
                  {whyChooseUs.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-800" />
                      <p className="text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Quote Requirements</h3>
                <p className="mt-3 leading-7 text-slate-700">
                  For cleaning jobs, send through clear photos of the area so
                  the condition and scope can be assessed properly before
                  quoting.
                </p>

                <Link
                  href="/contact"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
                >
                  Request a Quote
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Best For</h3>
                <p className="mt-3 leading-7 text-slate-700">
                  Rental tidy-ups, pre-sale presentation, regular exterior
                  upkeep, and improving the look of outdoor spaces.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Areas Covered</h3>
                <p className="mt-3 leading-7 text-slate-700">
                  Lower Hutt, Upper Hutt, and surrounding Wellington region
                  service areas.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-50">
          <div className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 lg:px-12 lg:py-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Need outdoor areas cleaned up?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-700">
              Send photos through for a quick quote on deck cleaning or driveway
              cleaning.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-green-700 px-8 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              Get a Free Quote
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}