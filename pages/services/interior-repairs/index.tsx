import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Hammer,
  Home,
  Paintbrush2,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const highlights = [
  "Door, wall, and general interior repairs",
  "Minor carpentry and practical timber fixes",
  "Paint touch ups and sealant replacement",
  "Reliable repair work for homes and rentals",
];

const repairServices = [
  {
    title: "Door Repair",
    description:
      "Repair or adjustment of doors, hinges, handles, and latches.",
    icon: DoorIcon,
  },
  {
    title: "Interior Repairs",
    description: "General interior repairs and maintenance.",
    icon: Home,
  },
  {
    title: "Minor Carpentry",
    description: "Minor carpentry and timber repair work.",
    icon: Hammer,
  },
  {
    title: "Paint Touch Ups",
    description: "Minor paint touch-ups, patching, and surface refresh work.",
    icon: Paintbrush2,
  },
  {
    title: "Sealant Replacement",
    description:
      "Replacement of old or damaged silicone and sealants in kitchens, bathrooms, and wet areas.",
    icon: ShieldCheck,
  },
  {
    title: "Wall Repairs",
    description: "Wall patching, plastering, and repair work.",
    icon: Wrench,
  },
];

const includedItems = [
  "Practical interior repair work for common household issues",
  "Suitable for owner-occupied homes, rentals, and maintenance jobs",
  "Helpful for wear and tear, small damage, and presentation improvements",
  "Quoted based on the scope, access, and work required",
];

const whyChooseUs = [
  "Ideal for getting small interior issues fixed properly",
  "Good fit for landlords, homeowners, and rental upkeep",
  "Straightforward quoting and clear communication",
  "Practical, tidy work focused on real maintenance needs",
];

const faqs = [
  {
    question: "Do I need to send photos for interior repair quotes?",
    answer:
      "Photos can help speed up quoting, but they are not always required for interior repair jobs based on your current service setup.",
  },
  {
    question: "Can multiple small repairs be done in one visit?",
    answer:
      "Yes, bundling a few smaller interior jobs together is often a practical option depending on the work involved.",
  },
  {
    question: "Is this suitable for rental property maintenance?",
    answer:
      "Yes. Interior repair work is well suited to rental maintenance, pre-tenancy tidy-ups, and general upkeep between occupants.",
  },
];

function DoorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 21V4.8a1 1 0 0 1 .76-.97l8-1.8A1 1 0 0 1 16 3v18" />
      <path d="M6 21h12" />
      <circle cx="13" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function InteriorRepairsPage() {
  return (
    <>
      <Head>
        <title>
          Interior Repairs Lower Hutt & Upper Hutt | Happy Property
        </title>
        <meta
          name="description"
          content="Interior repairs in Lower Hutt and Upper Hutt, including door repairs, wall repairs, minor carpentry, paint touch ups, and sealant replacement."
        />

        <meta
          property="og:title"
          content="Interior Repairs in Lower Hutt & Upper Hutt | Happy Property"
        />
        <meta
          property="og:description"
          content="Practical interior repair work for homes and rentals, including doors, walls, carpentry, paint touch ups, and sealant replacement."
        />
        <meta
          property="og:url"
          content="https://happyproperty.co.nz/services/interior-repairs"
        />
        <meta
          property="og:image"
          content="https://happyproperty.co.nz/images/interior-repairs.jpg"
        />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Interior Repairs in Lower Hutt & Upper Hutt | Happy Property"
        />
        <meta
          name="twitter:description"
          content="Reliable interior repairs for homes and rentals across Lower Hutt and Upper Hutt."
        />
        <meta
          name="twitter:image"
          content="https://happyproperty.co.nz/images/interior-repairs.jpg"
        />
      </Head>

      <main className="bg-white text-slate-900">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-black group">
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <img
              src="/images/interior_touchup.png"
              alt="Interior repairs service"
              className="h-full w-full object-contain transition duration-700 group-hover:scale-105"
            />
          </div>

          <div className="absolute inset-0 bg-black/60 transition duration-500 group-hover:bg-black/35" />

          <div className="relative mx-auto flex min-h-[540px] max-w-7xl items-center px-6 py-16 sm:min-h-[620px] sm:px-8 lg:px-12">
            <div className="max-w-3xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <Wrench className="h-4 w-4" />
                Interior Repair Services
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Interior repairs that keep your property practical and presentable
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                Straightforward interior repair work for common maintenance needs,
                wear and tear, and small repair jobs around the home. Suitable
                for owner-occupied properties, rentals, and ongoing upkeep.
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
              Interior Repair Services
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Current services in this category
            </h2>
          <p className="mt-3 leading-7 text-slate-700">
            Send through the job details and any useful photos if you have
            them. Photos can help, but they are not required for this
            service category based on your current setup.
        </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {repairServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="inline-flex rounded-2xl bg-slate-100 p-3">
                    <Icon className="h-5 w-5 text-slate-800" />
                  </div>

                  <h3 className="mt-4 text-xl font-semibold">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                </div>
              );
            })}
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
                Practical help for common interior repair jobs
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
                  Interior work handled with a maintenance-first approach
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

              <div className="mt-14">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  FAQs
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Common questions
                </h2>

                <div className="mt-8 space-y-5">
                  {faqs.map((faq) => (
                    <div
                      key={faq.question}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <p className="text-lg font-semibold text-slate-900">
                        {faq.question}
                      </p>
                      <p className="mt-3 leading-7 text-slate-700">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Quick Quote</h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                    This page reflects your current interior repairs category, covering
                    general repair work, minor carpentry, touch-up work, and common
                    maintenance jobs inside the home.
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
                  General home upkeep, rental maintenance, pre-tenant touch-ups,
                  and fixing smaller issues before they turn into bigger ones.
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
              Need interior repairs sorted out?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-700">
              Get help with practical interior repair work for homes, rentals,
              and ongoing maintenance needs.
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