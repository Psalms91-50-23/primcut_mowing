import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function JunkRemovalPage() {
  return (
    <div className="bg-white text-black">
      <Head>
        <title>Junk & Furniture Removal | Happy Property</title>
        <meta
          name="description"
          content="Junk and furniture removal in the Hutt Valley. Old furniture, garden waste, and unwanted items collected and disposed of responsibly. Pricing depends on load size and disposal requirements."
        />
      </Head>

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div
          className="h-[420px] md:h-[520px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/rubbish_collecting.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-4xl text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold">
              Junk & Furniture Removal
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-100">
              Fast removal of unwanted items to keep your property clean,
              clutter-free, and ready for what’s next.
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
                What We Remove
              </a>
            </div>

            <p className="text-sm text-gray-200 mt-4">
              Pricing depends on load size, access, and disposal requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <h2 id="included" className="text-2xl md:text-3xl font-bold mb-6">
              What We Remove
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 border rounded shadow-sm">
                <h3 className="font-semibold text-xl mb-2">Household Items</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Old furniture</li>
                  <li>• General junk/clutter</li>
                  <li>• End-of-lease leftovers</li>
                  <li>• Garage/storage clean-outs</li>
                </ul>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <h3 className="font-semibold text-xl mb-2">Outdoor & Garden</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Green waste (where applicable)</li>
                  <li>• Branches, debris, general tidy-up</li>
                  <li>• Post-maintenance clean-up</li>
                  <li>• Renovation/cleanup leftovers</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              How Pricing Works
            </h2>

            <div className="p-6 border rounded shadow-sm bg-green-50">
              <ul className="text-gray-800 space-y-2 text-lg">
                <li>• Load size (how much needs removing)</li>
                <li>• Access (stairs, distance, tight entry)</li>
                <li>• Item type (some items require special disposal)</li>
                <li>• Time required for lifting/loading</li>
              </ul>

              <p className="text-gray-700 mt-4 text-sm">
                Tip: Send a couple of photos for a fast, accurate quote.
              </p>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
              FAQs
            </h2>

            <div className="space-y-5">
              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">Do you remove furniture?</p>
                <p className="text-gray-700 mt-2">
                  Yes — we can remove old furniture and unwanted household items.
                </p>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">
                  Can you do end-of-lease clean-outs?
                </p>
                <p className="text-gray-700 mt-2">
                  Yes — we can remove leftover items and help get the property
                  ready for handover.
                </p>
              </div>

              <div className="p-6 border rounded shadow-sm">
                <p className="font-semibold text-lg">
                  Do you handle disposal?
                </p>
                <p className="text-gray-700 mt-2">
                  Yes — we remove items and dispose of them responsibly, based
                  on what’s being collected.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="p-6 border rounded shadow-sm bg-green-50">
              <h3 className="text-xl font-semibold mb-3">Fast Quote</h3>
              <p className="text-gray-800">
                Send photos of the items and we’ll confirm pricing based on load
                size and disposal needs.
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
          Ready to clear out the clutter?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Send photos and we’ll get back to you with a clear quote.
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