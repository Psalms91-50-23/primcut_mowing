import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!BACKEND_URL) {
      return res.status(500).json({ error: "Backend URL is not configured" });
    }

    const {
      version,
      title,
      content,
      short_summary,
      pdf_url,
      is_active,
    } = req.body || {};

    if (!version || !title || !content) {
      return res.status(400).json({
        error: "version, title, and content are required",
      });
    }

    const token =
      req.cookies?.token ||
      req.headers.authorization ||
      "";

    const response = await fetch(`${BACKEND_URL}/api/terms-and-conditions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
         "Cookie": req.headers.cookie || "",
      },
      body: JSON.stringify({
        version,
        title,
        content,
        short_summary: short_summary || null,
        pdf_url: pdf_url || null,
        is_active: Boolean(is_active),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Failed to create terms and conditions",
      });
    }

    return res.status(201).json(data);
  } catch (error: any) {
    console.error("Next proxy create terms error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}