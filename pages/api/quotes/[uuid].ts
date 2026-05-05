import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uuid, action } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Quote UUID is required" });
  }

  const backendURL = process.env.BACKEND_URL;
  const cookieHeader = req.headers.cookie || "";

  try {
    let backendRes: Response;

    switch (req.method) {
      case "GET":
        backendRes = await fetch(`${backendURL}/api/quotes/uuid/${uuid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
        });
        break;

      case "PATCH": {
        const backendPath =
          action === "send"
            ? `/api/quotes/employee/uuid/${uuid}`
            : `/api/quotes/uuid/${uuid}`;

        backendRes = await fetch(`${backendURL}${backendPath}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          body: JSON.stringify(req.body),
        });
        break;
      }

      case "DELETE": {
        const soft = req.query.soft === "true";
        backendRes = await fetch(`${backendURL}/api/quotes/uuid/${uuid}?soft=${soft}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
        });
        break;
      }

      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // forward set-cookie from backend to browser
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
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