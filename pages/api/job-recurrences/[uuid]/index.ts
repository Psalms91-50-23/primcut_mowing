import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Recurrence UUID is required" });
  }

  if (!["GET", "PATCH", "DELETE"].includes(req.method || "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendUrl = `${process.env.BACKEND_URL}/api/job-recurrences/${uuid}`;

    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
      body:
        req.method === "PATCH" || req.method === "POST"
          ? JSON.stringify(req.body || {})
          : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Request failed",
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("job-recurrence proxy error:", error.message);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}