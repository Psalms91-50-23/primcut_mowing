import React from "react";
import { useAuth } from "../context/AuthContext";

type Props = {};

export default function AboutPage(props: Props) {
  const { loading } = useAuth();

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
          alt="About Happy Property"
          className="w-full h-auto object-contain md:h-[950px] md:object-cover rounded shadow-lg"
        />
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center" />
      </div>

      <div className="px-6 py-14 md:px-10 lg:px-16 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Story</h2>

        <p className="text-lg md:text-xl mb-6 leading-8">
          Happy Property was built on a simple idea: property maintenance should
          be reliable, professional, and easy to organise. As locals, we saw
          that many homeowners, landlords, and property managers were often left
          dealing with rushed work, poor communication, or services that fell
          short of expectations. We knew there was a better way to serve our
          community.
        </p>

        <p className="text-lg md:text-xl mb-6 leading-8">
          Our focus is to provide dependable property care with clear
          communication and consistent workmanship. From regular lawn and garden
          maintenance to rubbish removal, property tidy-ups, and end-of-lease
          preparation, we approach every job with care, attention to detail, and
          respect for the property.
        </p>

        <p className="text-lg md:text-xl mb-6 leading-8">
          We believe good service is not only about the result, but also about
          the experience. That means being responsive, showing up on time,
          providing clear quoting, and making the process straightforward from
          first contact through to completion.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
          What Makes Us Different
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 border rounded shadow-sm bg-white">
            <h3 className="font-semibold text-xl mb-2">Reliable & Professional</h3>
            <p className="leading-7">
              We value punctuality, consistency, and respectful communication so
              our clients can feel confident in every booking.
            </p>
          </div>

          <div className="p-6 border rounded shadow-sm bg-white">
            <h3 className="font-semibold text-xl mb-2">Clear Communication</h3>
            <p className="leading-7">
              From enquiry to quote to completion, we aim to keep everything
              straightforward, transparent, and easy to understand.
            </p>
          </div>

          <div className="p-6 border rounded shadow-sm bg-white">
            <h3 className="font-semibold text-xl mb-2">Detail-Focused Work</h3>
            <p className="leading-7">
              We take pride in doing the job properly, with care and attention
              to detail rather than rushing through the work.
            </p>
          </div>

          <div className="p-6 border rounded shadow-sm bg-white">
            <h3 className="font-semibold text-xl mb-2">End-of-Lease & Property Support</h3>
            <p className="leading-7">
              We understand the standard required when preparing properties for
              inspections, handovers, or new tenants.
            </p>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
          Who We Work With
        </h2>

        <div className="space-y-4 mb-10 text-lg md:text-xl">
          <p>• Homeowners wanting dependable ongoing property maintenance</p>
          <p>• Landlords preparing properties for new tenants or inspections</p>
          <p>• Property managers needing reliable and responsive service</p>
          <p>• Busy families looking for practical, stress-free property care</p>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">
          Our Approach
        </h2>

        <p className="text-lg md:text-xl mb-6 leading-8">
          We aim to make quoting and booking simple. Clients can reach out,
          provide details and photos, and receive a clear response based on the
          work required. Our goal is to save you time, reduce stress, and give
          you confidence that your property is in good hands.
        </p>

        <div className="bg-green-50 p-8 rounded text-center border border-green-100">
          <h3 className="text-2xl font-semibold mb-4">
            Ready to work with a dependable local team?
          </h3>
          <p className="mb-6 text-lg">
            We’re here to make property maintenance simple, professional, and
            stress-free.
          </p>
          <a
            href="/contact"
            className="inline-block bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition font-semibold"
          >
            Get a Free Quote
          </a>
        </div>
      </div>
    </div>
  );
}
