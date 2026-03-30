import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL;

const ALLOWED_RANGES = ["attention", "today", "tomorrow", "next7days"] as const;

function getCookieHeader(req: NextApiRequest) {
  return req.headers.cookie ?? "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { range = "today", limit = "10", page = "1" } = req.query;

    const safeRange = String(range);
    const safeLimit = parseInt(String(limit), 10);
    const safePage = parseInt(String(page), 10);

    if (!ALLOWED_RANGES.includes(safeRange as (typeof ALLOWED_RANGES)[number])) {
      return res.status(400).json({
        error: "range must be one of: attention, today, tomorrow, next7days",
      });
    }

    if (!Number.isInteger(safeLimit) || safeLimit <= 0) {
      return res.status(400).json({ error: "limit must be a positive integer" });
    }

    if (!Number.isInteger(safePage) || safePage <= 0) {
      return res.status(400).json({ error: "page must be a positive integer" });
    }

    const cookieHeader = getCookieHeader(req);

    const backendRes = await fetch(
      `${backendURL}/api/dashboard/jobs?range=${encodeURIComponent(
        safeRange
      )}&limit=${safeLimit}&page=${safePage}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
      }
    );
    // const backendRes = await fetch(
    //   `${backendURL}/api/jobs/dashboard?range=${encodeURIComponent(
    //     safeRange
    //   )}&limit=${safeLimit}&page=${safePage}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //       ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    //     },
    //   }
    // );

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
    console.error("/api/dashboard/jobs proxy error:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error",
    });
  }
}