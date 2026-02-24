import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Props = {};

const Home: React.FC<Props> = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  const areas = [
    "Petone",
    "Waiwhetu",
    "Waterloo",
    "Epuni",
    "Fairfield",
    "Woburn",
    "Lower Hutt",
    "Naenae",
    "Taita",
    "Stokes Valley",
    "Silverstream",
    "Upper Hutt",
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
      hook: "Repairs, tidy-ups, end-of-lease prep",
      description:
        "Licensed Building Practitioners with decades of experience—perfect for rental maintenance and getting properties ready for the next tenant.",
    },
    {
      title: "Lawn Mowing",
      href: "/services/lawn-mowing",
      icon: "🌿",
      hook: "Clean cuts, sharp edges, fast turnaround",
      description:
        "Fast and precise mowing for lawns of all sizes, keeping your place looking fresh week to week.",
    },
    {
      title: "Weed Spraying",
      href: "/services/weed-spraying",
      icon: "🧴",
      hook: "Safe, effective weed control",
      description:
        "Keep gardens, paths, and lawns weed-free with careful application and reliable results.",
    },
    {
      title: "Junk / Furniture Removal",
      href: "/services/junk-removal",
      icon: "🚚",
      hook: "Old furniture, green waste, general rubbish",
      description:
        "We remove unwanted items responsibly—great for move-outs, clear-outs, and garden cleanups.",
    },
  ];

  return (
    <>
      <header className="relative w-full h-auto overflow-hidden group py-3 md:h-[950px]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity duration-300 
               group-hover:opacity-100 sm:opacity-60 sm:group-hover:opacity-80 
               opacity-0 bg-slide-left"
          style={{ backgroundImage: "url('/images/emoji-landing-page.png')" }}
        ></div>
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/10 sm:bg-black/50 sm:group-hover:bg-black/30"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-4 opacity-0 text-slide-right">
          <p className="text-2xl p-5 md:text-4xl font-bold">
            Happy Property — where care, quality, and reliability meet.
          </p>
          <p className="text-lg p-4 md:text-2xl font-semibold">
            Take back your weekends and leave the hard work to us. After a long
            day, relax knowing your property is in safe, professional hands.
          </p>
          <Link href="/contact">
            <button className="bg-green-700 text-white mt-5 px-6 py-3 rounded hover:bg-green-800 transition hover:cursor-pointer hover:font-bold">
              Get a Free Quote
            </button>
          </Link>
        </div>
      </header>

      {/* SERVICES */}
      <section className="py-16 px-6 md:px-16 bg-white text-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-3 text-center">
            Our Services
          </h3>
          <p className="text-center text-gray-600 mb-10">
            Click a service to learn more, see examples, and request a quote.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((s) => (
              <Link key={s.href} href={s.href} className="group">
                <div
                  className="
                    relative h-full p-7 rounded-2xl border border-gray-200 bg-white
                    shadow-sm transition
                    hover:-translate-y-1 hover:shadow-xl
                    hover:border-green-300 hover:ring-2 hover:ring-green-200
                    focus:outline-none focus:ring-2 focus:ring-green-300
                  "
                >
                  {/* subtle top gradient strip */}
                  <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-green-700 via-green-500 to-green-300" />

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 border border-green-100 text-2xl">
                      {s.icon}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-bold text-xl text-gray-900">
                          {s.title}
                        </h4>
                        <span className="text-green-700 font-semibold opacity-0 translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                          Learn more →
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-green-800">
                        {s.hook}
                      </p>
                      <p className="mt-3 text-gray-700 leading-relaxed">
                        {s.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                          Fast quotes
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                          Reliable scheduling
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                          Professional finish
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* hover overlay glow */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute -inset-8 bg-green-200/20 blur-2xl rounded-full" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-16 bg-green-50 text-black text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h3>
        <p className="text-lg md:text-xl">
          Experienced, reliable, and committed to keeping your yard looking its
          best.
        </p>
      </section>

      <section className="flex flex-col py-16 px-6 md:px-16 bg-white text-black text-center">
        <div className="mb-10">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Areas We Cover</h3>
          <p className="text-lg md:text-xl">
            We proudly serve suburbs across Hutt Valley, including:
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-2 justify-items-center mx-auto w-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-2"
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
              <span className="px-3 py-2 rounded-full bg-green-100 text-green-800 font-medium shadow hover:shadow-lg transition text-center block">
                {area}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;