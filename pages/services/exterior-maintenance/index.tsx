import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Hammer,
  Home,
  Paintbrush2,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

const serviceItems = [
  {
    title: "Exterior Repairs",
    description:
      "Minor exterior repairs, tidy-ups, timber fixes, cladding touch-ups, and practical maintenance to keep your property looking sharp and protected.",
    icon: Wrench,
  },
  {
    title: "Property Maintenance",
    description:
      "Reliable upkeep for rentals, owner-occupied homes, and investment properties with a focus on presentation, durability, and preventative care.",
    icon: Home,
  },
  {
    title: "Exterior Painting Prep",
    description:
      "Preparation work including cleaning, scraping, sanding, and repair-ready surface prep to help exterior finishes last longer and look better.",
    icon: Paintbrush2,
  },
  {
    title: "Decks, Fences & Outdoor Areas",
    description:
      "Maintenance and improvement work for decks, fences, gates, and other outdoor features to improve street appeal and usability.",
    icon: Hammer,
  },
];

const benefits = [
  "LBP-backed workmanship and practical building knowledge",
  "Ideal for rental properties, family homes, and exterior tidy-ups",
  "Helps prevent small exterior issues becoming costly repairs",
  "Clean, professional presentation that improves street appeal",
  "Clear communication and reliable job follow-through",
  "Suitable for one-off work or ongoing maintenance needs",
];

const areas = [
  "Lower Hutt",
  "Upper Hutt",
  "Wellington",
  "Petone",
  "Alicetown",
  "Avalon",
  "Epuni",
  "Fairfield",
  "Wainuiomata",
  "Eastbourne",
];

export default function ExteriorMaintenancePage() {
  return (
    <>
      <Head>
        <title>Exterior Maintenance | Happy Property</title>
        <meta
          name="description"
          content="Exterior maintenance, repairs, upkeep, and practical property improvement work for homes, rentals, and outdoor spaces."
        />
      </Head>

      <main className="bg-white text-slate-900">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_left,rgba(255,255,255,0.06),transparent_28%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full font-semibold border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                  <ShieldCheck className="h-4 w-4" />
                  LBP Qualified Exterior Property Work
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Exterior maintenance that keeps your property looking good and
                  holding up well
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                  From general exterior upkeep to repairs and outdoor improvement
                  work, Happy Property helps keep homes and rental properties
                  tidy, presentable, and better protected from wear and weather.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Request a Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>

                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    View All Services
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
                      <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">Street Appeal</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Clean, well-maintained exteriors help your property make
                        a stronger first impression.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-sm">
                      <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">Preventative Care</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Regular maintenance helps catch smaller issues before
                        they grow into bigger repairs.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-sm sm:col-span-2">
                      <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2">
                        <Hammer className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold">
                        Backed by LBP building experience
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Licensed Building Practitioner experience adds extra
                        confidence when your property needs practical exterior
                        work carried out properly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Exterior Services
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Practical exterior work for homes and rentals
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Whether you need a tidy-up, repair work, or ongoing exterior
              maintenance, these services are built around keeping the outside of
              your property in good condition.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {serviceItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="inline-flex rounded-2xl bg-slate-100 p-3">
                    <Icon className="h-5 w-5 text-slate-800" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Why Happy Property
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                A stronger selling point for exterior maintenance
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Your LBP qualification helps set you apart. It shows clients
                they are dealing with someone who understands building work, not
                just surface-level maintenance.
              </p>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                  LBP advantage for customers
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  For landlords, homeowners, and property managers, that means
                  more confidence in the quality of repairs, better judgement on
                  exterior issues, and a more professional standard overall.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-900" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Simple Process
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Easy to get started
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Send through your job details",
                text: "Tell us what exterior work you need done and include photos if available.",
              },
              {
                step: "02",
                title: "We assess and quote",
                text: "We review the scope and provide a clear quote for the work required.",
              },
              {
                step: "03",
                title: "Work gets completed professionally",
                text: "The job is carried out with a focus on quality, presentation, and practical results.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="text-sm font-semibold text-slate-400">
                  {item.step}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Areas */}
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Service Areas
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Exterior maintenance across the Hutt Valley
              </h2>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {areas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="rounded-[2rem] bg-slate-100 px-6 py-10 sm:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Need exterior maintenance done properly?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Get in touch for practical exterior property work backed by
                  LBP experience, strong presentation standards, and reliable
                  service.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Get a Quote
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}