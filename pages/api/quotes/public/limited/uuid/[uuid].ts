// /pages/api/quotes/validate/quote-token.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { uuid } = req.query;

  if (!uuid) {
    return res.status(400).json({ message: "Quote UUID is required" });
  }

  try {
    // Forward the validation request to your backend
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/quotes/public/limited/uuid/${uuid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await backendRes.json();
    return res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("API validate quote token error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
