import Link from "next/link";

type Props = {
  imgSrc: string;
  title: string;
  descriptionHook: string;
  description: string;
  slug?: string;
  priceLabel?: string;
  priceNote?: string;
};

const ServiceCard = ({
  imgSrc,
  title,
  descriptionHook,
  description,
  slug,
  priceLabel,
  priceNote,
}: Props) => {
  const CardContent = (
    <div
      className="relative flex flex-col p-6 border rounded shadow font-bold hover:shadow-lg transition hover:scale-105 group overflow-hidden"
      style={{
        backgroundImage: imgSrc ? `url(${imgSrc})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/75 transition"></div>

      <div className="relative z-10 text-white">

        {/* Pricing Badge */}
        {priceLabel && (
          <div className="mb-3">
            <span className="inline-block bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
              {priceLabel}
            </span>
            {priceNote && (
              <p className="text-xs mt-2 text-gray-200 font-normal">
                {priceNote}
              </p>
            )}
          </div>
        )}

        <h4 className="mb-2 text-xl">{title}</h4>

        <p className="text-gray-200 font-medium">
          {descriptionHook}
        </p>

        <p className="mt-3 text-sm text-gray-300 font-normal">
          {description}
        </p>

        {/* Optional View More Indicator */}
        {slug && (
          <div className="mt-4 text-sm underline font-semibold">
            Learn More →
          </div>
        )}
      </div>
    </div>
  );

  // If slug exists, wrap in Link
  return slug ? (
    <Link href={`/services/${slug}`} className="block">
      {CardContent}
    </Link>
  ) : (
    CardContent
  );
};

export default ServiceCard;