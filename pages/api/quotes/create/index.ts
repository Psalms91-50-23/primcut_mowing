
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const init = {
      method: "POST",
      headers: {
        ...(req.headers["content-type"]
          ? { "content-type": req.headers["content-type"] }
          : {}),
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
        ...(req.headers.authorization
          ? { authorization: req.headers.authorization }
          : {}),
      },
      body: req as unknown as BodyInit,
      duplex: "half",
    } as RequestInit & { duplex: "half" };

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/quotes/create`,
      init
    );

    const contentType = backendRes.headers.get("content-type") || "";
    const text = await backendRes.text();

    if (contentType.includes("application/json")) {
      return res.status(backendRes.status).json(text ? JSON.parse(text) : null);
    }

    return res.status(backendRes.status).send(text);
  } catch (err: unknown) {
    console.error("quotes/create proxy error:", err);

    const message =
      err instanceof Error ? err.message : "Internal server error";

    return res.status(500).json({ error: message });
  }
}