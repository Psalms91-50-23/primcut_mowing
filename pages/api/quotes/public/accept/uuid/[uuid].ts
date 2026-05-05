import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method !== "PATCH"){
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    const { uuid } = req.query;
    try {
        
        const backendRes = await fetch(
            `${process.env.BACKEND_URL}/api/quotes/public/accept/uuid/${uuid}`,
            {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    cookie: req.headers.cookie || "",
                },
                body: JSON.stringify(req.body),
                },
            );

        const data = await backendRes.json();
        return res.status(backendRes.status).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}