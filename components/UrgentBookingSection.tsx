type UrgentBookingSectionProps = {
  isUrgent: boolean;
  onUrgentChange: (checked: boolean) => void;
  hasSelectedServices: boolean;
  allSelectedAllowUrgent: boolean;
  hasMultipleSelectedServices: boolean;
  hasMixedUrgentEligibility: boolean;
  urgentFeeAmount: number;
};

export default function UrgentBookingSection({
  isUrgent,
  onUrgentChange,
  hasSelectedServices,
  allSelectedAllowUrgent,
  hasMultipleSelectedServices,
  hasMixedUrgentEligibility,
  urgentFeeAmount,
}: UrgentBookingSectionProps) {
  return (
    <>
      {hasSelectedServices && allSelectedAllowUrgent && (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-4 space-y-3">
          <label
            className={`flex items-start gap-3 ${
              hasMultipleSelectedServices
                ? "cursor-not-allowed opacity-80"
                : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => onUrgentChange(e.target.checked)}
              disabled={hasMultipleSelectedServices}
              className="mt-1 h-4 w-4 shrink-0 accent-amber-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />

            <div className="flex flex-col">
              <span className="font-medium text-sm sm:text-base text-amber-900">
                Request urgent priority booking
              </span>

              <span className="text-xs sm:text-sm text-amber-800">
                Urgent service is available for selected maintenance services
                and includes an additional{" "}
                <strong>${urgentFeeAmount} + GST</strong> priority fee.
              </span>
            </div>
          </label>

          {hasMultipleSelectedServices ? (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Only 1 urgent request can be done per job. Please select one
              service only to request urgent priority booking.
            </div>
          ) : isUrgent ? (
            <div className="text-xs text-amber-900 italic space-y-1">
              <p>
                Urgent requests are prioritised and scheduled as soon as
                possible, subject to availability.
              </p>
              <p>
                The urgent fee will be included in your quote total before
                acceptance.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {hasMixedUrgentEligibility && (
        <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Urgent booking is only available when all selected services are
          urgent-eligible. For lawn care or mixed bookings, please submit a
          separate request if you need urgent maintenance work.
        </div>
      )}
    </>
  );
}