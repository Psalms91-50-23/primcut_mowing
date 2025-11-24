import React from "react";
import NavBar from "../components/NavBar";
import Link from "next/link";

type Props = {};

const Home: React.FC<Props> = () => {
  return (
    <>
      <NavBar />

      <header className="relative w-full h-[450px] group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300 opacity-60 group-hover:opacity-80"
          style={{ backgroundImage: "url('/images/perfect_lawn.jpeg')" }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">Your Lawn, Our Passion</h2>
          <p className="text-xl md:text-2xl font-semibold mb-6">
            Professional mowing and garden care for a perfectly maintained yard.
          </p>
          <Link href="/contact">
            <button className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition hover:cursor-pointer">
              Get a Free Quote
            </button>
          </Link>
        </div>
      </header>

      <section className="py-16 px-6 md:px-16 bg-white text-black">
        <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Lawn Mowing</h4>
            <p>Fast and precise mowing for all lawn sizes.</p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Hedge Trimming</h4>
            <p>Keep hedges neat and healthy with our expert trimming service.</p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Garden Maintenance</h4>
            <p>Complete garden care including pruning, planting, and tidying.</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-16 bg-green-50 text-black text-center ">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h3>
        <p className="text-lg md:text-xl">
          Experienced, reliable, and committed to keeping your yard looking its best.
        </p>
      </section>
    </>
  );
};

export default Home;
