import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return res.status(500).json({ message: "BACKEND_URL not defined" });
    }

    const qs = new URLSearchParams();

    Object.entries(req.query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => qs.append(key, String(item)));
      } else if (value !== undefined && value !== null) {
        qs.set(key, String(value));
      }
    });

    const url = `${backendUrl.replace(/\/$/, "")}/api/jobs/scheduled${
      qs.toString() ? `?${qs.toString()}` : ""
    }`;

    res.setHeader("x-proxy-target", url);

    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "user-agent": String(req.headers["user-agent"] || ""),
        ...(req.headers.cookie ? { cookie: String(req.headers.cookie) } : {}),
        ...(req.headers.authorization
          ? { authorization: String(req.headers.authorization) }
          : {}),
      },
    });

    const contentType = upstream.headers.get("content-type") || "";
    const text = await upstream.text();

    res.status(upstream.status);

    if (contentType.includes("application/json")) {
      try {
        return res.json(JSON.parse(text));
      } catch {
        return res.status(502).json({
          message: "Invalid JSON returned from backend",
          raw: text,
        });
      }
    }

    return res.send(text);
  } catch (err: any) {
    console.error("Scheduled jobs proxy error:", err?.message || err);
    return res.status(500).json({ message: "Proxy error" });
  }
}