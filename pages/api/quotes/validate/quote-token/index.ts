// /pages/api/quotes/validate/quote-token.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { uuid, token } = req.body;

  if (!uuid || !token) {
    return res.status(400).json({ message: "Quote UUID and token are required" });
  }

  try {
    // Forward the validation request to your backend
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/quotes/public/validate-token/uuid/${uuid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Forward cookies from client if needed
          "Cookie": req.headers.cookie || "",
        },
        body: JSON.stringify({ token }),
      }
    );

    const data = await backendRes.json();

    // Forward any set-cookie headers from backend to client
    const setCookies = backendRes.headers.get("set-cookie");
    if (setCookies) {
      res.setHeader("Set-Cookie", setCookies);
    }

    return res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("API validate quote token error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
