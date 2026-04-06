import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { recurrenceUuid } = req.query;

  if (!recurrenceUuid || typeof recurrenceUuid !== "string") {
    return res.status(400).json({ error: "recurrenceUuid is required" });
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendUrl = `${process.env.BACKEND_URL}/api/job-recurrences/${recurrenceUuid}/complete`;

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Failed to complete recurrence",
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Complete recurrence proxy error:", error.message);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}