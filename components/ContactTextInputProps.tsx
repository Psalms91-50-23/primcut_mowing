type ContactTextInputProps = {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ContactTextInput({
  label,
  name,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}: ContactTextInputProps) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium mb-1 py-2">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        autoComplete="off"
        value={value}
        onChange={onChange}
        className="input-border w-full border px-3 py-2 rounded bg-white"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}