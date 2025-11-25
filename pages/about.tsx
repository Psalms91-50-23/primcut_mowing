import React from "react";

type Props = {}

const About = (props: Props) => {
  return (
    <div className="py-16 px-6 md:px-16 bg-white text-black">
       <div className="relative w-full h-[650px] md:h-[650px] mb-8">
        <img
          src="/images/about_us.jpg" // Replace with your image path
          alt="About Us"
          className="w-full h-full object-cover rounded shadow-lg"
        />
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
          {/* <h1 className="text-3xl md:text-5xl font-bold text-white">About Us</h1> */}
        </div>
      </div>

      <p className="text-lg md:text-xl mb-6">
        We are two passionate locals who started PrimCut Mowing with a simple goal: to help homeowners and landlords maintain beautiful, healthy, and tidy properties. From lawns to rubbish removal and end-of-lease property care, we bring professionalism, reliability, and attention to detail to every job.
      </p>

      <p className="text-lg md:text-xl mb-6">
        Our experience and hands-on approach mean we understand the challenges of keeping a property in top shape. We specialize in end-of-lease maintenance, ensuring rental properties are clean, well-kept, and ready for the next tenant. We also provide weed control, mowing, and rubbish collection to keep every property looking its best.
      </p>

      <p className="text-lg md:text-xl">
        At PrimCut Mowing, we believe in doing the job right the first time. We pride ourselves on reliability, professionalism, and a friendly, approachable service. Whether you’re a homeowner looking to maintain your garden or a landlord preparing a property for new tenants, we’re here to help.
      </p>
    </div>
  )
}

export default About;
