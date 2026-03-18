import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { uuid } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Customer UUID is required" });
  }

  const backendURL = process.env.BACKEND_URL;
  const cookieHeader = req.headers.cookie || "";

  try {
    const backendRes = await fetch(
      `${backendURL}/api/customers/${uuid}/details`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      }
    );

    const contentType = backendRes.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await backendRes.json();
    } else {
      const text = await backendRes.text();
      console.error("Backend returned non-JSON:", text.slice(0, 500));
      return res
        .status(500)
        .json({ error: "Backend returned non-JSON", body: text });
    }

    return res.status(backendRes.status).json(data);
  } catch (err: any) {
    console.error("API /customers/[uuid]/details error:", err);
    return res.status(500).json({ error: err.message });
  }
}