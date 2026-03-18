import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

function getCookieHeader(req: NextApiRequest) {
  const cookie = req.headers.cookie;
  return cookie ?? "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;

  if (typeof uuid !== "string" || !uuid.trim()) {
    return res.status(400).json({ error: "Valid job UUID is required" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const cookieHeader = getCookieHeader(req);
    const { count = 12 } = req.body || {};

    const backendRes = await fetch(`${backendURL}/api/jobs/${uuid}/recurrences/extend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ count }),
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
  } catch (error: any) {
    console.error("Extend recurrences proxy error:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error",
    });
  }
}