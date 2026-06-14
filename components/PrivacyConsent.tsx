type PrivacyConsentProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function PrivacyConsent({
  checked,
  onChange,
}: PrivacyConsentProps) {
  return (
    <div className="rounded border border-gray-200 bg-white px-4 py-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-green-700 cursor-pointer"
        />

        <span className="text-sm text-gray-700 leading-relaxed">
          By using our services, you agree that Happy Property may collect,
          store, and use your information for business purposes related to your
          enquiry, quote, booking, and service delivery. Read our{" "}
          <a
            href="/privacy-policies"
            className="text-green-700 font-semibold underline hover:text-green-900"
          >
            Privacy Policy
          </a>
          .
        </span>
      </label>
    </div>
  );
}