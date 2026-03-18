import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    let { uuid , token} = req.query;
    if (Array.isArray(uuid)) uuid = uuid[0];
    if (Array.isArray(token)) token = token[0];

    if (!uuid) {
        return res.status(400).json({ error: "Invalid quote UUID" });
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
 
    try {
    const backendRes = await fetch(
        `${process.env.BACKEND_URL}/api/quotes/public/uuid/${uuid}?token=${token}`,
        {
        method: "GET",
        headers: { 
            "Content-Type": "application/json" ,
            "Cookie": req.headers.cookie || "", // <-- forward cookies
        },
        }
    );

    const data = await backendRes.json();

    const setCookies = backendRes.headers.get("set-cookie");
    if (setCookies) {
        res.setHeader("Set-Cookie", setCookies);
    }
    console.log({data}, " public api quotes")
    return res.status(backendRes.status).json(data);
    } catch (err) {
    console.error("API GET quote error:", err);
    return res.status(500).json({ message: "Internal server error" });
    }
 
}
