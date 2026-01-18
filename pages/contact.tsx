import React, { useState, useEffect } from "react";

type Props = {};

const Contact: React.FC<Props> = () => {
  // State for form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // State for submission status
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const data = { name, phone, email, message };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setPhone("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  // Optional: reset status message after 3 seconds
  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => setStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-green-50 text-black">
      <div className="max-w-md">
        <div className="mt-10 text-center space-y-2 px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl italic font-bold md:text-base text-gray-700 mb-4">
            Our team strives to reply to all messages within 2 business working days.
          </p>
          <p className="text-lg">
            <span className="font-semibold">Phone:</span> 021 123 4567
          </p>
          <p className="text-lg">
            <span className="font-semibold">Email:</span> contact@primcut.co.nz
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
              id="name"
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="Enter your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block font-medium mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="Enter your phone number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border px-3 py-2 rounded"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="message" className="block font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              className="w-full border px-3 py-2 rounded resize-none overflow-y-auto overflow-x-hidden"
              placeholder="Write your message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 hover:cursor-pointer transition"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>

          {status === "success" && (
            <p className="text-green-700 mt-2 text-center">Message sent successfully!</p>
          )}
          {status === "error" && (
            <p className="text-red-700 mt-2 text-center">Failed to send message. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Contact;
