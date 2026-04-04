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

  try {
    const backendRes = await fetch(
      `${backendURL}/api/privacy-policies/versions`,
      {
        method: "GET",
        headers: {
          cookie: getCookieHeader(req),
        },
      }
    );

    const contentType = backendRes.headers.get("content-type") || "";
    const rawText = await backendRes.text();

    if (!contentType.includes("application/json")) {
      return res.status(backendRes.status).json({
        error: "Backend returned non-JSON",
        body: rawText,
      });
    }

    const data = JSON.parse(rawText);
    console.log({data})
    return res.status(backendRes.status).json(data);
  } catch (error: unknown) {
    console.error("Privacy policy versions proxy error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return res.status(500).json({ error: message });
  }
}