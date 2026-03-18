import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;
 console.log({uuid}, " quote details api route")
  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Invalid quote UUID" });
  }

  try {
    const cookieHeader = req.headers.cookie || "";

    const backendRes = await fetch(`${backendURL}/api/quotes/${uuid}/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    const contentType = backendRes.headers.get("content-type") || "";

    // Handle non JSON backend responses safely
    if (!contentType.includes("application/json")) {
      const text = await backendRes.text();
      return res
        .status(backendRes.status)
        .json({ error: "Backend returned non-JSON", body: text });
    }

    const data = await backendRes.json();
    console.log({data}, " nextjs api get detailed quotes")
    return res.status(backendRes.status).json(data);
  } catch (error: any) {
    console.error("Quote details proxy error:", error);
    return res.status(500).json({ error: "Proxy server error" });
  }
}