import React from "react";

type ServiceItem = {
  label?: string;
  value?: string;
  quantity?: number | string;
  unit_price?: number | string;
};

type ImageItem = {
  url?: string;
} | string;

type Props = {
  quoteUuid?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  landline?: string;
  email?: string;
  message?: string;
  services?: ServiceItem[];
  images?: ImageItem[];
  employeeLink?: string;
  address?: string;
};

const SendQuoteToBusinessPreview = ({
  quoteUuid,
  firstName,
  lastName,
  mobile,
  landline,
  email,
  message,
  services = [],
  images = [],
  employeeLink,
  address,
}: Props) => {
  const safeFullName =
    `${firstName || ""} ${lastName || ""}`.trim() || "—";

  const detailsRows = [
    ["Quote ID", quoteUuid || "—"],
    ["Customer", safeFullName],
    ["Address", address || "—"],
    ["Mobile", mobile || "—"],
    ["Landline", landline || "—"],
    ["Email", email || "—"],
    ["Message", message || "—"],
  ];

  return (
    <div
      style={{
        margin: 0,
        padding: "20px",
        background: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        style={{ background: "#f5f5f5" }}
      >
        <tbody>
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="720"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{
                  width: "100%",
                  maxWidth: "720px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        background: "#14532D",
                        padding: "20px",
                        borderRadius: "10px 10px 0 0",
                      }}
                    >
                      <table
                        role="presentation"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                verticalAlign: "middle",
                                color: "#ffffff",
                                fontSize: "36px",
                                fontWeight: "bold",
                                lineHeight: 1,
                              }}
                            >
                              H
                            </td>

                            <td
                              style={{
                                verticalAlign: "middle",
                                padding: "0 2px",
                              }}
                            >
                              <img
                                src="/images/happy-house-1.png"
                                alt="Happy Property Logo"
                                width={64}
                                height={64}
                                style={{
                                  display: "block",
                                  width: "64px",
                                  height: "64px",
                                }}
                              />
                            </td>

                            <td
                              style={{
                                verticalAlign: "middle",
                                color: "#ffffff",
                                fontSize: "36px",
                                fontWeight: "bold",
                                lineHeight: 1,
                              }}
                            >
                              ppy Property
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: "20px" }}>
                      <h2
                        style={{
                          margin: "0 0 16px 0",
                          color: "#064e3b",
                          fontSize: "24px",
                          lineHeight: 1.3,
                        }}
                      >
                        New Quote Request
                      </h2>

                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          tableLayout: "fixed",
                          marginBottom: "20px",
                        }}
                      >
                        <tbody>
                          {detailsRows.map(([label, value], index) => (
                            <tr key={`${label}-${index}`}>
                              <td
                                style={{
                                  padding: "4px 6px",
                                  fontWeight: "bold",
                                  fontSize: "13px",
                                  lineHeight: "1.25",
                                  width: "30%",
                                  background: "#f9fafb",
                                  border: "1px solid #d1d5db",
                                  verticalAlign: "top",
                                }}
                              >
                                {label}
                              </td>
                              <td
                                style={{
                                  padding: "4px 6px",
                                  fontSize: "13px",
                                  lineHeight: "1.25",
                                  border: "1px solid #d1d5db",
                                  verticalAlign: "top",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          color: "#064e3b",
                          fontSize: "18px",
                        }}
                      >
                        Requested Services
                      </h3>

                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          tableLayout: "fixed",
                          marginBottom: "20px",
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                padding: "7px 8px",
                                textAlign: "left",
                                color: "#ffffff",
                                background: "#15803D",
                                border: "1px solid #15803D",
                                fontSize: "13px",
                                lineHeight: "1.2",
                              }}
                            >
                              Service
                            </th>
                            <th
                              style={{
                                padding: "7px 8px",
                                textAlign: "center",
                                color: "#ffffff",
                                background: "#15803D",
                                border: "1px solid #15803D",
                                fontSize: "13px",
                                lineHeight: "1.2",
                                width: "70px",
                              }}
                            >
                              Qty
                            </th>
                            <th
                              style={{
                                padding: "7px 8px",
                                textAlign: "right",
                                color: "#ffffff",
                                background: "#15803D",
                                border: "1px solid #15803D",
                                fontSize: "13px",
                                lineHeight: "1.2",
                                width: "90px",
                              }}
                            >
                              Unit
                            </th>
                            <th
                              style={{
                                padding: "7px 8px",
                                textAlign: "right",
                                color: "#ffffff",
                                background: "#15803D",
                                border: "1px solid #15803D",
                                fontSize: "13px",
                                lineHeight: "1.2",
                                width: "90px",
                              }}
                            >
                              Total
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {services.length > 0 ? (
                            services.map((service, index) => {
                              const qty = Number(service.quantity ?? 1);
                              const unit = Number(service.unit_price ?? 0);
                              const lineTotal = qty * unit;

                              return (
                                <tr key={index}>
                                  <td
                                    style={{
                                      padding: "6px 8px",
                                      border: "1px solid #d1d5db",
                                      fontSize: "13px",
                                      lineHeight: "1.25",
                                      verticalAlign: "top",
                                    }}
                                  >
                                    {service.label || service.value || "—"}
                                  </td>
                                  <td
                                    style={{
                                      padding: "6px 8px",
                                      textAlign: "center",
                                      border: "1px solid #d1d5db",
                                      fontSize: "13px",
                                      lineHeight: "1.25",
                                      verticalAlign: "top",
                                    }}
                                  >
                                    {qty}
                                  </td>
                                  <td
                                    style={{
                                      padding: "6px 8px",
                                      textAlign: "right",
                                      border: "1px solid #d1d5db",
                                      fontSize: "13px",
                                      lineHeight: "1.25",
                                      verticalAlign: "top",
                                    }}
                                  >
                                    ${unit.toFixed(2)}
                                  </td>
                                  <td
                                    style={{
                                      padding: "6px 8px",
                                      textAlign: "right",
                                      border: "1px solid #d1d5db",
                                      fontSize: "13px",
                                      lineHeight: "1.25",
                                      verticalAlign: "top",
                                    }}
                                  >
                                    ${lineTotal.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                style={{
                                  padding: "8px",
                                  textAlign: "center",
                                  border: "1px solid #d1d5db",
                                  fontSize: "13px",
                                }}
                              >
                                No services provided
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {images.length > 0 && (
                        <>
                          <h3
                            style={{
                              margin: "0 0 8px 0",
                              color: "#064e3b",
                              fontSize: "18px",
                            }}
                          >
                            Images
                          </h3>

                          <table
                            role="presentation"
                            cellPadding={0}
                            cellSpacing={0}
                            border={0}
                            style={{ marginBottom: "20px" }}
                          >
                            <tbody>
                              <tr>
                                {images.map((img, index) => {
                                  const url =
                                    typeof img === "string" ? img : img?.url;

                                  if (!url) return null;

                                  return (
                                    <td
                                      key={index}
                                      align="left"
                                      style={{ padding: "0 10px 10px 0" }}
                                    >
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ textDecoration: "none" }}
                                      >
                                        <img
                                          src={url}
                                          width={60}
                                          height={60}
                                          style={{
                                            display: "block",
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "6px",
                                            border: "1px solid #d1d5db",
                                            objectFit: "cover",
                                          }}
                                          alt="Quote image"
                                        />
                                      </a>
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </>
                      )}

                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          width: "100%",
                          borderTop: "1px solid #d1d5db",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                paddingTop: "16px",
                                fontSize: "14px",
                                lineHeight: 1.5,
                              }}
                            >
                              <strong>Manage Quote:</strong>
                              <br />
                              <a
                                href={employeeLink || "#"}
                                style={{
                                  color: "#064e3b",
                                  wordBreak: "break-all",
                                  textDecoration: "underline",
                                }}
                              >
                                {employeeLink || "—"}
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SendQuoteToBusinessPreview;