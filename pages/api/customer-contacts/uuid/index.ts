import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;

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
      `${BACKEND_URL}/customer-contacts/uuid/${uuid}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        body: JSON.stringify(req.body),
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
          ? "Customer contact updated successfully"
          : "Failed to update customer contact",
      }
    );
  } catch (error: any) {
    console.error("Next proxy error updating customer contact:", error);

    return res.status(500).json({
      error: error?.message || "Internal server error",
    });
  }
}