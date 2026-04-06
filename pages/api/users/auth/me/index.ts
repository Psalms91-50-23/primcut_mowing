import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL not defined");
    }

    const backendRes = await fetch(`${backendUrl}/api/users/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
    });

    const setCookieHeader = backendRes.headers.get("set-cookie");
    if (setCookieHeader) {
      res.setHeader("set-cookie", setCookieHeader);
    }

    const text = await backendRes.text();

    try {
      const data = JSON.parse(text);
      return res.status(backendRes.status).json(data);
    } catch {
      return res.status(backendRes.status).send(text);
    }
  } catch (err) {
    console.error("Next.js API /me error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}