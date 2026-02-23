import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function WeedSprayingPage() {
  return (
    <div className="bg-white text-black">
      <Head>
        <title>Weed Spraying | Happy Property</title>
        <meta
          name="description"
          content="Weed spraying across the Hutt Valley. Effective weed control to keep lawns and gardens tidy. Quote depends on area size and weed type."
        />
      </Head>

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div
          className="h-[420px] md:h-[520px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/weed_spraying.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-4xl text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold">Weed Spraying</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-100">
              Targeted weed control to keep your lawn and garden looking clean
              and well maintained.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition font-semibold"
              >
                Get a Quote
              </Link>
              <a
                href="#included"
                className="bg-white/10 text-white px-6 py-3 rounded hover:bg-white/15 transition font-semibold"
              >
                What’s Included
              </a>
            </div>

            <p className="text-sm text-gray-200 mt-4">
              Pricing depends on area size, weed type, and access.
            </p>
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
                <li>• Weed assessment (lawn/garden/paths)</li>
                <li>• Targeted treatment plan based on your weeds</li>
                <li>• Advice on after-care and follow-up timing</li>
                <li>• Optional: ongoing weed control schedule</li>
              </ul>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              What Affects Pricing
            </h2>

            <div className="p-6 border rounded shadow-sm bg-green-50">
              <ul className="text-gray-800 space-y-2 text-lg">
                <li>• Size of the area to be treated</li>
                <li>• Weed type and severity</li>
                <li>• Access and obstacles</li>
                <li>• Whether it’s spot treatment or broad coverage</li>
              </ul>
              <p className="text-gray-700 mt-4 text-sm">
                Note: We’ll provide any required safety/after-care guidance
                relevant to the products and application used.
              </p>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              FAQs
            </h2>

            <div className="space-y-5">
              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">
                  Is it safe for pets and children?
                </p>
                <p className="text-gray-700 mt-2">
                  We’ll provide clear instructions on re-entry times and any
                  precautions needed after treatment.
                </p>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">
                  How long does it take to work?
                </p>
                <p className="text-gray-700 mt-2">
                  Results vary by weed type and conditions. We’ll advise what to
                  expect and whether a follow-up treatment is recommended.
                </p>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">
                  Do you spray paths/driveways too?
                </p>
                <p className="text-gray-700 mt-2">
                  Yes — we can treat edges, paths, and problem areas depending
                  on your needs.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="p-6 border rounded shadow-sm bg-green-50">
              <h3 className="text-xl font-semibold mb-3">Quick Quote</h3>
              <p className="text-gray-800">
                Send a photo of the weeds/area and we’ll respond with the best
                approach and pricing.
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
          Want weeds gone the right way?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          We’ll assess the area and recommend the most effective approach.
        </p>
        <Link
          href="/contact"
          className="bg-green-700 text-white px-8 py-3 rounded hover:bg-green-800 transition font-semibold"
        >
          Get a Quote
        </Link>
      </section>
    </div>
  );
}