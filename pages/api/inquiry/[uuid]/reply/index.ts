import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { uuid } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Invalid inquiry uuid" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const backendUrl = `${process.env.BACKEND_URL}/api/inquiries/${uuid}/replies`;
  const cookieHeader = req.headers.cookie || "";

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();

      return res.status(response.status).json({
        error: "Backend did not return JSON",
        details: text,
      });
    }

    const data = await response.json();
    
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Proxy /api/inquiry/[uuid]/reply error:", error);

    return res.status(500).json({
      error: "Failed to create inquiry reply",
      details: error?.message || "Unknown error",
    });
  }
}