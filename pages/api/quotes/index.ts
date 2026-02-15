import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieHeader = req.headers.cookie || "";
  const backendURL = process.env.BACKEND_URL;

  try {
    switch (req.method) {
      case "GET": {
        // Fetch list of quotes
        const { status = "draft", limit = "10", page = "1", olderThan = "3" } = req.query;

        const backendRes = await fetch(
          `${backendURL}/api/quotes?status=${status}&limit=${limit}&page=${page}&olderThan=${olderThan}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Cookie: cookieHeader,
            },
          }
        );

        const contentType = backendRes.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await backendRes.text();
          return res.status(backendRes.status).json({ error: "Backend returned non-JSON", body: text });
        }

        const data = await backendRes.json();
        return res.status(backendRes.status).json(data);
      }

      case "POST": {
        // Create a new quote
        const body = req.body;
        const backendRes = await fetch(`${backendURL}/api/quotes`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookieHeader },
          body: JSON.stringify(body),
        });

        const data = await backendRes.json();
        return res.status(backendRes.status).json(data);
      }

      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (err: any) {
    console.error("API /quotes error:", err);
    return res.status(500).json({ error: err.message });
  }
}
