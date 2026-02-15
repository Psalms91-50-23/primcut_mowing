import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    const { quote_uuid } = req.query;
    if (!quote_uuid || typeof quote_uuid !== "string") {
        return res.status(400).json({ error: "Invalid quote UUID" });
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
 
    try {
    const backendRes = await fetch(
        `${process.env.BACKEND_URL}/api/quotes/uuid/${quote_uuid}`,
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
    return res.status(backendRes.status).json(data);

    } catch (err) {
    console.error("API GET quote error:", err);
    return res.status(500).json({ message: "Internal server error" });
    }
 
}
