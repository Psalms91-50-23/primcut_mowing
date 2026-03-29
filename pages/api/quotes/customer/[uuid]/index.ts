import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL || "http://localhost:4000";

function getCookieHeader(req: NextApiRequest) {
  return req.headers.cookie ?? "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { uuid } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Customer UUID is required" });
  }

  try {
    const backendRes = await fetch(
      `${backendURL}/api/quotes/customer/${uuid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: getCookieHeader(req),
        },
      }
    );

    const contentType = backendRes.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await backendRes.text();
      return res.status(backendRes.status).json({
        error: "Backend returned non-JSON",
        body: text.slice(0, 1000),
      });
    }

    const data = await backendRes.json();
    return res.status(backendRes.status).json(data);
  } catch (error: unknown) {
    console.error("Quotes customer proxy error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}