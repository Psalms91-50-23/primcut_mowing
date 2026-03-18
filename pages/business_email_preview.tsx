import SendQuoteToBusinessPreview from "../components/SendQuoteToBusinessPreview";

export default function business_email_preview() {
  return (
    <SendQuoteToBusinessPreview
      quoteUuid="Q-1001"
      firstName="Kho"
      lastName="Thach"
      mobile="021 123 4567"
      landline="04 123 4567"
      email="test@example.com"
      message="Please quote for lawn mowing and weed spraying."
      address="123 Example Street, Wellington"
      employeeLink="https://example.com/quotes/Q-1001"
      services={[
        {
          label: "Lawn Mowing",
          quantity: 2,
          unit_price: 45,
        },
        {
          label: "Weed Spraying",
          quantity: 1,
          unit_price: 30,
        },
      ]}
      images={[
        "https://via.placeholder.com/300",
        { url: "https://via.placeholder.com/301" },
      ]}
    />
  );
}