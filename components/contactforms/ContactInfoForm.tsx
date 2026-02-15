interface ContactInfoProps {
  contact: {
    firstName: string;
    lastName: string;
    mobile?: string;
    landline?: string;
    email?: string;
  };
  setContact: (field: string, value: string) => void;
}
const ContactInfoForm: React.FC<ContactInfoProps> = ({ contact, setContact }) => (
  <section className="mb-6 border-b border-gray-200 pb-4">
    <h2 className="text-xl font-semibold mb-2 text-gray-700">Contact Info</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <label className="flex flex-col w-full">
        First Name
        <input
          className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
          value={contact.firstName}
          onChange={(e) => setContact("firstName", e.target.value)}
        />
      </label>
      <label className="flex flex-col w-full">
        Last Name
        <input
          className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
          value={contact.lastName}
          onChange={(e) => setContact("lastName", e.target.value)}
        />
      </label>
      {contact.mobile && (
        <label className="flex flex-col w-full">
          Mobile
          <input
            type="text"
            className="border rounded px-2 py-1 w-full shadow-sm focus:ring-1 focus:ring-green-500"
            value={contact.mobile}
            onChange={(e) => setContact("mobile", e.target.value)}
          />
        </label>
      )}
      {contact.email && (
        <label className="flex flex-col w-full">
          Email
          <input
            type="email"
            className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
            value={contact.email}
            onChange={(e) => setContact("email", e.target.value)}
          />
        </label>
      )}
    </div>
  </section>
);

export default ContactInfoForm;