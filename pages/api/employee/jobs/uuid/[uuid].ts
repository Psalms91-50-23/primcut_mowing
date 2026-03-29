import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ message: "Job uuid is required" });
  }

  const backendURL = process.env.BACKEND_URL;
  try {
    const response = await fetch(`${backendURL}/api/jobs/uuid/${uuid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
    });

    const text = await response.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text || "Invalid response from server" };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Job proxy error:", error);
    return res.status(500).json({
      message: "Failed to fetch job",
    });
  }
}