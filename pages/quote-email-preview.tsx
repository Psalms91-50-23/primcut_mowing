import React from "react";

export default function QuoteEmailPreview() {
  const previewData = {
    quoteUuid: "QR8JqCxgU",
    firstName: "Kho",
    lastName: "Thach",
    mobile: "021 123 4567",
    landline: "04 555 1234",
    email: "customer@example.com",
    message: "Hi, I would like a quote for lawn mowing and hedge trimming.",
    address: "123 Example Street, Wellington",
    employeeLink: "http://localhost:3000/employee/quotes/QR8JqCxgU",
    services: [
      {
        label: "Lawn Mowing",
        value: "lawn-mowing",
        quantity: 2,
        unit_price: 45,
      },
      {
        label: "Hedge Trimming",
        value: "hedge-trimming",
        quantity: 1,
        unit_price: 80,
      },
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80",
      },
      {
        url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=300&q=80",
      },
    ],
  };

  const safeFullName =
    `${previewData.firstName || ""} ${previewData.lastName || ""}`.trim() || "—";

  const servicesRowsHtml = (previewData.services || [])
    .map((service) => {
      const qty = Number(service.quantity ?? 1);
      const unit = Number(service.unit_price ?? 0);
      const lineTotal = qty * unit;

      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #d1d5db;">
            ${service.label || service.value || "—"}
          </td>
          <td style="padding: 10px; text-align: center; border: 1px solid #d1d5db;">
            ${qty}
          </td>
          <td style="padding: 10px; text-align: center; border: 1px solid #d1d5db;">
            $${unit.toFixed(2)}
          </td>
          <td style="padding: 10px; text-align: right; border: 1px solid #d1d5db;">
            $${lineTotal.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  const imagesHtml = (previewData.images || [])
    .map((img) => {
      const url = img?.url || img;

      return `
        <td align="left" style="padding: 0 10px 10px 0;">
          <a href="${url}" target="_blank" rel="noreferrer" style="text-decoration:none;">
            <img
              src="${url}"
              width="60"
              height="60"
              style="display:block; width:60px; height:60px; border-radius:6px; border:1px solid #d1d5db; object-fit:cover;"
              alt="Quote image"
            />
          </a>
        </td>
      `;
    })
    .join("");

  const detailsRowsHtml = [
    ["Quote ID", previewData.quoteUuid || "—"],
    ["Customer", safeFullName],
    ["Address", previewData.address || "—"],
    ["Mobile", previewData.mobile || "—"],
    ["Landline", previewData.landline || "—"],
    ["Email", previewData.email || "—"],
    ["Message", previewData.message || "—"],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 10px;font-weight:bold;width:35%;background:#f9fafb;border:1px solid #eee;">
            ${label}
          </td>
          <td style="padding:8px 10px;border:1px solid #eee;">
            ${value}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Quote Request</title>
    </head>
    <body style="margin:0; padding:20px; background:#f5f5f5; font-family:Arial, sans-serif; color:#1f2937;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;">
        <tr>
          <td align="center">
            <table
              role="presentation"
              width="720"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="width:100%; max-width:720px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px;"
            >
              <tr>
                <td style="background:#14532D; padding:16px; border-radius:10px 10px 0 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle; color:#ffffff; font-size:27px; font-weight:bold; line-height:1;">
                        H
                      </td>

                      <td style="vertical-align:middle; padding:0 2px;">
                        <img
                          src="http://localhost:3000/images/happy-house-1.png"
                          alt="Happy Property Logo"
                          width="44"
                          height="44"
                          style="display:block; width:44px; height:44px;"
                        />
                      </td>

                      <td style="vertical-align:middle; color: #ffffff; font-size:27px; font-weight:bold; line-height:1;">
                        ppy Property
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:14px;">
                  <h2 style="margin:0 0 16px 0; color:#064e3b; font-size:18px; line-height:1.3;">
                    New Quote Request
                  </h2>

                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:20px;"
                  >
                    <tbody>
                      ${detailsRowsHtml}
                    </tbody>
                  </table>

                  <h3 style="margin:0 0 8px 0; color:#064e3b; font-size:18px;">
                    Requested Services
                  </h3>

                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:20px;"
                  >
                    <thead>
                      <tr>
                        <th style="padding:10px; text-align:left; color:#ffffff; background:#15803D; border:1px solid #15803D;">
                          Service
                        </th>
                        <th style="padding:10px; text-align:center; color:#ffffff; background:#15803D; border:1px solid #15803D;">
                          Qty
                        </th>
                        <th style="padding:10px; text-align: center; color:#ffffff; background:#15803D; border:1px solid #15803D;">
                          Unit
                        </th>
                        <th style="padding:10px; text-align:right; color:#ffffff; background:#15803D; border:1px solid #15803D;">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      ${
                        servicesRowsHtml ||
                        `
                        <tr>
                          <td colspan="4" style="padding:10px; text-align:center; border:1px solid #d1d5db;">
                            No services provided
                          </td>
                        </tr>
                      `
                      }
                    </tbody>
                  </table>

                  ${
                    imagesHtml.length > 0
                      ? `
                    <h3 style="margin:0 0 8px 0; color:#064e3b; font-size:18px;">
                      Images
                    </h3>
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin-bottom:20px;"
                    >
                      <tr>
                        ${imagesHtml}
                      </tr>
                    </table>
                  `
                      : ""
                  }

                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="width:100%; border-top:1px solid #d1d5db;"
                  >
                    <tr>
                      <td style="padding-top:16px; font-size:14px; line-height:1.5;">
                        <strong>Manage Quote:</strong><br />
                        <a
                          href="${previewData.employeeLink}"
                          style="color:#064e3b; word-break:break-all; text-decoration:underline;"
                        >
                          ${previewData.employeeLink}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return (
    <div style={{ minHeight: "100vh", background: "#e5e7eb", padding: "24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
          Quote Email Preview
        </h1>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid #d1d5db",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}