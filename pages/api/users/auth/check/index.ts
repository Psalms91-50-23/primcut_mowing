// pages/api/users/auth/check.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Call backend route that checks cookies
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/auth/check`, {
      method: "POST",
      headers: {
        cookie: req.headers.cookie || "", 
        "Content-Type": "application/json",
      },
    });

    const text = await backendRes.text();

    try {
      const data = JSON.parse(text);
      res.status(backendRes.status).json(data);
    } catch {
      // if backend returned plain text, just forward it
      res.status(backendRes.status).send(text);
    }
  } catch (err) {
    console.error("Next.js API check login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
