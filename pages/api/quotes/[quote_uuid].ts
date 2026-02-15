import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { quote_uuid } = req.query;

  if (!quote_uuid || typeof quote_uuid !== "string") {
    return res.status(400).json({ error: "Quote UUID is required" });
  }

  const backendURL = process.env.BACKEND_URL;
  const cookieHeader = req.headers.cookie || "";

  try {
    let backendRes;

    switch (req.method) {
      case "GET":
        backendRes = await fetch(`${backendURL}/api/quotes/uuid/${quote_uuid}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        });
        break;

      case "PATCH":
        backendRes = await fetch(`${backendURL}/api/quotes/admin/uuid/${quote_uuid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Cookie: cookieHeader },
          body: JSON.stringify(req.body),
        });
        break;

      case "DELETE":
        const soft = req.query.soft === "true";
        backendRes = await fetch(`${backendURL}/api/quotes/uuid/${quote_uuid}?soft=${soft}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        });
        break;

      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    const contentType = backendRes.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await backendRes.json();
    } else {
      const text = await backendRes.text();
      console.error("Backend returned non-JSON:", text.slice(0, 500));
      return res.status(500).json({ error: "Backend returned non-JSON", body: text });
    }

    return res.status(backendRes.status).json(data);

  } catch (err: any) {
    console.error("API /quotes/[quote_uuid] error:", err);
    return res.status(500).json({ error: err.message });
  }
}
