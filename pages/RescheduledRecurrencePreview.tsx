import React from "react";

type Service = {
  label?: string;
  quantity?: number;
};

type RescheduledRecurrencePreviewData = {
  jobUUID?: string;
  recurrenceUUID?: string;
  recurrenceId?: string | number | null;
  customerName?: string;
  customerEmail?: string;
  mobile?: string;
  address?: string;
  services?: Service[];
  previousScheduledAt?: string | Date | null;
  previousScheduledWindowMins?: number | null;
  scheduledAt?: string | Date | null;
  scheduledWindowMins?: number | null;
  customMessage?: string | null;
  dashboardLink?: string;
  reasonLabel?: string | null;
};

function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(d);
}

function buildArrivalWindow(
  startISO?: string | Date | null,
  mins?: number | null
) {
  if (!startISO) return "-";

  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) return "-";

  const safeMins = Number.isInteger(mins) && Number(mins) > 0 ? Number(mins) : 180;
  const end = new Date(start.getTime() + safeMins * 60 * 1000);

  const fmt = new Intl.DateTimeFormat("en-NZ", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export default function RescheduledRecurrencePreview() {
  const data: RescheduledRecurrencePreviewData = {
    jobUUID: "I7oltwgh1",
    recurrenceUUID: "JRzz9nwXe",
    recurrenceId: 1,
    customerName: "John Smith",
    customerEmail: "john@example.com",
    mobile: "021 123 4567",
    address: "123 Example Street, Lower Hutt",
    services: [
      { label: "Lawn Mowing", quantity: 1 },
      { label: "Edge Trimming", quantity: 1 },
    ],
    previousScheduledAt: "2026-04-15T22:00:00.000Z",
    previousScheduledWindowMins: 180,
    scheduledAt: "2026-04-17T22:00:00.000Z",
    scheduledWindowMins: 180,
    customMessage:
      "Due to wet weather conditions, we’ve moved this visit to the next available suitable day. Thank you for your understanding.",
    dashboardLink: "#",
    reasonLabel: "Weather delay",
  };

  const previousDateTime = formatDateTime(data.previousScheduledAt);
  const previousWindow = buildArrivalWindow(
    data.previousScheduledAt,
    data.previousScheduledWindowMins
  );

  const newDateTime = formatDateTime(data.scheduledAt);
  const newWindow = buildArrivalWindow(
    data.scheduledAt,
    data.scheduledWindowMins
  );

  const details: Array<[string, string | number]> = [
    ...(data.jobUUID ? [["Job #", data.jobUUID] as [string, string]] : []),
    ...(data.recurrenceUUID
      ? [["Recurrence UUID", data.recurrenceUUID] as [string, string]]
      : []),
    ...(data.recurrenceId
      ? [["Recurrence ID", String(data.recurrenceId)] as [string, string]]
      : []),
    ["Customer", data.customerName || "Customer"],
    ...(data.mobile ? [["Mobile", data.mobile] as [string, string]] : []),
    ...(data.customerEmail ? [["Email", data.customerEmail] as [string, string]] : []),
    ...(data.address ? [["Address", data.address] as [string, string]] : []),
    ["Previous scheduled time", previousDateTime],
    ["Previous arrival window", previousWindow],
    ["New scheduled time", newDateTime],
    ["New arrival window", newWindow],
    ...(data.reasonLabel ? [["Reason", data.reasonLabel] as [string, string]] : []),
    ["Status", "Rescheduled"],
  ];

  return (
    <div
      style={{
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "24px auto",
          color: "#1f2937",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            background: "#14532D",
            padding: 20,
            borderRadius: "10px 10px 0 0",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: 28,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 36 }}>H</span>
            <img
              src="/images/happy-house-1.png"
              alt="Happy Property Logo"
              style={{ width: 64, height: 64, marginLeft: -2 }}
            />
            <span style={{ fontSize: 36 }}>ppy Property</span>
          </h1>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: 24,
            borderRadius: "0 0 10px 10px",
            border: "1px solid #e5e7eb",
            borderTop: "none",
          }}
        >
          <h2 style={{ color: "#065f46", marginTop: 0, fontSize: "1.5rem", fontWeight: "bold" }}>Schedule Updated</h2>

          <p>
            <span style={{ fontSize: "1.5rem" }}>👋</span> Hi{" "}
            {data.customerName || "Customer"},
          </p>

          <p>
            We wanted to let you know that your scheduled service has been{" "}
            <strong>rescheduled</strong>.
          </p>

          <p>
            This can sometimes happen due to weather conditions, site access
            issues, safety concerns, staffing availability, or other operational
            reasons. We appreciate your understanding.
          </p>

          {data.customMessage ? (
            <div
              style={{
                margin: "20px 0",
                padding: "14px 16px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontWeight: "bold",
                  color: "#166534",
                }}
              >
                Message from our team
              </p>
              <p
                style={{
                  margin: 0,
                  whiteSpace: "pre-line",
                  color: "#1f2937",
                }}
              >
                {data.customMessage}
              </p>
            </div>
          ) : null}

          <h3 style={{ marginTop: 24, padding: "1rem 0", fontSize: "1.2rem", fontWeight: "bold" }}>Updated Schedule Details</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 20,
            }}
          >
            <tbody>
              {details.map(([label, value]) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontWeight: "bold",
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
                    {value || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{
              width: "100%",
              borderCollapse: "collapse",
              padding: "1rem 0",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}>Services</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 20,
            }}
          >
            <thead>
              <tr style={{ background: "#15803D", color: "#fff" }}>
                <th style={{ padding: 10, textAlign: "left" }}>Service</th>
                <th style={{ padding: 10, textAlign: "center" }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {(data.services || []).length > 0 ? (
                (data.services || []).map((s, i) => (
                  <tr
                    key={`${s.label || "service"}-${i}`}
                    style={{
                      background: i % 2 === 0 ? "#f0fdf4" : "#dcfce7",
                    }}
                  >
                    <td style={{ padding: 12, textAlign: "left" }}>
                      {s.label || "Service"}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      {Number(s.quantity || 1)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ padding: 12, textAlign: "center" }}>
                    No services listed
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div
            style={{
              padding: 16,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              background: "#fafafa",
              marginBottom: 20,
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>New scheduled date:</strong> {newDateTime}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Arrival window:</strong> {newWindow}
            </p>
          </div>

          {data.dashboardLink ? (
            <div style={{ marginTop: 24 }}>
              <a
                href={data.dashboardLink}
                style={{
                  display: "inline-block",
                  background: "#166534",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 8,
                  fontWeight: "bold",
                }}
              >
                View Updated Schedule
              </a>
            </div>
          ) : null}

          <p
            style={{
              marginTop: 24,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            If you have any questions, simply reply to this email.
          </p>
        </div>
      </div>
    </div>
  );
}