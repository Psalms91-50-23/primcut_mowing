import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import useMediaQuery from "../hooks/useMediaQuery";

type Props = {};

const Home: React.FC<Props> = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isSmall = useMediaQuery("(max-width: 639px)");

  const areas = [
    "Alicetown",
    "Avalon",
    "Epuni",
    "Fairfield",
    "Lower Hutt",
    "Melling",
    "Moera",
    "Naenae",
    "Petone",
    "Stokes Valley",
    "Silverstream",
    "Taita",
    "Upper Hutt",
    "Waiwhetu",
    "Waterloo",
    "Woburn",
  ];

  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(areas.length).fill(false)
  );

  useEffect(() => {
    if (!gridRef.current) return;

    const items = Array.from(gridRef.current.querySelectorAll(".area-item"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.intersectionRatio > 0.3;

          if (isVisible) {
            items.forEach((_, i) => {
              setTimeout(() => {
                setVisibleItems((prev) => {
                  const updated = [...prev];
                  updated[i] = true;
                  return updated;
                });
              }, i * 50);
            });
          } else {
            setVisibleItems(new Array(areas.length).fill(false));
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(gridRef.current);

    return () => observer.disconnect();
  }, [areas]);

  const services = [
    {
      title: "Property Maintenance",
      href: "/services/property-maintenance",
      icon: "🏠",
      description:
        "General property maintenance, handyman work, repairs, and custom jobs for residential properties.",
    },
    {
      title: "Exterior Maintenance",
      href: "/services/exterior-maintenance",
      icon: "🪜",
      description:
        "Deck repairs, fence and gate repairs, gutter cleaning, pressure washing, roof moss treatment, and exterior wall repairs.",
    },
    {
      title: "Lawn Care",
      href: "/services/lawn-mowing",
      icon: "🌿",
      description:
        "Lawn mowing, edging, weed spraying, hedge trimming and ongoing outdoor maintenance.",
    },
    {
      title: "Cleaning Services",
      href: "/services/cleaning",
      icon: "🧼",
      description:
        "Deck cleaning, and driveway cleaning to keep your property presentable.",
    },
    {
      title: "Interior Repairs",
      href: "/services/interior-repairs",
      icon: "🛠️",
      description:
        "Door repairs, minor carpentry, paint touch ups, wall repairs, and sealant replacement.",
    },
    {
      title: "Junk Removal & Delivery",
      href: "/services/junk-removal",
      icon: "🚚",
      description:
        "Junk and furniture removal, garage cleanup, construction waste removal, plus pickup and delivery for large items.",
    },
  ];

  const highlights = [
    "LBP-backed exterior property work",
    "Deck, fence, gate, and wall repairs",
    "Gutter cleaning and pressure washing",
    "Reliable exterior upkeep for homes and rentals",
  ];

  return (
    <>
      <Head>
        <title>Happy Property | Property Maintenance & Exterior Services</title>
        <meta
          name="description"
          content="LBP Licensed Building Practitioner offering property maintenance, exterior repairs, lawn care, cleaning, and handyman services across the Hutt Valley."
        />
        <meta property="og:title" content="Happy Property" />
        <meta
          property="og:description"
          content="LBP Licensed Building Practitioner for property maintenance, exterior repairs, lawn care, and cleaning across the Hutt Valley."
        />
        <meta
          property="og:image"
          content="https://happyproperty.co.nz/images/og/homepage_preview.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://happyproperty.co.nz" />
        <meta property="og:type" content="website" />
      </Head>

      {/* HERO */}
      {/* <header className="relative w-full overflow-hidden bg-white group"> */}
      <header className="relative overflow-hidden bg-black min-h-[560px] sm:min-h-[650px] group">
        {isSmall ? (
          <div className="absolute inset-0 flex flex-col">
            <div className="h-1/2 w-full bg-black flex items-center justify-center border-b-[3px] border-white">
              <img
                src="/images/emoji-landing-page-building.png"
                alt="Property maintenance and exterior services"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="h-1/2 w-full bg-black flex items-center justify-center">
              <img
                src="/images/emoji-landing-page-paint-and-mow.png"
                alt="Lawn care and exterior work"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black">
            <img
              src="/images/emoji-landing-page.png"
              alt="Happy Property hero"
              className="w-full h-full object-contain object-center opacity-80 group-hover:scale-105 transition duration-700"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-black/45 transition duration-500 group-hover:bg-black/20" />
        {/* <div className="absolute inset-0 bg-black/55" /> */}

        <div className="relative z-10 flex min-h-[560px] sm:min-h-[650px] flex-col justify-center items-center text-center text-white px-6 py-16 sm:py-20">
          <div className="inline-flex items-center rounded-full bg-white/15 border border-white/30 px-4 py-2 text-sm font-semibold tracking-wide backdrop-blur-sm">
            LBP Licensed Building Practitioner
          </div>

          <h1 className="mt-5 text-2xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-5xl">
            Professional Property Maintenance, Exterior Repairs & Lawn Services
          </h1>

         <p className="mt-6 text-base sm:text-lg md:text-2xl max-w-3xl">
          Trusted property upkeep across the Hutt Valley. From exterior maintenance
          and handyman repairs to lawns and cleaning, you get reliable
          service, clear communication, and a professional finish.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3 max-w-4xl">
          {highlights.map((item) => (
            <div
              key={item}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm sm:text-base font-medium text-white backdrop-blur-sm"
            >
              {item}
            </div>
          ))}
        </div>

          <div className="mt-8 flex w-full max-w-md flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition text-center"
            >
              Get a Free Quote
            </Link>

            <a
              href="tel:+64000000000"
              className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition text-center"
            >
              Call Now
            </a>
          </div>
        </div>
      </header>

      {/* SERVICES */}
      <section className="py-20 px-6 md:px-16 bg-white text-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Property Services Built Around Real Maintenance Needs
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Our service range covers the main work homeowners, landlords, and property
            managers need — from property maintenance and exterior repairs through to
            lawns, gardens, cleaning, and rubbish removal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {services.map((s) => (
              <Link key={s.href} href={s.href} className="group">
                <div className="h-full p-8 rounded-2xl border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-gray-700 mb-6">{s.description}</p>
                  <span className="text-green-700 font-semibold group-hover:underline">
                    Learn more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 px-6 md:px-16 bg-gray-50 text-black">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Happy Property
            </h2>
            <p className="text-gray-700 text-lg">
              When it comes to maintaining a property, trust matters. Having an
              LBP background helps position us strongly for repair-focused,
              exterior, and practical maintenance work where workmanship and
              reliability count.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-8 bg-white rounded-2xl border shadow-sm">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-3">Licensed Credibility</h3>
              <p className="text-gray-700">
                Promote your LBP Licensed Building Practitioner status as a clear
                point of difference for property maintenance, repairs, and exterior work.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border shadow-sm">
              <div className="text-3xl mb-4">🏡</div>
              <h3 className="text-xl font-bold mb-3">Broad Property Coverage</h3>
              <p className="text-gray-700">
                From deck repairs, fences, gates, lawns, and
                cleaning through to handyman and interior repair jobs, the service
                offering is broad and practical.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl border shadow-sm">
              <div className="text-3xl mb-4">📞</div>
              <h3 className="text-xl font-bold mb-3">Clear Communication</h3>
              <p className="text-gray-700">
                Clients want dependable booking, transparent quoting, and updates
                they can trust. That professional experience should be part of the sell.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 md:px-16 bg-white text-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Simple & Stress-Free Process
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Request a Quote",
                desc: "Tell us what work is needed. Photos help us quote faster, especially for maintenance and exterior jobs.",
              },
              {
                step: "2",
                title: "Confirm Scope & Pricing",
                desc: "We confirm the work, pricing, and booking clearly so you know exactly what to expect.",
              },
              {
                step: "3",
                title: "Job Completed Professionally",
                desc: "We carry out the job with care, keep communication clear, and leave the property tidy.",
              },
            ].map((item) => (
              <div key={item.step} className="p-8 bg-gray-50 rounded-2xl border shadow-sm">
                <div className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-bold mx-auto">
                  {item.step}
                </div>
                <h4 className="mt-4 text-xl font-bold">{item.title}</h4>
                <p className="mt-3 text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / TRUST */}
      <section className="py-20 px-6 md:px-16 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Built on Reliability, Professionalism & Practical Experience
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed">
            Happy Property is built on a simple principle — treat every property
            with care and every client with respect. We focus on practical,
            high-value work that helps keep homes and investment properties in
            good condition.
          </p>

          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            With an LBP Licensed Building Practitioner background and a service
            range that spans property maintenance, exterior maintenance, lawn care,
            cleaning, garden work, and removal jobs, we are positioned to be a
            reliable go-to for ongoing property upkeep.
          </p>
        </div>
      </section>

      {/* AREAS */}
      <section className="py-20 px-6 md:px-16 bg-green-50 text-black text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Areas We Cover
          </h2>
          <p className="mb-10 text-gray-700">
            Servicing suburbs across Lower Hutt and Upper Hutt.
          </p>

          <div
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center"
          >
            {areas.map((area, index) => (
              <div
                key={area}
                className={`area-item opacity-0 transform transition-all duration-700 ${
                  visibleItems[index]
                    ? "opacity-100 translate-y-0"
                    : "translate-y-5"
                }`}
              >
                <span className="px-4 py-2 rounded-full bg-white shadow-lg shadow-black/20 text-green-800 font-medium">
                  {area}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Need Property Maintenance You Can Rely On?
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
          Get in touch for exterior repairs, handyman work, lawns, and general property upkeep across the Hutt Valley.
        </p>

        <Link
          href="/contact"
          className="inline-block mt-8 bg-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-green-800 transition"
        >
          Request a Free Quote
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-900 text-white py-10 text-center text-sm">
        © {new Date().getFullYear()} Happy Property. All rights reserved.
      </footer>
    </>
  );
};

export default Home;