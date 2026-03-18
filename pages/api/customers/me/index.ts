import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/customers/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
    });

    const contentType = backendRes.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await backendRes.text();
      return res.status(502).json({
        error: "Backend returned non-JSON response",
        details: text,
      });
    }

    const data = await backendRes.json();
    return res.status(backendRes.status).json(data);
  } catch (err: any) {
    console.error("Customer proxy error:", err);
    return res.status(500).json({
      error: "Failed to fetch customer",
      details: err?.message || "Unknown error",
    });
  }
}