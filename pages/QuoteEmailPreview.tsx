import React from "react";
import  QuoteEmailPreview  from "../components/QuoteEmailPreview";
const formatMoney = (value: number | string | undefined | null) =>
  Number(value || 0).toFixed(2);

type Service = {
  label?: string;
  unit_price?: number;
  quantity?: number;
};

type QuoteImage = {
  url?: string;
  label?: string;
};

type QuoteEmailPreviewProps = {
  data: {
    quoteUUID: string;
    name: string;
    mobile?: string;
    landline?: string;
    message?: string;
    email?: string;
    subtotal?: number;
    gst?: number;
    total?: number;
    services?: Service[];
    images?: QuoteImage[];
    quoteLink?: string;
    expiry?: string;
    employer_message?: string;
  };
};

const previewData = {
  quoteUUID: "QR123456",
  name: "John Smith",
  mobile: "021 123 4567",
  landline: "04 123 4567",
  message: "Please quote for lawn mowing.",
  email: "john@example.com",
  subtotal: 150,
  gst: 22.5,
  total: 172.5,
  expiry: "25 March 2026",
  employer_message: "Thanks for your enquiry.",
  quoteLink: "https://example.com/quotes/view/QR123?token=abc",
  services: [
    { label: "Lawn Mowing", unit_price: 60, quantity: 1 },
    { label: "Hedge Trimming", unit_price: 45, quantity: 2 },
  ],
  images: [],
};
export default function QuoteEmailPreviewPage() {
  const previewData = {
    quoteUUID: "QR123456",
    name: "John Smith",
    mobile: "021 123 4567",
    landline: "04 123 4567",
    message: "Please quote for lawn mowing and hedge trimming.",
    email: "john@example.com",
    subtotal: 150,
    gst: 22.5,
    total: 172.5,
    expiry: "25 March 2026",
    employer_message: "Thanks for your enquiry. Please review the quote below.",
    quoteLink: "https://example.com/quotes/view/QR123456?token=abc123",
    services: [
      { label: "Lawn Mowing", unit_price: 60, quantity: 1 },
      { label: "Hedge Trimming", unit_price: 45, quantity: 2 },
    ],
    images: [
      { url: "/images/about_us_1.png", label: "Front yard" },
      { url: "/images/about_us_1.png", label: "Back yard" },
    ],
  };

  return <QuoteEmailPreview data={previewData} />;
}