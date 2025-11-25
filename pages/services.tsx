import React from "react";

type Props = {};

const Services = (props: Props) => {
  return (
    <div>
      <section className="py-16 px-6 md:px-16 bg-white text-black">
        <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

          {/* Lawn Mowing */}
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Lawn Mowing</h4>
            <p>Fast and precise mowing for lawns of all sizes, keeping your yard neat and healthy.</p>
            <p className="mt-2 text-sm text-gray-700">
              We use professional equipment to ensure even, clean cuts. Regular mowing prevents overgrowth, promotes healthy grass, and enhances the overall look of your property.
            </p>
          </div>

          {/* Weed Spraying */}
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Weed Spraying</h4>
            <p>Keep your lawn and garden weed-free with safe and effective spraying.</p>
            <p className="mt-2 text-sm text-gray-700">
              We target weeds at the root, preventing them from spreading and protecting your plants and turf. Our eco-friendly products are safe for pets and children while ensuring long-lasting results.
            </p>
          </div>

          {/* Weed Eating */}
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Weed Eating</h4>
            <p>Trim and tidy hard-to-reach areas for a neat, manicured look.</p>
            <p className="mt-2 text-sm text-gray-700">
              Perfect for edges, fences, pathways, and tight spots where mowers can’t reach. We remove overgrowth and keep your garden looking clean and professional.
            </p>
          </div>

          {/* Property Maintenance */}
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Property Maintenance</h4>
            <p>Specializing in end-of-lease maintenance to prepare rental properties for the next tenant.</p>
            <p className="mt-2 text-sm text-gray-700">
              We step in after tenants move out to restore properties to tenancy standards. Services include lawn care, garden cleanup, minor repairs, rubbish removal, and general tidying, ensuring the property is move-in ready and compliant with lease agreements.
            </p>
          </div>

          {/* Rubbish Collecting */}
          <div className="p-6 border rounded shadow hover:shadow-lg transition">
            <h4 className="font-semibold mb-2 text-xl">Rubbish Collecting</h4>
            <p>Responsible removal of garden debris, old furniture, and unwanted items.</p>
            <p className="mt-2 text-sm text-gray-700">
              We handle the collection and disposal of waste efficiently, keeping your property clean and clutter-free. Perfect for garden clean-ups, renovations, or end-of-lease tidy-ups.
            </p>
          </div>

        </div>
      </section>

      {/* Why Choose Us Section */}
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
