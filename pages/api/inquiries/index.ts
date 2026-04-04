import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { page = "1", limit = "10", status } = req.query;

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (status && typeof status === "string" && status.trim()) {
      params.set("status", status.trim());
    }

    const response = await fetch(`${BACKEND_URL}/api/inquiries?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Failed to fetch inquiries",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error /api/inquiries:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}