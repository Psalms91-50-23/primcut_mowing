import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function PropertyMaintenancePage() {
  const includedWork = [
    "End-of-lease fix-ups and presentation work",
    "General handyman repairs and practical maintenance jobs",
    "Minor carpentry and small repair work",
    "Door, gate, and basic hardware adjustments",
    "Wall patching, touch-ups, and tidy-ups",
    "Minor fitting jobs",
    "Exterior upkeep and repair-focused maintenance",
    "Landlord and property manager maintenance requests",

  ];

  const bestFor = [
    "Homeowners wanting practical repair and upkeep work done properly",
    "Landlords preparing properties between tenancies",
    "Property managers needing dependable maintenance support",
    "Clients with a list of smaller jobs that need one reliable point of contact",
  ];

  const whyChoose = [
    {
      title: "LBP Licensed Building Practitioner",
      desc: "A strong point of difference for repair-focused property maintenance, practical building-related jobs, and professional workmanship.",
      icon: "✅",
    },
    {
      title: "Clear Scope & Quoting",
      desc: "Maintenance work can vary a lot, so we keep quoting clear and practical based on photos, access, and the actual work required.",
      icon: "📋",
    },
    {
      title: "Reliable Property Upkeep",
      desc: "From one-off repairs to ongoing maintenance needs, the focus is on dependable service, tidy results, and good communication.",
      icon: "🏠",
    },
  ];

  return (
    <div className="bg-white text-black">
      <Head>
        <title>Property Maintenance | Happy Property</title>
        <meta
          name="description"
          content="LBP Licensed Building Practitioner offering property maintenance, repair work, landlord maintenance, end-of-lease fix-ups, and practical upkeep services across the Hutt Valley."
        />
        <meta property="og:title" content="Property Maintenance | Happy Property" />
        <meta
          property="og:description"
          content="LBP Licensed Building Practitioner for property maintenance, repairs, landlord work, and practical upkeep across the Hutt Valley."
        />
        <meta
          property="og:image"
          content="https://happyproperty.co.nz/images/og/property-maintenance-preview.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:url"
          content="https://happyproperty.co.nz/services/property-maintenance"
        />
        <meta property="og:type" content="website" />
      </Head>

      {/* Hero */}
      <section className="relative w-full group">
        {/* IMAGE */}
        <div className="relative min-h-[460px] md:min-h-[560px] bg-black overflow-hidden">
          <img
            src="/images/scaffolding_exterior_maintenance.png"
            alt="Property maintenance"
            className="absolute inset-0 w-full h-full object-cover md:object-contain transition-transform duration-700 group-hover:scale-105"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/60 transition duration-500 group-hover:bg-black/30" />

          {/* CONTENT */}
          <div className="relative z-10 flex min-h-[460px] md:min-h-[560px] flex-col justify-center items-center text-center px-6 py-16 text-white">
            
            <div className="inline-block bg-white/10 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
              LBP Licensed Building Practitioner
            </div>

            <h1 className="mt-5 text-3xl md:text-5xl font-bold max-w-5xl">
              Property Maintenance That Protects Presentation, Function & Value
            </h1>

            <p className="mt-4 text-lg md:text-xl max-w-3xl">
              Practical repair and upkeep services across the Hutt Valley.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="bg-green-700 px-6 py-3 rounded font-semibold hover:bg-green-800"
              >
                Request a Quote
              </Link>

              <a
                href="#included"
                className="bg-white/10 px-6 py-3 rounded font-semibold hover:bg-white/20 transition"
              >
                What’s Included
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Intro / Value */}
      <section className="py-16 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-5">
            Practical Property Maintenance, Not Vague Handyman Promises
          </h2>

          <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
            Property maintenance can cover a lot of ground, which is why this service
            is built around real-world upkeep needs rather than one-size-fits-all pricing.
            Some jobs are straightforward. Others need inspection, photos, or a clearer
            breakdown of scope. The goal is simple — practical maintenance work carried
            out properly, with a quote that reflects the actual job.
          </p>

          <p className="mt-5 text-lg md:text-xl text-gray-800 leading-relaxed">
            With an LBP Licensed Building Practitioner background, Happy Property is
            positioned strongly for repair-focused maintenance and building-related
            practical work where workmanship, care, and reliability matter.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-16 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <h2 id="included" className="text-2xl md:text-3xl font-bold mb-6">
              What We Can Help With
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 border rounded shadow-sm">
                <h3 className="font-semibold text-xl mb-3">
                  Repairs & General Upkeep
                </h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Small repair jobs around the home</li>
                  <li>• Minor carpentry and practical fix-ups</li>
                  <li>• Door, gate, and hardware adjustments</li>
                  <li>• Tidy maintenance work that helps prevent bigger issues later</li>
                </ul>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <h3 className="font-semibold text-xl mb-3">
                  Landlord & Tenancy Work
                </h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• End-of-lease touch-ups and presentation work</li>
                  <li>• Minor repairs before new tenants move in</li>
                  <li>• Checklist-based maintenance requests</li>
                  <li>• Practical support for rental property upkeep</li>
                </ul>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <h3 className="font-semibold text-xl mb-3">
                  Interior Fix-Ups
                </h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Wall patching and minor repair prep</li>
                  <li>• Paint touch-ups where suitable</li>
                  <li>• Fixture replacement and small install jobs</li>
                  <li>• Tidy finishing work to improve presentation</li>
                </ul>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <h3 className="font-semibold text-xl mb-3">
                  Exterior-Oriented Maintenance
                </h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Practical outdoor maintenance support</li>
                  <li>• Fence, gate, and minor exterior repair work</li>
                  <li>• Jobs that overlap with wider exterior upkeep needs</li>
                  <li>• Clear assessment of what’s suitable for this service</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              Included Work Examples
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {includedWork.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border bg-gray-50 px-5 py-4 text-gray-800"
                >
                  {item}
                </div>
              ))}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              How Quoting Works
            </h2>

            <div className="space-y-4 text-lg md:text-xl text-gray-800">
              <p>
                <strong>1) Send details or photos:</strong> Tell us what needs doing.
                Photos are often the fastest way to assess maintenance work.
              </p>
              <p>
                <strong>2) We confirm the scope:</strong> We’ll review the job, clarify
                access, confirm what’s included, and let you know if anything needs a
                site visit.
              </p>
              <p>
                <strong>3) You receive a clear quote:</strong> Straightforward pricing
                based on the actual work required, not guesswork.
              </p>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              Why Clients Use This Service
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {whyChoose.map((item) => (
                <div key={item.title} className="p-6 border rounded shadow-sm">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="p-6 border rounded shadow-sm bg-green-50">
              <h3 className="text-xl font-semibold mb-3">Best For</h3>
              <ul className="text-gray-800 space-y-3">
                {bestFor.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Areas We Service</h4>
                <p className="text-gray-700">
                  Hutt Valley suburbs including Lower Hutt and Upper Hutt.
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Good To Know</h4>
                <p className="text-gray-700">
                  Some maintenance jobs can be quoted from photos, while others may
                  need a quick inspection depending on scope and access.
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href="/contact"
                  className="block text-center bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition font-semibold hover:cursor-pointer"
                >
                  Get a Quote
                </Link>
              </div>
            </div>

            <div className="p-6 border rounded shadow-sm mt-6">
              <h3 className="text-xl font-semibold mb-3">FAQs</h3>
              <div className="space-y-4 text-gray-800">
                <div>
                  <p className="font-semibold">Do you give fixed prices?</p>
                  <p className="text-sm text-gray-700">
                    Sometimes, but many maintenance jobs vary by scope, access, and
                    condition, so quoting is usually based on photos or inspection.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Can you work from a checklist?</p>
                  <p className="text-sm text-gray-700">
                    Yes. If you’re a landlord or property manager with a list of items,
                    send it through and we can review it with the job details.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">
                    Is this only for end-of-lease work?
                  </p>
                  <p className="text-sm text-gray-700">
                    No. End-of-lease jobs are one common use case, but this service is
                    also suited to general upkeep, repairs, and practical property
                    maintenance.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Do I need to be home?</p>
                  <p className="text-sm text-gray-700">
                    Not always. Access can often be arranged in advance, especially for
                    landlords and managed properties.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6 md:px-16 bg-green-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Need reliable property maintenance without the runaround?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Send through the details and any photos you have, and we’ll provide a
          clear quote for the work required.
        </p>
        <Link
          href="/contact"
          className="bg-green-700 text-white px-8 py-3 rounded hover:bg-green-800 transition font-semibold"
        >
          Request a Quote
        </Link>
      </section>
    </div>
  );
}