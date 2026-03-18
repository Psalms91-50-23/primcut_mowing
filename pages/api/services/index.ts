import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendUrl = `${process.env.BACKEND_URL}/api/services`;
    console.log({backendUrl}, " Fetching services from backend...");

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        cookie: req.headers.cookie || "",
      },
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Proxy /api/services error:", error);
    return res.status(500).json({
      error: "Failed to fetch services",
      details: error?.message || "Unknown error",
    });
  }
}
