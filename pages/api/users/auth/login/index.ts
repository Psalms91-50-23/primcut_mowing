// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   try {
//     // const url = process.env.BACKEND_URL;
//     const backendUrl = process.env.BACKEND_URL;
//     if (!backendUrl) throw new Error("BACKEND_URL not defined");
//     // Capture client IP
//     const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
//       req.socket.remoteAddress ||
//       "0.0.0.0";

//     console.log({backendUrl})
//     const backendRes = await fetch(`${backendUrl}/api/users/auth/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//          "x-forwarded-for": clientIp,
//          "user-agent": req.headers["user-agent"] || "",
//       },
//       credentials: "include",
//       body: JSON.stringify(req.body),
//     });
//     // ✅ Correct way to get all Set-Cookie headers in Next.js fetch
//     // const setCookies = backendRes.headers.get("set-cookie");
//     // console.log("Set-Cookie header from backend:", setCookies);
//     // if (setCookies) {
//     //   // If backend sent multiple cookies, split by comma if needed
//     //   // But usually backend sends them separately, so you can forward as array:
//     //   res.setHeader("Set-Cookie", Array.isArray(setCookies) ? setCookies : [setCookies]);
//     // // }
//     //original below
//     const setCookies = backendRes.headers.getSetCookie();
//     if (setCookies.length > 0) {
//         res.setHeader("Set-Cookie", setCookies);
//     } 
//     const raw = await backendRes.text();
//     const data = await backendRes.json();
//     console.log({data}, " nextjs api")
//     return res.status(backendRes.status).json(data.user);
//   } catch (err) {
//     console.error("API /login error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL not defined");
      return res.status(500).json({ message: "BACKEND_URL not defined" });
    }

    // Capture client IP (best-effort)
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "0.0.0.0";

    const backendRes = await fetch(`${backendUrl}/api/users/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": clientIp,
        // forward original UA if present
        "user-agent": String(req.headers["user-agent"] || ""),
        // if your backend ever needs original cookies (not usually for login):
        cookie: String(req.headers.cookie || ""),
      },
      body: JSON.stringify(req.body),
    });

    const setCookies = backendRes.headers.getSetCookie();
    if (setCookies.length > 0) {
        res.setHeader("Set-Cookie", setCookies);
    } 

    // Read raw first (handles non-JSON 403 pages)
    const raw = await backendRes.text();

    console.log("LOGIN proxy → backendUrl:", backendUrl);
    console.log("LOGIN proxy → backend status:", backendRes.status);
    console.log("LOGIN proxy → backend raw body:", raw);

    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw }; // backend returned text/html
    }

    return res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("API /login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}