import React from "react";
import ServiceCard from "../components/ServiceCard";
import { data } from "@/data/information";
import { useAuth } from "../context/AuthContext"; // import your auth context
type Props = {};

export default function ServicePage (props: Props){
  const { loading } = useAuth(); // get loading state from context
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <div className="max-w-[1600px]">
      <section className="pb-16 pt-28 px-6 md:px-16 bg-white text-black">
        <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {data.services.map((service, index) => (
            <ServiceCard key={index} imgSrc={service.imgSrc} title={service.title} descriptionHook={service.descriptionHook} description={service.description} />
          ))  
          }
        </div>
      </section>
      <section className="py-16 px-6 md:px-16 bg-green-50 text-black text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h3>
        <p className="text-lg md:text-xl">
          Experienced, reliable, and committed to keeping your yard and property looking their best. We specialize in end-of-lease maintenance, garden care, and professional waste removal, ensuring every job is done right the first time.
        </p>
      </section>
    </div>
  );
};
