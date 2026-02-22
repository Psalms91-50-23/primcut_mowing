import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const { uuid } = req.query;
    const backendURL = process.env.BACKEND_URL;
    if (!uuid || Array.isArray(uuid)) {
        return res.status(400).json({ error: "Invalid UUID" });
    }

    if (req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const backendUrl = `${backendURL}/api/quotes/public/auto-expire/uuid/${uuid}`;

        const response = await fetch(backendUrl, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        });

        const data = await response.json();

        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Proxy auto expire error:", error);

        return res.status(500).json({
        error: "Proxy server error",
        });
    }
}