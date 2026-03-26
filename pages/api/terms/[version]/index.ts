import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { version } = req.query;

  if (!version || typeof version !== "string") {
    return res.status(400).json({ error: "Invalid version" });
  }

  try {
    const backendUrl = `${process.env.BACKEND_URL}/api/terms/version/${version}`;

    const response = await fetch(backendUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch terms" });
  }
}