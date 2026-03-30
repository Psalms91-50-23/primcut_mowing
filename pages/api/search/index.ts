import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const type = typeof req.query.type === "string" ? req.query.type.trim() : "all";

  if (!q) {
    return res.status(400).json({ error: "q is required" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return res.status(500).json({ error: "NEXT_PUBLIC_BACKEND_URL is not set" });
    }

    const target = `${backendUrl}/api/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`;

    const response = await fetch(target, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return res.status(502).json({
        error: "Backend returned non-JSON",
        raw: text,
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Search request failed",
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || "Unexpected proxy error",
    });
  }
}