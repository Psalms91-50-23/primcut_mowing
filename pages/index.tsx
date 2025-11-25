import React from "react";
import NavBar from "../components/NavBar";
import Link from "next/link";

type Props = {};

const Home: React.FC<Props> = () => {
  return (
    <>
      <header className="relative w-full h-[450px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 bg-slide-left"
          style={{ backgroundImage: "url('/images/perfect_lawn.jpeg')" }}
        ></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-4 text-slide-right">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Your Lawn, Our Passion
          </h2>
          <p className="text-xl md:text-2xl font-semibold mb-6">
            Professional mowing and garden care for a perfectly maintained yard.
          </p>
          <Link href="/contact">
            <button className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition hover:cursor-pointer hover:font-bold">
              Get a Free Quote
            </button>
          </Link>
        </div>
      </header>
      <section className="py-16 px-6 md:px-16 bg-white text-black">
        <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

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

          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Property Maintenance</h4>
            <p>Specializing in end-of-lease maintenance to prepare rental properties for the next tenant.</p>
          </div>

        </div>
      </section>
      <section className="py-16 px-6 md:px-16 bg-green-50 text-black text-center ">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h3>
        <p className="text-lg md:text-xl">
          Experienced, reliable, and committed to keeping your yard looking its best.
        </p>
      </section>
      <section className="py-16 px-6 md:px-16 bg-white text-black text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-6">Areas We Cover</h3>
        <p className="text-lg md:text-xl mb-10">
          We proudly serve suburbs across Hutt Valley, including:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center mx-auto max-w-5xl">
          {[
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
          ].map((area, index) => (
            <div
              key={area}
              className={`opacity-0 translate-x-[-50px] animate-slide-in`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <span className="px-4 py-2 rounded-full bg-green-100 text-green-800 font-medium shadow hover:shadow-lg transition text-center">
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
