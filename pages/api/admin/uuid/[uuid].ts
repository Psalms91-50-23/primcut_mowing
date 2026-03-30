// pages/api/quotes/admin/uuid/[uuid].ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;
  
  if (req.method === "PATCH") {
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000"; 
    try {
      const backendRes = await fetch(
        `${BACKEND_URL}/api/quotes/uuid/${uuid}`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Cookie": req.headers.cookie || "",
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    } catch (err) {
      console.error("API PATCH quote error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
