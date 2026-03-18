import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { uuid } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Customer UUID is required" });
  }

  const backendUrl = `${process.env.BACKEND_URL}/api/customers/uuid/${uuid}/contacts`;

  try {
    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
      body:
        req.method === "POST" || req.method === "PATCH"
          ? JSON.stringify(req.body)
          : undefined,
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
    console.error("Contacts proxy error:", err);
    return res.status(500).json({
      error: "Proxy failed",
      details: err.message,
    });
  }
}