import React from "react";

export default function SendQuoteToBusinessPreview() {
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
          <td style="text-align: left; padding: 10px; border: 1px solid #d1d5db; ">
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
          <a href="${url}" target="_blank" style="text-decoration:none;">
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
    <html>
    <body style="margin:0; padding:20px; background:#f5f5f5; font-family:Arial, sans-serif; color:#1f2937;">
      
      <table width="100%" style="background:#f5f5f5;">
        <tr>
          <td align="center">
            <table
              width="720"
              style="width:100%; max-width:720px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px;"
            >
              <tr>
                <td style="background:#14532D; padding:16px;">
                  <table>
                    <tr>
                      <td style="color:#ffffff; font-size:27px; font-weight:bold;">H</td>

                      <td style="padding:0 0px;">
                        <img
                          src="http://localhost:3000/images/happy-house-1.png"
                          width="44"
                          height="44"
                        />
                      </td>

                      <td style="color: #ffffff; font-size:27px; font-weight:bold;">
                        ppy Property
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:16px;">
                  <h2 style="color:#064e3b; margin:0 0 10px 0; font-size:18px;line-height:1.3;">New Quote Request</h2>

                  <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
                    ${detailsRowsHtml}
                  </table>

                  <h3 style="color:#064e3b; margin:0 0 8px 0;">Requested Services</h3>

                  <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
                    <thead>
                      <tr>
                        <th style="background:#15803D; color:white; padding:10px; text-align: left;">Service</th>
                        <th style="background:#15803D; color:white; padding:10px;">Qty</th>
                        <th style="text-align: center; background: #15803D; color:white; padding:10px;">Unit</th>
                        <th style="text-align: right; background:#15803D; color:white; padding:10px;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${
                        servicesRowsHtml ||
                        `<tr><td colspan="4">No services</td></tr>`
                      }
                    </tbody>
                  </table>

                  ${
                    imagesHtml.length > 0
                      ? `
                      <h3 style="color:#064e3b;">Images</h3>
                      <table><tr>${imagesHtml}</tr></table>
                    `
                      : ""
                  }

                  <p>
                    <strong>Manage Quote:</strong><br/>
                    <a href="${previewData.employeeLink}">
                      ${previewData.employeeLink}
                    </a>
                  </p>
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
    <div style={{ padding: 20, background: "#e5e7eb", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}