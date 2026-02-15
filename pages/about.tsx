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
      <div className="p-16">
        <p className="text-lg md:text-xl mb-6">
          We are two passionate locals who started Happy Lawns Mowing with a simple goal: to help homeowners and landlords maintain beautiful, healthy, and tidy properties. From lawns to rubbish removal and end-of-lease property care, we bring professionalism, reliability, and attention to detail to every job.
        </p>
        <p className="text-lg md:text-xl mb-6">
          Our experience and hands-on approach mean we understand the challenges of keeping a property in top shape. We specialize in end-of-lease maintenance, ensuring rental properties are clean, well-kept, and ready for the next tenant. We also provide weed control, mowing, and rubbish collection to keep every property looking its best.
        </p>
        <p className="text-lg md:text-xl">
          At Happy Lawns Mowing, we believe in doing the job right the first time. We pride ourselves on reliability, professionalism, and a friendly, approachable service. Whether you’re a homeowner looking to maintain your garden or a landlord preparing a property for new tenants, we’re here to help.
        </p>
      </div>
    </div>
  );
}


