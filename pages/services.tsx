import React from "react";
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
          <div className="p-6 border rounded shadow hover:shadow-lg transition hover:scale-105">
            <h4 className="font-semibold mb-2 text-xl">Property Maintenance</h4>
            <p>Specializing in end-of-lease maintenance to prepare rental properties for the next tenant.</p>
            <p className="mt-2 text-sm text-gray-700">
              As Licensed Building Practitioners (LBPs), we offer trusted and compliant property maintenance services, specialising in end-of-lease repairs, touch-ups, and preparing rental homes for the next tenants.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition hover:scale-105">
            <h4 className="font-semibold mb-2 text-xl">Lawn Mowing</h4>
            <p>Fast and precise mowing for lawns of all sizes, keeping your yard neat and healthy.</p>
            <p className="mt-2 text-sm text-gray-700">
              Using professional equipment, we ensure even, clean cuts. Regular mowing prevents overgrowth, promotes healthy grass, and enhances the overall appearance of your property.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition hover:scale-105">
            <h4 className="font-semibold mb-2 text-xl">Weed Spraying</h4>
            <p>Keep your lawn and garden weed-free with safe and effective spraying.</p>
            <p className="mt-2 text-sm text-gray-700">
              We target weeds at the root, preventing spread while protecting your plants and turf. Eco-friendly products are safe for pets and children and provide long-lasting results.
            </p>
          </div>
          <div className="p-6 border rounded shadow hover:shadow-lg transition hover:scale-105">
            <h4 className="font-semibold mb-2 text-xl">Weed Eating</h4>
            <p>Trim and tidy hard-to-reach areas for a neat, manicured look.</p>
            <p className="mt-2 text-sm text-gray-700">
              Ideal for edges, fences, pathways, and tight spots. We remove overgrowth and maintain a clean, professional garden appearance.
            </p>
          </div>
          
          <div className="p-6 border rounded shadow hover:shadow-lg transition hover:scale-105">
            <h4 className="font-semibold mb-2 text-xl">Rubbish Collecting</h4>
            <p>Responsible removal of garden debris, old furniture, and unwanted items.</p>
            <p className="mt-2 text-sm text-gray-700">
              Efficient collection and disposal of waste keeps your property clean and clutter-free. Perfect for garden clean-ups, renovations, or end-of-lease tidy-ups.
            </p>
          </div>
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
