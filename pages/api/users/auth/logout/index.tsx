import type { NextApiRequest, NextApiResponse } from "next";
import { setCookie, deleteCookie, getCookie } from "cookies-next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {

    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/users/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
         cookie: req.headers.cookie || "", // 🔥 forward cookies
      },
      body: JSON.stringify({}),
    });

    const data = await backendRes.json();

    const setCookies = backendRes.headers.getSetCookie() || [];
    if (setCookies.length > 0) {

      res.setHeader("Set-Cookie", setCookies);
    } 
      // ✅ Check if cookies exist and delete them
    ["accessToken", "refreshToken"].forEach((cookieName) => {
      const value = getCookie(cookieName, { req, res });

      if (value) {
        deleteCookie(cookieName, {
          req,
          res,
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }
    });

    return res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("API /logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}