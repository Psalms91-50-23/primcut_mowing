import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { uuid } = req.query;

    if (!uuid || typeof uuid !== "string") {
      return res.status(400).json({ error: "Inquiry UUID is required" });
    }

    const response = await fetch(`${BACKEND_URL}/api/inquiries/${uuid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Failed to fetch inquiry",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error /api/inquiries/[uuid]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}