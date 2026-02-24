import React from "react";
import ServiceCard from "../../components/ServiceCard";
import { data } from "@/data/information";
import { useAuth } from "../../context/AuthContext";

type Props = {};

export default function ServicePage(props: Props) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-hidden max-w-[1600px]">
      <section className="pb-16 pt-5 px-6 md:px-16 bg-white text-black">
        <h3 className="py-5 text-3xl md:text-4xl font-bold mb-10 text-center">
          Our Services
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          {data.services.map((service, index) => (
            <ServiceCard
              key={service.slug ?? index}
              slug={service.slug}
              imgSrc={service.imgSrc}
              title={service.title}
              descriptionHook={service.descriptionHook}
              description={service.description}
              priceLabel={service.priceLabel}
              priceNote={service.priceNote}
            />
          ))}
        </div>
      </section>

      <section className="py-16 px-6 md:px-16 bg-green-50 text-black text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h3>
        <p className="text-lg md:text-xl">
          Experienced, reliable, and committed to keeping your yard and property
          looking their best. We specialize in end-of-lease maintenance, garden
          care, and professional waste removal, ensuring every job is done right
          the first time.
        </p>
      </section>
    </div>
  );
}