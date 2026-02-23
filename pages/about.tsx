import React from "react";
import { useAuth } from "../context/AuthContext"; // import your auth context
type Props = {}

export default function AboutPage (props: Props){
  const { loading } = useAuth(); // get loading state from context

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white text-black">
       <div className="relative w-full">
        <img
          src="/images/about_us_1.png"
          alt="About Us"
          className="w-full h-auto object-contain md:h-[950px] md:object-cover rounded shadow-lg"
        />
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
        </div>
      </div>
      <div className="p-16 max-w-5xl mx-auto">

    <h2 className="text-2xl md:text-3xl font-bold mb-6">
      Our Story
    </h2>

    <p className="text-lg md:text-xl mb-6">
      Happy Property was started by two passionate locals who saw the need for
      reliable, detail-focused property maintenance services in the Hutt Valley.
      Too often, homeowners and landlords were left dealing with rushed jobs,
      inconsistent communication, or unfinished work. We believed there was a
      better way.
    </p>

    <p className="text-lg md:text-xl mb-6">
      Our goal is simple: provide dependable, high-quality property care that
      gives our clients peace of mind. Whether it’s regular lawn maintenance,
      end-of-lease preparation, or rubbish removal, we treat every property with
      the same level of care and professionalism.
    </p>

    <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
      What Makes Us Different
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="p-6 border rounded shadow-sm">
        <h3 className="font-semibold text-xl mb-2">Reliable & Punctual</h3>
        <p>
          We show up when we say we will and communicate clearly throughout the
          entire process.
        </p>
      </div>

      <div className="p-6 border rounded shadow-sm">
        <h3 className="font-semibold text-xl mb-2">Detail-Focused Work</h3>
        <p>
          From lawns to full property tidy-ups, we take pride in doing the job
          properly — not just quickly.
        </p>
      </div>

      <div className="p-6 border rounded shadow-sm">
        <h3 className="font-semibold text-xl mb-2">End-of-Lease Specialists</h3>
        <p>
          We understand what landlords and property managers need to prepare
          homes for new tenants.
        </p>
      </div>

      <div className="p-6 border rounded shadow-sm">
        <h3 className="font-semibold text-xl mb-2">Local & Approachable</h3>
        <p>
          As locals, we care about our community and build long-term
          relationships with our clients.
        </p>
      </div>
    </div>

    <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
      Who We Work With
    </h2>

    <ul className="text-lg md:text-xl space-y-3 mb-10">
      <li>• Homeowners who want regular maintenance</li>
      <li>• Landlords preparing properties for new tenants</li>
      <li>• Property managers needing dependable service</li>
      <li>• Busy families who want their weekends back</li>
    </ul>

    <div className="bg-green-50 p-8 rounded text-center">
      <h3 className="text-2xl font-semibold mb-4">
        Ready to work with a reliable local team?
      </h3>
      <p className="mb-6">
        We’re here to make property care simple and stress-free.
      </p>
      <a
        href="/contact"
        className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition font-semibold"
      >
        Get a Free Quote
      </a>
    </div>
  </div>
      {/* <div className="p-16">
        <p className="text-lg md:text-xl mb-6">
          We are two passionate locals who started Happy Lawns Mowing with a simple goal: to help homeowners and landlords maintain beautiful, healthy, and tidy properties. From lawns to rubbish removal and end-of-lease property care, we bring professionalism, reliability, and attention to detail to every job.
        </p>
        <p className="text-lg md:text-xl mb-6">
          Our experience and hands-on approach mean we understand the challenges of keeping a property in top shape. We specialize in end-of-lease maintenance, ensuring rental properties are clean, well-kept, and ready for the next tenant. We also provide weed control, mowing, and rubbish collection to keep every property looking its best.
        </p>
        <p className="text-lg md:text-xl">
          At Happy Lawns Mowing, we believe in doing the job right the first time. We pride ourselves on reliability, professionalism, and a friendly, approachable service. Whether you’re a homeowner looking to maintain your garden or a landlord preparing a property for new tenants, we’re here to help.
        </p>
      </div> */}
    </div>
  );
}


