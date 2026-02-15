import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { uuid } = req.query;

  if (!uuid) return res.status(400).json({ message: "Quote UUID required" });

  try {
    // Forward request to backend to check session cookie
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/quotes/public/session/uuid/${uuid}`,
      {
        method: "GET",
        headers: {
          "Cookie": req.headers.cookie || "",
        },
      }
    );

    const data = await backendRes.json();
    const setCookies = backendRes.headers.get("set-cookie");
    if (setCookies) res.setHeader("Set-Cookie", setCookies);

    return res.status(backendRes.status).json(data);

  } catch (err) {
    console.error("API get-by-session error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
