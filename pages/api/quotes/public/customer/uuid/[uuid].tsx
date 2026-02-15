import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Quote UUID is required" });
  }

  try {
    // Call your existing backend route
    const backendUrl = `${process.env.BACKEND_URL}/api/quotes/customer/uuid/${uuid}`;
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Forward the backend response
    return res.status(response.status).json(data);
  } catch (err: any) {
    console.error("Error fetching quote from backend:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
