import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieHeader = req.headers.cookie || "";
  const backendURL = process.env.BACKEND_URL;

  try {
    switch (req.method) {
      case "GET": {
        // Fetch list of quotes
        try {
        // Build query string dynamically (forward everything safely)
        const qs = new URLSearchParams();

        Object.entries(req.query).forEach(([key, value]) => {
          if (value !== undefined) {
            qs.set(key, String(value));
          }
        });

        const backendRes = await fetch(
          `${backendURL}/api/quotes?${qs.toString()}`,
          {
            method: "GET",
            headers: {
              Cookie: cookieHeader,
            },
          }
        );

        let data;

        try {
          data = await backendRes.json();
        } catch {
          const text = await backendRes.text();
          console.error("Backend returned non-JSON:", text);

          return res.status(backendRes.status).json({
            error: "Invalid backend response format",
          });
        }

        return res.status(backendRes.status).json(data);

      } catch (err: any) {
        console.error("Proxy GET /quotes error:", err);
        return res.status(500).json({ error: "Proxy server error" });
      }
      //below my original code, which is more manual and less flexible than the above dynamic query string approach
        // const { status = "draft", limit = "10", page = "1", olderThan = "3" } = req.query;

        // const backendRes = await fetch(
        //   `${backendURL}/api/quotes?status=${status}&limit=${limit}&page=${page}&olderThan=${olderThan}`,
        //   {
        //     method: "GET",
        //     headers: {
        //       "Content-Type": "application/json",
        //       Cookie: cookieHeader,
        //     },
        //   }
        // );

        // const contentType = backendRes.headers.get("content-type") || "";
        // if (!contentType.includes("application/json")) {
        //   const text = await backendRes.text();
        //   return res.status(backendRes.status).json({ error: "Backend returned non-JSON", body: text });
        // }

        // const data = await backendRes.json();
        // return res.status(backendRes.status).json(data);
      }

      case "POST": {
        // Create a new quote
        const body = req.body;
        const backendRes = await fetch(`${backendURL}/api/quotes`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookieHeader },
          body: JSON.stringify(body),
        });

        const data = await backendRes.json();
        return res.status(backendRes.status).json(data);
      }

      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (err: any) {
    console.error("API /quotes error:", err);
    return res.status(500).json({ error: err.message });
  }
}
