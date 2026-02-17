import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const url = process.env.BACKEND_URL;
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) throw new Error("BACKEND_URL not defined");

    console.log({url})
    const backendRes = await fetch(`${backendUrl}/api/users/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    // ✅ Correct way to get all Set-Cookie headers in Next.js fetch
    const setCookies = backendRes.headers.get("set-cookie");
    if (setCookies) {
      // If backend sent multiple cookies, split by comma if needed
      // But usually backend sends them separately, so you can forward as array:
      res.setHeader("Set-Cookie", Array.isArray(setCookies) ? setCookies : [setCookies]);
    }
    const data = await backendRes.json();
    //original below
    // const setCookies = backendRes.headers.getSetCookie();
    // if (setCookies.length > 0) {
    //   res.setHeader("Set-Cookie", setCookies);
    // } 
    
    return res.status(backendRes.status).json(data.user);
  } catch (err) {
    console.error("API /login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
