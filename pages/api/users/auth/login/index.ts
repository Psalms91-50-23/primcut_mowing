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


// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   try {
//     const backendUrl = process.env.BACKEND_URL;
//     if (!backendUrl) {
//       console.error("BACKEND_URL not defined");
//       return res.status(500).json({ message: "BACKEND_URL not defined" });
//     }

//     // Capture client IP (best-effort)
//     const clientIp =
//       (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
//       req.socket.remoteAddress ||
//       "0.0.0.0";

//     const backendRes = await fetch(`${backendUrl}/api/users/auth/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-forwarded-for": clientIp,
//         // forward original UA if present
//         "user-agent": String(req.headers["user-agent"] || ""),
//         // if your backend ever needs original cookies (not usually for login):
//         cookie: String(req.headers.cookie || ""),
//       },
//       body: JSON.stringify(req.body),
//     });

//     const setCookies = backendRes.headers.getSetCookie();
//     if (setCookies.length > 0) {
//         res.setHeader("Set-Cookie", setCookies);
//     } 

//     // Read raw first (handles non-JSON 403 pages)
//     const raw = await backendRes.text();

//     console.log("LOGIN proxy → backendUrl:", backendUrl);
//     console.log("LOGIN proxy → backend status:", backendRes.status);
//     console.log("LOGIN proxy → backend raw body:", raw);

//     let data: any = null;
//     try {
//       data = JSON.parse(raw);
//     } catch {
//       data = { message: raw }; // backend returned text/html
//     }

//     return res.status(backendRes.status).json(data);
//   } catch (err) {
//     console.error("API /login error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }


import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  console.log(req.body);
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL not defined");
      return res.status(500).json({ message: "BACKEND_URL not defined" });
    }

    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "0.0.0.0";

    const backendRes = await fetch(`${backendUrl}/api/users/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": clientIp,
        "user-agent": String(req.headers["user-agent"] || ""),
        cookie: String(req.headers.cookie || ""),
      },
      body: JSON.stringify(req.body),
    });

    // ✅ Forward Set-Cookie headers safely
    const anyHeaders: any = backendRes.headers as any;

    // Next/undici sometimes provides getSetCookie(); node-fetch usually doesn't.
    const setCookies: string[] =
      typeof anyHeaders.getSetCookie === "function"
        ? anyHeaders.getSetCookie()
        : [];

    // Fallback: try single header
    const singleSetCookie = backendRes.headers.get("set-cookie");
    if (setCookies.length > 0) {
      res.setHeader("Set-Cookie", setCookies);
    } else if (singleSetCookie) {
      // If only one cookie header is present, forward it
      res.setHeader("Set-Cookie", singleSetCookie);
    }

    const raw = await backendRes.text();

    console.log("LOGIN proxy → backendUrl:", backendUrl);
    console.log("LOGIN proxy → backend status:", backendRes.status);
    console.log("LOGIN proxy → backend raw body:", raw);

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw };
    }

    return res.status(backendRes.status).json(data);
  } catch (err: any) {
    console.error("API /login error:", err);
    return res.status(500).json({ message: err?.message || "Internal server error" });
  }
}