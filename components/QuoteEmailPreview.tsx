import React from "react";

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
  data?: {
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

export default function QuoteEmailPreview({
  data,
}: QuoteEmailPreviewProps) {
  if (!data) {
    return <div style={{ padding: 20 }}>No preview data provided</div>;
  }

  const {
    quoteUUID,
    name,
    mobile,
    landline,
    message,
    email,
    subtotal,
    gst,
    total,
    services = [],
    images = [],
    quoteLink,
    expiry,
    employer_message,
  } = data;

  const safeSubtotal = Number(subtotal || 0);
  const safeGST = Number(gst || 0);
  const safeTotal = Number(total || 0);

  const detailsRows = [
    ["Quote ID", quoteUUID],
    ["Customer", name],
    ...(mobile ? [["Mobile", mobile]] : []),
    ...(landline ? [["Landline", landline]] : []),
    ["Email", email || "-"],
    ...(message ? [["Message", message]] : []),
  ];

  return (
    <div
      style={{
        background: "#f3f4f6",
        padding: "32px 16px",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#ffffff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            background: "#14532D",
            padding: "20px 24px",
            textAlign: "left",
          }}
        >
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td
                  style={{
                    color: "#ffffff",
                    fontSize: "36px",
                    fontWeight: 700,
                    verticalAlign: "middle",
                    lineHeight: 1,
                  }}
                >
                  H
                </td>
                <td style={{ verticalAlign: "middle", padding: "0 0" }}>
                  <img
                    src="/images/happy-house-1.png"
                    alt="Happy Property Logo"
                    style={{ width: "56px", height: "56px", display: "block" }}
                  />
                </td>
                <td
                  style={{
                    color: "#ffffff",
                    fontSize: "36px",
                    fontWeight: 700,
                    verticalAlign: "middle",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  ppy Property
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ padding: "24px", background: "#ffffff" }}>
          <h2
            style={{
              color: "#065f46",
              marginTop: 0,
              marginBottom: "16px",
              fontSize: "26px",
            }}
          >
            Your Quote is Ready
          </h2>

          <p style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
            <span style={{ fontSize: "24px" }}>👋</span> Hi {name},
          </p>

          <p style={{ margin: "0 0 20px 0", fontSize: "16px" }}>
            Your quote is valid until <strong>{expiry}</strong>.
          </p>

          {employer_message ? (
            <div
              style={{
                margin: "20px 0",
                padding: "16px",
                borderLeft: "4px solid #15803D",
                background: "#f0fdf4",
                borderRadius: "6px",
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: "#14532d" }}>
                Message from our team
              </p>
              <p
                style={{
                  marginTop: "8px",
                  marginBottom: 0,
                  color: "#374151",
                  whiteSpace: "pre-line",
                }}
              >
                {employer_message}
              </p>
            </div>
          ) : null}

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <tbody>
              {detailsRows.map(([label, value]) => (
                <tr key={String(label)}>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontWeight: 700,
                      width: "35%",
                      background: "#f9fafb",
                      border: "1px solid #eee",
                      verticalAlign: "top",
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      border: "1px solid #eee",
                    }}
                  >
                    {value ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "20px" }}>
            Services
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <thead>
              <tr style={{ background: "#15803D", color: "#fff" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Service</th>
                <th style={{ padding: "10px", textAlign: "center" }}>
                  Unit Price
                </th>
                <th style={{ padding: "10px", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {services.length > 0 ? (
                services.map((s, i) => {
                  const unitPrice = Number(s.unit_price || 0);
                  const qty = Number(s.quantity || 1);
                  const lineTotal = unitPrice * qty;

                  return (
                    <tr
                      key={`${s.label || "service"}-${i}`}
                      style={{
                        background: i % 2 === 0 ? "#f0fdf4" : "#dcfce7",
                      }}
                    >
                      <td style={{ padding: "12px", textAlign: "left" }}>
                        {s.label || "Service"}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        ${formatMoney(unitPrice)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {qty}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        ${formatMoney(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "14px",
                      border: "1px solid #eee",
                    }}
                  >
                    No services provided
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {images.length > 0 ? (
            <>
              <h3
                style={{ marginTop: 0, marginBottom: "12px", fontSize: "20px" }}
              >
                Images
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {images.map((img, i) => (
                  <a
                    key={`${img.url || "image"}-${i}`}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <img
                      src={img.url}
                      alt={img.label || `Quote Image ${i + 1}`}
                      style={{
                        width: "60px",
                        height: "60px",
                        display: "block",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        objectFit: "cover",
                      }}
                    />
                  </a>
                ))}
              </div>
            </>
          ) : null}

          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "6px 0" }}>
              <strong>Subtotal:</strong> ${formatMoney(safeSubtotal)}
            </p>
            <p style={{ margin: "6px 0" }}>
              <strong>GST (15%):</strong> ${formatMoney(safeGST)}
            </p>
            <p style={{ margin: "6px 0", fontSize: "18px" }}>
              <strong>Total:</strong> ${formatMoney(safeTotal)}
            </p>
          </div>

          <div style={{ padding: "10px 0 0 0" }}>
            <a
              href={quoteLink}
              style={{
                background: "#10b981",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-block",
                fontWeight: 700,
              }}
            >
              View &amp; Respond to Quote
            </a>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#888",
              paddingTop: "16px",
              marginBottom: "8px",
            }}
          >
            If the button doesn't work, copy and paste this link into your
            browser:
          </p>

          <p
            style={{
              fontSize: "12px",
              wordBreak: "break-all",
              padding: "0 0 8px 0",
              margin: 0,
            }}
          >
            {quoteLink}
          </p>
        </div>
      </div>
    </div>
  );
}