import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { quote_uuid } = req.query;
  const token = typeof req.query.token === "string" ? req.query.token : "";

  if (!quote_uuid || typeof quote_uuid !== "string") {
    return res.status(400).json({ error: "Quote UUID is required" });
  }
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const backendURL = process.env.BACKEND_URL;
  if (!backendURL) {
    return res.status(500).json({ error: "BACKEND_URL not defined" });
  }

  try {
    const backendRes = await fetch(
      `${backendURL}/api/quotes/${encodeURIComponent(quote_uuid)}/pdf?token=${encodeURIComponent(token)}`,
      { method: "GET" }
    );

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return res.status(backendRes.status).send(text);
    }

    // Forward PDF headers
    res.setHeader(
      "Content-Type",
      backendRes.headers.get("content-type") || "application/pdf"
    );
    res.setHeader(
      "Content-Disposition",
      backendRes.headers.get("content-disposition") ||
        `inline; filename="quote-${quote_uuid}.pdf"`
    );
    res.setHeader("Cache-Control", "no-store");

    // Return PDF bytes
    const arrayBuffer = await backendRes.arrayBuffer();
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error("API /quotes/[quote_uuid]/pdf error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch PDF" });
  }
}