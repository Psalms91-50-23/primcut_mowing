import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return res.status(500).json({ message: "BACKEND_URL not defined" });
    }

    const { uuid } = req.query;
    if (!uuid || Array.isArray(uuid)) {
      return res.status(400).json({ message: "Invalid job uuid" });
    }

    const upstream = await fetch(`${backendUrl}/api/jobs/${uuid}/details`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const text = await upstream.text();
    res.status(upstream.status);

    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (err: any) {
    console.error("Job uuid proxy error:", err?.message || err);
    return res.status(500).json({ message: "Proxy error" });
  }
}