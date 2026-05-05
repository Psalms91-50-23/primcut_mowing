import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid, page = "1", limit = "5" } = req.query;
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
      `${backendURL}/api/jobs/${uuid}/recurrences?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
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
    return res.status(backendRes.status).json(data);
  } catch (error: any) {
    console.error("Job recurrences proxy error:", error);

    return res.status(500).json({
      error: error?.message || "Proxy server error",
    });
  }
}