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
  const href = slug ? `/services/${slug}` : undefined;

  const CardContent = (
    <div
      className="
        relative flex flex-col justify-between
        p-7 rounded-2xl border border-gray-200
        shadow-sm transition
        hover:-translate-y-1 hover:shadow-xl
        hover:border-green-300 hover:ring-2 hover:ring-green-200
        overflow-hidden group
        focus:outline-none
      "
      style={{
        backgroundImage: imgSrc ? `url(${imgSrc})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay (more premium: gradient instead of flat black) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/65 to-black/80 group-hover:from-black/60 group-hover:to-black/90 transition" />

      {/* Top subtle highlight strip */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-700 via-green-500 to-green-300 opacity-90" />

      <div className="relative z-10 text-white">
        {/* Pricing Badge */}
        {priceLabel && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
              {priceLabel}
            </span>

            {priceNote && (
              <p className="text-xs mt-2 text-white/80 font-normal leading-snug">
                {priceNote}
              </p>
            )}
          </div>
        )}

        {/* Title */}
        <h4 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {title}
        </h4>

        {/* Hook */}
        <p className="mt-2 text-sm md:text-base text-white/90 font-semibold">
          {descriptionHook}
        </p>

        {/* Body */}
        <p className="mt-3 text-sm text-white/80 font-normal leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom row */}
      <div className="relative z-10 mt-6 flex items-center justify-between">
        {slug ? (
          <span className="text-sm font-semibold text-green-200 group-hover:text-white transition">
            Learn more →
          </span>
        ) : (
          <span className="text-sm font-semibold text-white/80">
            Learn more →
          </span>
        )}

        <span className="text-xs text-white/70">
          Fast quotes • Reliable scheduling
        </span>
      </div>
    </div>
  );

  // Wrap in Link when slug exists
  return href ? (
    <Link
      href={href}
      className="block focus:outline-none focus:ring-2 focus:ring-green-300 rounded-2xl"
      aria-label={`View ${title}`}
    >
      {CardContent}
    </Link>
  ) : (
    CardContent
  );
};

export default ServiceCard;