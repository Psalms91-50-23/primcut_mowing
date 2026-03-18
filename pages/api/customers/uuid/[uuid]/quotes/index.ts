import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const customerUuid =
    typeof req.query.uuid === "string" ? req.query.uuid.trim() : "";

  if (!customerUuid) {
    return res.status(400).json({ error: "Customer UUID is required" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return res.status(500).json({ error: "BACKEND_URL is not set" });
    }

    // change this line if your backend uses a different route shape
    const target = `${backendUrl}/api/customers/uuid/${customerUuid}/quotes`;

    const response = await fetch(target, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
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
        error: data?.error || "Failed to fetch customer quotes",
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || "Unexpected proxy error",
    });
  }
}