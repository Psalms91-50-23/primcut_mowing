import React from "react";
import Head from "next/head";
import Link from "next/link";
import { CheckCircle2, Clock3, Scissors, ShieldCheck, Sparkles } from "lucide-react";

const highlights = [
  "Clean and consistent lawn mowing",
  "Edges trimmed for a tidier finish",
  "One-off or ongoing maintenance",
  "Reliable service across the Hutt Valley",
];

const includedItems = [
  "Professional mow for a clean, even finish",
  "Edging along paths, borders, and driveways where applicable",
  "Blow down of hard surfaces for a tidier result",
  "Suitable for one-off jobs or ongoing lawn care",
];

const pricingFactors = [
  "Grass height and thickness",
  "Slopes, terrain, and obstacles",
  "Access to the area",
  "Overall lawn condition and size",
];

const faqs = [
  {
    question: "How often should I mow?",
    answer:
      "Most lawns are best maintained every 1–2 weeks during peak growing seasons, with less frequent mowing in colder months.",
  },
  {
    question: "Do I need to be home during the mow?",
    answer:
      "Not usually. As long as access is available and any instructions are clear, the lawn can be taken care of without you being home.",
  },
  {
    question: "Can I book regular lawn mowing?",
    answer:
      "Yes. Regular lawn mowing helps keep the property tidy and makes upkeep easier over time.",
  },
];

export default function LawnMowingPage() {
  return (
    <div className="bg-white text-slate-900">
      <Head>
        <title>Lawn Mowing | Happy Property</title>
        <meta
          name="description"
          content="Professional lawn mowing in the Hutt Valley. Clean, tidy, and reliable lawn care for one-off jobs or regular maintenance."
        />

        <meta
          property="og:title"
          content="Lawn Mowing in Lower Hutt & Upper Hutt | Reliable & Tidy Lawn Care"
        />
        <meta
          property="og:description"
          content="Professional lawn mowing in the Hutt Valley for homes, rentals, and regular upkeep."
        />
        <meta
          property="og:url"
          content="https://happyproperty.co.nz/lawn-mowing"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="/images/lawn-mowing_preview.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Lawn Mowing in Lower Hutt & Upper Hutt | Happy Property"
        />
        <meta
          name="twitter:description"
          content="Clean, tidy, and reliable lawn mowing across the Hutt Valley."
        />
        <meta
          name="twitter:image"
          content="/images/lawn-mowing_preview.png"
        />
      </Head>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/lawn_mowing.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-6 py-16 sm:min-h-[620px] sm:px-8 lg:px-12">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Lawn Care Service
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Lawn mowing that keeps your property looking tidy
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
              Reliable lawn mowing for homes, rentals, and regular property
              upkeep. Clean cuts, tidy edges, and an easy service you can book
              as needed or on a recurring basis.
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
              </Link>

              <a
                href="#included"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
              >
                What’s Included
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
          <div>
            <div id="included" className="scroll-mt-24">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                What’s Included
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                A tidy, straightforward lawn mowing service
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
            </div>

            <div className="mt-14">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Pricing
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Simple pricing guide
              </h2>

              <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
                <p className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  From $70 for lawns under 500m²
                </p>
                <p className="mt-3 text-slate-700">
                  Final pricing depends on the property and mowing conditions.
                </p>

                <div className="mt-5 grid gap-3">
                  {pricingFactors.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Scissors className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
                      <p className="text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
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

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-xl font-semibold">Quick Quote</h3>
              <p className="mt-3 leading-7 text-slate-700">
                Send through your address and a short description of the lawn.
                A photo can help, but it is not required.
              </p>

              <Link
                href="/contact"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
              >
                Get a Quote
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                <div>
                  <h3 className="text-lg font-semibold">Booking Options</h3>
                  <p className="mt-2 leading-7 text-slate-700">
                    Available for one-off mowing or regular maintenance
                    schedules.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                <div>
                  <h3 className="text-lg font-semibold">Areas We Cover</h3>
                  <p className="mt-2 leading-7 text-slate-700">
                    Hutt Valley suburbs including Lower Hutt and Upper Hutt.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-green-50">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 lg:px-12 lg:py-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Want your lawn looking tidy again?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-700">
            Book a one-off mow or set up regular lawn maintenance to keep your
            property looking sharp.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-green-700 px-8 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            Get a Free Quote
          </Link>
        </div>
      </section>
    </div>
  );
}