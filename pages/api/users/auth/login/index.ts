import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const url = process.env.BACKEND_URL;

    console.log({url})
    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/users/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    const setCookies = backendRes.headers.getSetCookie();
    if (setCookies.length > 0) {
      res.setHeader("Set-Cookie", setCookies);
    } 
    return res.status(backendRes.status).json(data.user);
  } catch (err) {
    console.error("API /login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
