type ServiceOption = {
  uuid: string;
  code: string;
  label: string;
  description?: string | null;
  category?: string | null;
  requires_images?: boolean;
  urgent_allowed?: boolean;
  selected: boolean;
};

type ServiceSelectorProps = {
  services: ServiceOption[];
  categories: string[];
  filteredServices: ServiceOption[];
  selectedServices: ServiceOption[];
  selectedServicesCount: number;
  countsByCategory: Record<string, number>;
  activeServiceCategory: string;
  isLoadingServices: boolean;
  shouldServicesScroll: boolean;
  onCategoryChange: (category: string) => void;
  onServiceChange: (serviceUuid: string) => void;
  onClearAll: () => void;
  formatCategoryLabel: (category: string) => string;
};

export default function ServiceSelector({
  services,
  categories,
  filteredServices,
  selectedServices,
  selectedServicesCount,
  countsByCategory,
  activeServiceCategory,
  isLoadingServices,
  shouldServicesScroll,
  onCategoryChange,
  onServiceChange,
  onClearAll,
  formatCategoryLabel,
}: ServiceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-lg py-1 block">Select Services</label>
        <p className="text-sm text-gray-600">
          Selected services stay at the top and can be removed without scrolling.
        </p>
      </div>

      {isLoadingServices ? (
        <div className="text-sm text-gray-600">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="text-sm text-red-600">
          No services available right now.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = cat === activeServiceCategory;

              const hasSelectedInCategory =
                cat === "all"
                  ? selectedServices.length > 0
                  : services.some(
                      (service) => service.category === cat && service.selected
                    );

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-semibold transition border hover:cursor-pointer",
                    active
                      ? "bg-green-700 text-white border-green-700 shadow"
                      : hasSelectedInCategory
                      ? "bg-green-50 text-green-800 border-green-300"
                      : "bg-white text-gray-800 border-gray-200 hover:border-green-300 hover:ring-2 hover:ring-green-200",
                  ].join(" ")}
                >
                  {cat === "all" ? "All Services" : formatCategoryLabel(cat)}
                  <span className="ml-2 opacity-80">
                    ({countsByCategory[cat] || 0})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3">
            <div className="text-sm font-medium text-gray-700">
              {selectedServicesCount > 0
                ? `${selectedServicesCount} service${
                    selectedServicesCount > 1 ? "s" : ""
                  } selected`
                : "Choose one or more services"}
            </div>

            {selectedServicesCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline hover:cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {selectedServicesCount > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
              <p className="text-xs font-semibold text-green-800 mb-2">
                Selected services
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedServices
                  .slice()
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((service) => (
                    <button
                      key={service.uuid}
                      type="button"
                      onClick={() => onServiceChange(service.uuid)}
                      className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 hover:cursor-pointer"
                    >
                      <span>{service.label}</span>
                      <span className="text-xs">✕</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {filteredServices.length === 0 ? (
            <div className="rounded border bg-gray-50 p-6 text-center text-sm text-gray-600">
              No services found in this category.
            </div>
          ) : (
            <div
              className={`rounded-xl border border-gray-200 bg-white/60 p-2 ${
                shouldServicesScroll
                  ? "max-h-[34rem] overflow-y-auto pr-1"
                  : "overflow-visible"
              }`}
            >
              <div className="grid grid-cols-1 gap-3">
                {filteredServices.map((service) => {
                  const isSelected = service.selected;

                  return (
                    <button
                      key={service.uuid}
                      type="button"
                      onClick={() => onServiceChange(service.uuid)}
                      className={`w-full text-left rounded-xl border p-4 transition hover:cursor-pointer ${
                        isSelected
                          ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                          : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              isSelected ? "text-green-700" : "text-gray-600"
                            }`}
                          >
                            {formatCategoryLabel(service.category || "Other")}
                          </p>

                          <h3 className="text-base sm:text-lg font-bold mt-1 text-gray-900">
                            {service.label}
                          </h3>

                          {service.description && (
                            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                              {service.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            {service.requires_images && (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                Photos helpful
                              </span>
                            )}

                            {service.urgent_allowed && (
                              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                Urgent booking available
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold border ${
                            isSelected
                              ? "bg-green-700 text-white border-green-700"
                              : "bg-white text-gray-600 border-gray-300"
                          }`}
                        >
                          {isSelected ? "Selected" : "Click to select"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}