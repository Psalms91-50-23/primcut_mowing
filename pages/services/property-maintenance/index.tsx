import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function PropertyMaintenancePage() {
  return (
    <div className="bg-white text-black">
      <Head>
        <title>Property Maintenance | Happy Property</title>
        <meta
          name="description"
          content="Reliable property maintenance in the Hutt Valley. End-of-lease repairs, touch-ups, and tidy-ups for homeowners, landlords, and property managers."
        />
      </Head>

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div
          className="h-[420px] md:h-[520px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/property_maintenance.png')" }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-4xl text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold">
              Property Maintenance
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-100">
              Reliable maintenance and end-of-lease preparation for homeowners,
              landlords, and property managers across the Hutt Valley.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition font-semibold"
              >
                Request a Quote
              </Link>
              <a
                href="#included"
                className="bg-white/10 text-white px-6 py-3 rounded hover:bg-white/15 transition font-semibold"
              >
                What’s Included
              </a>
            </div>

            <div className="mt-6">
              <span className="inline-block bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
                Quoted after inspection or photos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <h2 id="included" className="text-2xl md:text-3xl font-bold mb-6">
              What We Can Help With
            </h2>

            <p className="text-lg md:text-xl mb-6">
              Property maintenance covers a wide range of work — so instead of
              guessing a price, we quote based on the scope, access, and time
              required. We keep it clear and simple: you’ll know what’s included
              before we start.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 border rounded shadow-sm">
                <h3 className="font-semibold text-xl mb-2">
                  End-of-Lease Touch-Ups
                </h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Minor repairs and tidy-ups</li>
                  <li>• Patch & paint touch-ups</li>
                  <li>• Basic fixes and finishing</li>
                  <li>• Get the property ready for the next tenant</li>
                </ul>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <h3 className="font-semibold text-xl mb-2">
                  General Maintenance
                </h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Small repairs and upkeep</li>
                  <li>• Door/gate adjustments</li>
                  <li>• Minor fix-ups around the home</li>
                  <li>• Property manager-friendly service</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              How Quoting Works
            </h2>

            <div className="space-y-4 text-lg md:text-xl text-gray-800">
              <p>
                <strong>1) Send details:</strong> Tell us what you need and
                include photos if possible.
              </p>
              <p>
                <strong>2) We confirm the scope:</strong> We’ll clarify what’s
                included, timeframes, and any options.
              </p>
              <p>
                <strong>3) You get a clear quote:</strong> Transparent pricing
                before we begin.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="p-6 border rounded shadow-sm bg-green-50">
              <h3 className="text-xl font-semibold mb-3">Best For</h3>
              <ul className="text-gray-800 space-y-2">
                <li>• Landlords & property managers</li>
                <li>• End-of-lease preparation</li>
                <li>• Homeowners needing repairs</li>
              </ul>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Areas We Service</h4>
                <p className="text-gray-700">
                  Hutt Valley suburbs including Lower Hutt and Upper Hutt.
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href="/contact"
                  className="block text-center bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition font-semibold"
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
                    For maintenance, pricing depends on the scope, so we quote
                    after inspection or photos.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Can you work with checklists?</p>
                  <p className="text-sm text-gray-700">
                    Yes — if you have a property manager/landlord checklist,
                    send it through.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Do I need to be home?</p>
                  <p className="text-sm text-gray-700">
                    Not always. We can arrange access and provide updates.
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
          Need a reliable team to maintain your property?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Send through the details (and photos if you have them) and we’ll get
          you a clear quote.
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