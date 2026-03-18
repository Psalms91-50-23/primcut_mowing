import type { NextApiRequest, NextApiResponse } from "next";

const backendURL = process.env.BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Invalid job UUID" });
  }

  // Only allow PATCH
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookieHeader = req.headers.cookie || "";

    const backendRes = await fetch(`${backendURL}/api/jobs/${uuid}/schedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(req.body), // 👈 forwards job + recurrence object
    });
    console.log(req.body, " nextjs api proxy for update jobs with recurrences")
    const contentType = backendRes.headers.get("content-type") || "";

    // Handle backend returning non-JSON safely
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
    console.error("Job schedule proxy error:", error);

    return res.status(500).json({
      error: error?.message || "Proxy server error",
    });
  }
}