import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function LawnMowingPage() {
  return (
    <div className="bg-white text-black">
      <Head>
        <title>Lawn Mowing | Happy Property</title>
        <meta
          name="description"
          content="Professional lawn mowing in the Hutt Valley. From $60 for lawns under 500m². Pricing depends on terrain, grass length and access."
        />
      </Head>

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div
          className="h-[420px] md:h-[520px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/lawn_mowing.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-4xl text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold">Lawn Mowing</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-100">
              Fast, tidy, and consistent mowing to keep your section looking
              sharp all year round.
            </p>

            <div className="mt-6">
              <span className="inline-block bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
                From $60 (lawns under 500m²)
              </span>
              <p className="text-sm text-gray-200 mt-2">
                Final price depends on terrain, grass length, access, and overall
                condition.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition font-semibold"
              >
                Get a Free Quote
              </Link>
              <a
                href="#included"
                className="bg-white/10 text-white px-6 py-3 rounded hover:bg-white/15 transition font-semibold"
              >
                What’s Included
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <h2 id="included" className="text-2xl md:text-3xl font-bold mb-6">
              What’s Included
            </h2>

            <div className="p-6 border rounded shadow-sm">
              <ul className="text-gray-800 space-y-2 text-lg">
                <li>• Professional mow for a clean, even finish</li>
                <li>• Edges along paths/driveways (where applicable)</li>
                <li>• Blow down hard surfaces for a tidy result</li>
                <li>• Optional: ongoing scheduled maintenance</li>
              </ul>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              Pricing Guide
            </h2>

            <div className="p-6 border rounded shadow-sm bg-green-50">
              <p className="text-lg md:text-xl font-semibold">
                From $60 for lawns under 500m²
              </p>
              <p className="text-gray-700 mt-2">
                Pricing varies based on:
              </p>
              <ul className="text-gray-800 mt-3 space-y-2">
                <li>• Grass height and thickness</li>
                <li>• Slopes/terrain and obstacles</li>
                <li>• Access (gates, stairs, tight areas)</li>
                <li>• Green waste/clippings requirements (if applicable)</li>
              </ul>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              FAQs
            </h2>

            <div className="space-y-5">
              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">How often should I mow?</p>
                <p className="text-gray-700 mt-2">
                  Most lawns do well with mowing every 1–2 weeks in peak growth
                  seasons, and less often in colder months.
                </p>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">
                  Do I need to be home during the mow?
                </p>
                <p className="text-gray-700 mt-2">
                  Not usually — as long as we have access to the lawn and any
                  instructions, we can take care of it.
                </p>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">
                  Can you do regular bookings?
                </p>
                <p className="text-gray-700 mt-2">
                  Yes. Regular clients get consistent scheduling and easier
                  upkeep.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="p-6 border rounded shadow-sm bg-green-50">
              <h3 className="text-xl font-semibold mb-3">Quick Quote</h3>
              <p className="text-gray-800">
                Send your address and a quick photo of the lawn (optional) and
                we’ll respond with a quote.
              </p>

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
              <h3 className="text-xl font-semibold mb-3">Areas We Cover</h3>
              <p className="text-gray-700">
                Hutt Valley suburbs including Lower Hutt and Upper Hutt.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6 md:px-16 bg-green-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Want your lawn looking sharp again?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Book a one-off mow or set up a regular schedule — we’ll keep it tidy.
        </p>
        <Link
          href="/contact"
          className="bg-green-700 text-white px-8 py-3 rounded hover:bg-green-800 transition font-semibold"
        >
          Get a Free Quote
        </Link>
      </section>
    </div>
  );
}