import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { input } = req.query;

  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "Missing input" });
  }

  const apiKey = process.env.NEXT_PUBLIC_PLACES_API;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" });
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&types=address&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return res.status(200).json(data);
}
