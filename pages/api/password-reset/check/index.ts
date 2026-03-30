import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL || "http://localhost:4000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const backendRes = await fetch(
      `${backendURL}/api/password-reset/check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // forward cookies if needed (optional but recommended)
          cookie: req.headers.cookie || "",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await backendRes.json();

    return res.status(backendRes.status).json(data);
  } catch (err: unknown) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Proxy request failed" });
  }
}