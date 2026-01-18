import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Props = {};

const Home: React.FC<Props> = () => {
  // const [visible, setVisible] = useState(false);
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

  return (
    <>
      <header className="relative w-full h-[450px] overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity duration-300 
               group-hover:opacity-100 sm:opacity-60 sm:group-hover:opacity-90 
               opacity-0 bg-slide-left"
          style={{ backgroundImage: "url('/images/perfect_lawn.jpeg')" }}
        ></div>
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/10 sm:bg-black/40 sm:group-hover:bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-4 opacity-0 text-slide-right">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Your Lawn, Our Passion
          </h2>
          <p className="text-xl md:text-2xl font-semibold mb-6">
            Expert lawn mowing, efficient rubbish removal, and reliable property
            maintenance to keep your home looking its absolute best.
          </p>
          <Link href="/contact">
            <button className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition hover:cursor-pointer hover:font-bold">
              Get a Free Quote
            </button>
          </Link>
        </div>
      </header>

      <section className="py-16 px-6 md:px-16 bg-white text-black">
        <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center">
          Our Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Property Maintenance</h4>
            <p>
              Licensed Building Practitioners with decades of experience,
              specialising in end-of-lease maintenance to prepare rental
              properties for the next tenant.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Lawn Mowing</h4>
            <p>Fast and precise mowing for lawns of all sizes.</p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Weed Spraying</h4>
            <p>Keep your garden and lawn weed-free with safe and effective spraying.</p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Weed Eating</h4>
            <p>Trim and tidy hard-to-reach areas for a neat, manicured look.</p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Rubbish Collecting</h4>
            <p>We remove garden debris, old furniture, and unwanted items responsibly.</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-16 bg-green-50 text-black text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h3>
        <p className="text-lg md:text-xl">
          Experienced, reliable, and committed to keeping your yard looking its best.
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
              visibleItems[index] ? "opacity-100 translate-y-0" : "translate-y-5"
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
