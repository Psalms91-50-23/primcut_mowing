import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import useMediaQuery from "../hooks/useMediaQuery"

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
        "General repairs, end-of-lease preparation, small renovations and property upkeep handled professionally.",
    },
    {
      title: "Lawn Mowing",
      href: "/services/lawn-mowing",
      icon: "🌿",
      description:
        "Clean, sharp mowing for lawns of all sizes. One-off or regular maintenance available.",
    },
    {
      title: "Weed Spraying",
      href: "/services/weed-spraying",
      icon: "🧴",
      description:
        "Safe and effective weed control for gardens, driveways, and property edges.",
    },
    {
      title: "Junk / Furniture Removal",
      href: "/services/junk-removal",
      icon: "🚚",
      description:
        "Responsible removal of unwanted furniture, green waste and general rubbish.",
    },
  ];

  return (
    <>
      {/* HERO */}
      <header className="relative w-full overflow-hidden bg-white group">
        {/* IMAGE LAYOUT */}
        {isSmall ? (
          // < 639px: 2 images stacked
          <div className="flex flex-col w-full">
            <div className="flex flex-1 w-full bg-black border-b-[3px] border-white ">
              <img
                src="/images/emoji-landing-page-building.png"
                alt="Building"
                className="flex flex-1 object-contain"
              />
            </div>

            <div className="flex flex-1 w-full bg-black">
              <img
                src="/images/emoji-landing-page-paint-and-mow.png"
                alt="Mowing"
                className="flex flex-1 border-b-[3px] border-r-[3px] border-white object-contain"
              />
            </div>
          </div>
        ) : (
          // >= 640px: 1 combined image
          <div className="w-full bg-black aspect-[16/9]">
            <img
              src="/images/emoji-landing-page.png"
              alt="Hero"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* OVERLAY (lighter on hover) */}
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300" />

        {/* TEXT */}
        <div className="absolute inset-0 z-10 flex flex-col justify-start sm:justify-center items-center text-center text-white px-6 pt-10 sm:pt-0">
          <h1 className="text-2xl md:text-5xl font-bold leading-tight max-w-4xl">
            Professional Property Maintenance & Lawn Services
          </h1>

          <p className="mt-6 text-lg md:text-2xl max-w-3xl">
            Now taking bookings across Hutt Valley. Reliable service, professional
            finish, and clear communication every step of the way.
          </p>

          <div className="mt-8 flex gap-4 flex-wrap justify-center">
            <Link
              href="/contact"
              className="bg-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              Get a Free Quote
            </Link>

            <a
              href="tel:+64000000000"
              className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black active:bg-white active:text-black transition"
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
            Our Services
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Quality workmanship. Reliable scheduling. Clear pricing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((s) => (
              <Link key={s.href} href={s.href} className="group">
                <div className="p-8 rounded-2xl border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
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

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 md:px-16 bg-gray-50 text-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Simple & Stress-Free Process
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Request a Quote",
                desc: "Tell us what you need. Photos help us quote faster.",
              },
              {
                step: "2",
                title: "Confirm Details",
                desc: "We’ll confirm pricing and confirm your booking with clear communication every step of the way.",
              },
              {
                step: "3",
                title: "Job Completed",
                desc: "Professional finish and tidy clean-up.",
              },
            ].map((item) => (
              <div key={item.step} className="p-8 bg-white rounded-2xl border shadow-sm">
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
            Built on Reliability & Professionalism
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed">
            Happy Property is built on a simple principle — treat every property
            with care and every client with respect. We are currently expanding
            and welcoming new clients across Hutt Valley.
          </p>

          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            Our focus is long-term relationships, consistent quality, and
            dependable service you can rely on.
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
          Ready to Get Started?
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Request a free quote today and let’s take care of your property.
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