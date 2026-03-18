import type { NextApiRequest, NextApiResponse } from "next";

type QuickFindType = "quotes" | "jobs" | "customers";

const UUID_REGEX = /^[a-zA-Z0-9]{9}$/;

function isQuickFindType(x: any): x is QuickFindType {
  return x === "quotes" || x === "jobs" || x === "customers";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, uuid } = req.query;

  const t =
    typeof type === "string"
      ? type
      : Array.isArray(type)
      ? (type[0] ?? "")
      : "";

  const u =
    typeof uuid === "string"
      ? uuid.trim()
      : Array.isArray(uuid)
      ? (uuid[0] ?? "").trim()
      : "";

  if (!isQuickFindType(t)) {
    return res.status(400).json({ error: "Invalid type. Use quotes|jobs|customers." });
  }

  if (!u) {
    return res.status(400).json({ error: "uuid is required" });
  }

  if (!UUID_REGEX.test(u)) {
    return res.status(400).json({ error: "UUID must be exactly 9 letters or numbers." });
  }

  const backendURL = process.env.BACKEND_URL;
  if (!backendURL) {
    return res
      .status(500)
      .json({ error: "Backend URL missing. Set BACKEND_URL in environment." });
  }

  const cookieHeader = req.headers.cookie || "";

  try {
    let targetPath = "";
    if (t === "customers") targetPath = `/api/customers/${u}/summary`;
    if (t === "quotes") targetPath = `/api/quotes/${u}/summary`;
    if (t === "jobs") targetPath = `/api/jobs/${u}/summary`;

    const upstream = await fetch(`${backendURL}${targetPath}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    const contentType = upstream.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await upstream.text();
      return res.status(upstream.status).json({
        error: "Backend returned non-JSON",
        body: text,
      });
    }

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error || "Backend request failed",
        details: data,
      });
    }

    let result: any = null;

    if (data?.result) {
      result = data.result;
    } else if (t === "customers") {
      result = data?.customer ?? null;
    } else if (t === "quotes") {
      result = data?.quote ?? null;
    } else if (t === "jobs") {
      result = data?.job?.job ?? data?.job ?? null;
    }

    console.log({ result }, "nextjs proxy quick-find ->");

    return res.status(200).json({ result });
  } catch (err: any) {
    console.error("quick-find proxy error:", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}