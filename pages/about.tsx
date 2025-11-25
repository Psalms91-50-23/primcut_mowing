import React from "react";

type Props = {}

const About = (props: Props) => {
  return (
    <div className="py-16 px-6 md:px-16 bg-white text-black">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">About Us</h1>

      <p className="text-lg md:text-xl mb-6">
        We are two passionate locals who started PrimCut Mowing with a simple goal: to help homeowners and landlords maintain beautiful, healthy, and tidy properties. From lawns and gardens to rubbish removal and end-of-lease property care, we bring professionalism, reliability, and attention to detail to every job.
      </p>

      <p className="text-lg md:text-xl mb-6">
        Our experience and hands-on approach mean we understand the challenges of keeping a property in top shape. We specialize in end-of-lease maintenance, ensuring rental properties are clean, well-kept, and ready for the next tenant. We also provide weed control, mowing, garden maintenance, and rubbish collection to keep every property looking its best.
      </p>

      <p className="text-lg md:text-xl">
        At PrimCut Mowing, we believe in doing the job right the first time. We pride ourselves on reliability, professionalism, and a friendly, approachable service. Whether you’re a homeowner looking to maintain your garden or a landlord preparing a property for new tenants, we’re here to help.
      </p>
    </div>
  )
}

export default About;
