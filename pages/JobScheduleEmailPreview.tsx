import React from "react";

type Service = {
  label?: string;
  quantity?: number;
};

type JobSchedulePreviewData = {
  jobUUID?: string;
  recurrenceId?: string | number | null;
  customerName?: string;
  customerEmail?: string;
  mobile?: string;
  address?: string;
  services?: Service[];
  scheduledAt?: string | Date;
  scheduledWindowMins?: number;
  customMessage?: string;
  isRecurring?: boolean;
  recurrenceLabel?: string;
  dashboardLink?: string;
};

function formatDateTime(value?: string | Date) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function buildArrivalWindow(value?: string | Date, windowMins = 60) {
  if (!value) return "-";

  const start = new Date(value);
  if (Number.isNaN(start.getTime())) return "-";

  const end = new Date(start.getTime() + windowMins * 60 * 1000);

  const datePart = new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);

  const startTime = new Intl.DateTimeFormat("en-NZ", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start);

  const endTime = new Intl.DateTimeFormat("en-NZ", {
    hour: "numeric",
    minute: "2-digit",
  }).format(end);

  return `${datePart}, ${startTime} – ${endTime}`;
}

type Props = {
  subject?: string;
  data: JobSchedulePreviewData;
};

export function JobScheduleEmailPreview({
  subject = "Your Job Schedule Has Been Updated",
  data,
}: Props) {
  const {
    jobUUID,
    recurrenceId,
    customerName,
    customerEmail,
    mobile,
    address,
    services = [],
    scheduledAt,
    scheduledWindowMins,
    customMessage,
    isRecurring,
    recurrenceLabel,
    dashboardLink,
  } = data || {};

  const arrivalWindow = buildArrivalWindow(scheduledAt, scheduledWindowMins);
  const recurrenceText = isRecurring
    ? recurrenceLabel || "Recurring service"
    : "One-off service";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          maxWidth: 700,
          margin: "0 auto",
          color: "#1f2937",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "left",
            background: "#14532D",
            padding: 20,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 36, fontWeight: "bold" }}>H</span>

            <img
              src="/images/happy-house-1.png"
              alt="Happy Property Logo"
              style={{ width: 56, height: 56, display: "block", marginLeft: -8 }}
            />

            <span style={{ fontSize: 36, fontWeight: "bold", marginLeft: -8 }}>ppy Property</span>
          </h1>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: 24,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              marginTop: 0,
              marginBottom: 16,
            }}
          >
            Preview subject: <strong>{subject}</strong>
          </p>

          <h2 style={{ color: "#065f46", marginTop: 0 }}>
            Your Job Schedule Has Been Updated
          </h2>

          <p>
            <span style={{ fontSize: "1.5rem" }}>👋</span> Hi{" "}
            {customerName || "there"},
          </p>

          <p>
            We’ve scheduled your job and this is the latest expected arrival
            window.
          </p>

          {customMessage ? (
            <div
              style={{
                margin: "20px 0",
                padding: 16,
                borderLeft: "4px solid #15803D",
                background: "#f0fdf4",
                borderRadius: 6,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "#14532d",
                }}
              >
                Message from our team
              </p>

              <p
                style={{
                  marginTop: 8,
                  color: "#374151",
                  whiteSpace: "pre-line",
                }}
              >
                {customMessage}
              </p>
            </div>
          ) : null}

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "20px 0",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "8px 10px",
                    fontWeight: "bold",
                    width: "35%",
                    background: "#f9fafb",
                    border: "1px solid #eee",
                  }}
                >
                  Job ID
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                  }}
                >
                  {jobUUID || "-"}
                </td>
              </tr>

              {recurrenceId ? (
                <tr>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontWeight: "bold",
                      background: "#f9fafb",
                      border: "1px solid #eee",
                    }}
                  >
                    Recurrence
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      border: "1px solid #eee",
                    }}
                  >
                    #{recurrenceId}
                  </td>
                </tr>
              ) : null}

              <tr>
                <td
                  style={{
                    padding: "8px 10px",
                    fontWeight: "bold",
                    background: "#f9fafb",
                    border: "1px solid #eee",
                  }}
                >
                  Customer
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                  }}
                >
                  {customerName || "-"}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "8px 10px",
                    fontWeight: "bold",
                    background: "#f9fafb",
                    border: "1px solid #eee",
                  }}
                >
                  Email
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                  }}
                >
                  {customerEmail || "-"}
                </td>
              </tr>

              {mobile ? (
                <tr>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontWeight: "bold",
                      background: "#f9fafb",
                      border: "1px solid #eee",
                    }}
                  >
                    Mobile
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      border: "1px solid #eee",
                    }}
                  >
                    {mobile}
                  </td>
                </tr>
              ) : null}

              <tr>
                <td
                  style={{
                    padding: "8px 10px",
                    fontWeight: "bold",
                    background: "#f9fafb",
                    border: "1px solid #eee",
                  }}
                >
                  Address
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                  }}
                >
                  {address || "-"}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "8px 10px",
                    fontWeight: "bold",
                    background: "#f9fafb",
                    border: "1px solid #eee",
                  }}
                >
                  Service Type
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                  }}
                >
                  {recurrenceText}
                </td>
              </tr>

              <tr>
                <td
                  style={{
                    padding: "8px 10px",
                    fontWeight: "bold",
                    background: "#f9fafb",
                    border: "1px solid #eee",
                  }}
                >
                  Arrival Window
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                  }}
                >
                  {arrivalWindow}
                </td>
              </tr>

              {/* <tr>
                <td
                  style={{
                    padding: "8px 10px",
                    fontWeight: "bold",
                    background: "#f9fafb",
                    border: "1px solid #eee",
                  }}
                >
                  Scheduled Start
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #eee",
                  }}
                >
                  {formatDateTime(scheduledAt)}
                </td>
              </tr> */}
            </tbody>
          </table>

          <h3 style={{ marginBottom: 10 }}>Services</h3>

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
              {services.length > 0 ? (
                services.map((s, i) => (
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
                  <td
                    colSpan={2}
                    style={{ padding: 12, textAlign: "center" }}
                  >
                    No services listed
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {dashboardLink ? (
            <p style={{ padding: "10px 0" }}>
              <a
                href={dashboardLink}
                style={{
                  background: "#10b981",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: 8,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                View Job
              </a>
            </p>
          ) : null}

          <p style={{ marginTop: 24, color: "#4b5563" }}>
            Please contact us if you need to discuss access, timing, or any
            changes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const sampleData: JobSchedulePreviewData = {
    jobUUID: "J12345678",
    recurrenceId: 42,
    customerName: "John Smith",
    customerEmail: "john@example.com",
    mobile: "021 123 4567",
    address: "123 Example Street, Wellington",
    services: [
      { label: "Lawn mowing", quantity: 1 },
      { label: "Hedge trimming", quantity: 2 },
    ],
    scheduledAt: new Date().toISOString(),
    scheduledWindowMins: 90,
    customMessage:
      "Please ensure side gate access is unlocked.\nOur team will arrive within the time window shown below.",
    isRecurring: true,
    recurrenceLabel: "Fortnightly service",
    dashboardLink: "/dashboard/employee/jobs/J12345678",
  };

  return (
    <JobScheduleEmailPreview
      subject="Your Job Schedule Has Been Updated"
      data={sampleData}
    />
  );
}