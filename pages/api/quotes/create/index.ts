import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method !== "POST"){
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    console.log("backend nextjs")
  try {
    
    const backendRes = await fetch(
        `${process.env.BACKEND_URL}/api/quotes/create`,
        {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(req.body),
            },
        );
    const data = await backendRes.json();
    console.log({data})
    return res.status(backendRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
