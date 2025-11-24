import React from 'react'
import Link from "next/link";
import NavBar from '../components/NavBar';
import Image from "next/image";
import lawn from "../public/images/perfect_lawn.jpeg";


type Props = {}

const Home =  (props: Props) => {
  return (
    <>
      <NavBar />
      <header className="bg-green-100 text-center py-0">
        <div className="relative w-full h-[450px] flex flex-col justify-center py-10 group">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-300 opacity-60 group-hover:opacity-80"
                style={{ backgroundImage: "url('/images/perfect_lawn.jpeg')" }}
            ></div>

            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Content: fully opaque */}
            <div className="relative z-10 text-center">
                <h2 className="text-6xl font-bold mb-4 text-white">Your Lawn, Our Passion</h2>
                <p className="text-2xl font-bold mb-6 text-white">
                Professional mowing and garden care for a perfectly maintained yard.
                </p>
                <Link href="/contact">
                <button className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition hover:cursor-pointer">
                    Get a Free Quote
                </button>
                </Link>
            </div>
        </div>

      </header>

      <section className="py-16 px-8 bg-white">
        <h3 className="text-2xl font-bold mb-6 text-center">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2">Lawn Mowing</h4>
            <p>Fast and precise mowing for all lawn sizes.</p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2">Hedge Trimming</h4>
            <p>Keep hedges neat and healthy with our expert trimming service.</p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2">Garden Maintenance</h4>
            <p>Complete garden care including pruning, planting, and tidying.</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-8 bg-green-50 text-center">
        <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
        <p>Experienced, reliable, and committed to keeping your yard looking its best.</p>
      </section>
    </>
  );
}

export default Home