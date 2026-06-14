type RecurrenceFrequency =
  | "one_off"
  | "weekly"
  | "fortnightly"
  | "monthly";

type Option = {
  value: RecurrenceFrequency;
  label: string;
  description: string;
};

type RecurrenceSelectorProps = {
  value: RecurrenceFrequency;
  options: Option[];
  onChange: (value: RecurrenceFrequency) => void;
};

export default function RecurrenceSelector({
  value,
  options,
  onChange,
}: RecurrenceSelectorProps) {
  return (
    <div>
      <label className="block font-medium mb-2 py-2">
        How often would you like the service?
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`rounded border px-4 py-3 bg-white transition hover:cursor-pointer ${
                isSelected
                  ? "border-green-700 ring-1 ring-green-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="recurrenceFrequency"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onChange(option.value)}
                  className="mt-1 hover:cursor-pointer"
                />

                <div className="flex flex-col">
                  <span className="font-medium text-sm sm:text-base">
                    {option.label}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {option.description}
                  </span>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <p className="text-xs italic text-gray-600 pt-2">
        Choose one-off for a single visit, or select a recurring option for
        regular ongoing work.
      </p>
    </div>
  );
}