import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendUrl = `${process.env.BACKEND_URL}/api/inquiries/create`;
   
    const cookieHeader = req.headers.cookie || "";
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
         Cookie: cookieHeader,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Proxy /api/inquiry error:", error);

    return res.status(500).json({
      error: "Failed to create inquiry",
      details: error?.message || "Unknown error",
    });
  }
}