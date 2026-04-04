import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;
    console.log({backendUrl})
    if (!backendUrl) {
      return res.status(500).json({ error: "Missing BACKEND_URL base URL" });
    }
    const response = await fetch(
      `${backendUrl}/api/terms-and-conditions/active`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log({response})
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error || "Failed to fetch terms and conditions",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("terms-and-conditions proxy error:", error);
    return res.status(500).json({
      error: "Internal server error while fetching terms and conditions",
    });
  }
}