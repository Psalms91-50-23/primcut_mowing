import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { uuid } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Invalid inquiry uuid" });
  }

  const backendUrl = `${process.env.BACKEND_URL}/api/inquiries/${uuid}`;
  const cookieHeader = req.headers.cookie || "";

  try {
    let response;

    // ✅ GET → fetch inquiry
    if (req.method === "GET") {
      console.log("get inquiry by uuid proxy");
      response = await fetch(backendUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });
    }

    // ✅ PATCH → update inquiry
    else if (req.method === "PATCH") {
      response = await fetch(backendUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify(req.body),
      });
    }

    // ❌ Not allowed
    else {
      return res.status(405).json({ error: "Method not allowed" });
    }
    console.log({response})
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();

      return res.status(response.status).json({
        error: "Backend did not return JSON",
        details: text,
      });
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Proxy /api/inquiry/[uuid] error:", error);

    return res.status(500).json({
      error:
        req.method === "PATCH"
          ? "Failed to update inquiry"
          : "Failed to fetch inquiry",
      details: error?.message || "Unknown error",
    });
  }
}