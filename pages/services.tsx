import React from "react";
import ServiceCard from "../components/ServiceCard";
import { data } from "@/data/information";
type Props = {};

const Services = (props: Props) => {
  return (
    <div>
      <section className="py-16 px-6 md:px-16 bg-white text-black">
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

export default Services;