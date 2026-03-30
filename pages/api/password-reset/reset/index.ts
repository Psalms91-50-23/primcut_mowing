import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL || "http://localhost:4000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendRes = await fetch(`${backendURL}/api/password-reset/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
      body: JSON.stringify(req.body),
    });

    const contentType = backendRes.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await backendRes.text();
      return res.status(backendRes.status).json({
        error: "Backend returned non-JSON",
        body: text,
      });
    }

    const data = await backendRes.json();
    return res.status(backendRes.status).json(data);
  } catch (err: unknown) {
    console.error("Password reset proxy failed:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}