import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return res.status(500).json({ message: "BACKEND_URL not defined" });

    const qs = new URLSearchParams();
    Object.entries(req.query).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((x) => qs.append(k, String(x)));
      else if (v !== undefined) qs.set(k, String(v));
    });

    const url = `${backendUrl.replace(/\/$/, "")}/api/jobs/all?${qs.toString()}`;

    // ✅ so you can see it in DevTools Network -> Response Headers
    res.setHeader("x-proxy-target", url);

    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "user-agent": String(req.headers["user-agent"] || ""),
        ...(req.headers.cookie ? { cookie: String(req.headers.cookie) } : {}),
      },
    });

    const text = await upstream.text();
    res.status(upstream.status);

    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (err: any) {
    console.error("Jobs proxy error:", err?.message || err);
    return res.status(500).json({ message: "Proxy error" });
  }
}