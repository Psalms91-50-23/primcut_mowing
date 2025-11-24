import React from "react";
import NavBar from "../components/NavBar";

type Props = {};

const Contact: React.FC<Props> = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Message sent successfully!");
        form.reset();
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-start bg-green-50 text-black">
      <NavBar />

      <div className="mt-10 text-center space-y-2 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg">
          <span className="font-semibold">Phone:</span> 021 123 4567
        </p>
        <p className="text-lg">
          <span className="font-semibold">Email:</span> contact@primcutmowing.co.nz
        </p>
        <p className="text-lg">
          <span className="font-semibold">Address:</span> PO Box 12345, Lower Hutt, NZ
        </p>
        <p className="text-lg">
          <span className="font-semibold">Hours:</span> Mon–Fri, 8am – 5pm
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded shadow space-y-4 mt-10"
      >
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
            Full Name
          </label>
          <input
            name="name"
            type="text"
            id="name"
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block font-medium mb-1">
            Phone Number
          </label>
          <input
            name="phone"
            type="text"
            id="phone"
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            id="email"
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block font-medium mb-1">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            className="w-full border px-3 py-2 rounded"
            placeholder="Write your message"
            rows={4}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 hover:cursor-pointer transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
