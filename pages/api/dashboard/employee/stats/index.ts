import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL;

function getCookieHeader(req: NextApiRequest) {
  return req.headers.cookie ?? "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    const cookieHeader = getCookieHeader(req);

    const backendRes = await fetch(`${backendURL}/api/dashboard/employee/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
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
    console.error("Dashboard stats proxy error:", error);

    return res.status(500).json({
      error: error?.message || "Internal server error",
    });
  }
}