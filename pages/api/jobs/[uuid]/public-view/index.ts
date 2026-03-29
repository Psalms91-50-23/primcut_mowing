import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;

  console.log("hitting public job view proxy", {
    method: req.method,
    uuid,
  });

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Invalid job UUID" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookieHeader = req.headers.cookie || "";

    const backendRes = await fetch(
      `${backendURL}/api/jobs/${uuid}/public-view`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // optional, remove if public
        },
      }
    );

    const contentType = backendRes.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await backendRes.text();
      return res.status(backendRes.status).json({
        error: "Backend returned non-JSON",
        body: text,
      });
    }

    const data = await backendRes.json();

    console.log("public-view proxy response:", data);

    return res.status(backendRes.status).json(data);
  } catch (error: any) {
    console.error("Public job view proxy error:", error);

    return res.status(500).json({
      error: error?.message || "Proxy server error",
    });
  }
}