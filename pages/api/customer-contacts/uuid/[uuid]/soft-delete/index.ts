import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { uuid } = req.query;

  const BACKEND_URL = process.env.BACKEND_URL;

  if (!BACKEND_URL) {
    return res.status(500).json({
      error: "Backend API base URL is not configured",
    });
  }

  if (!uuid || Array.isArray(uuid)) {
    return res.status(400).json({
      error: "Contact UUID is required",
    });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    const cookieHeader = req.headers.cookie || "";

    const backendRes = await fetch(
      `${BACKEND_URL}/api/customer-contacts/uuid/${uuid}/soft-delete`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        body: JSON.stringify(req.body || {}),
      }
    );

    const text = await backendRes.text();

    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    return res.status(backendRes.status).json(
      data || {
        message: backendRes.ok
          ? "Customer contact soft deleted successfully"
          : "Failed to soft delete customer contact",
      }
    );
  } catch (error: any) {
    console.error("Next proxy error soft deleting customer contact:", error);

    return res.status(500).json({
      error: error?.message || "Internal server error",
    });
  }
}