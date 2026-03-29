// import type { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {

//     if(req.method !== "POST"){
//         return res.status(405).json({ message: "Method Not Allowed" });
//     }
//     console.log("backend nextjs")
//   try {
    
//     const backendRes = await fetch(
//         `${process.env.BACKEND_URL}/api/quotes/create`,
//         {
//             method: "POST",
//             headers: { 
//                 "Content-Type": "application/json" 
//             },
//             body: JSON.stringify(req.body),
//             },
//         );
//     const data = await backendRes.json();
//     console.log({data})
//     return res.status(backendRes.status).json(data);
//   } catch (err) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// import type { NextApiRequest, NextApiResponse } from "next";
// import formidable, { type Fields, type Files } from "formidable";
// import fs from "fs";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const parseForm = (
//   req: NextApiRequest
// ): Promise<{ fields: Fields; files: Files }> =>
//   new Promise((resolve, reject) => {
//     const form = formidable({ multiples: true });

//     form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
//       if (err) {
//         reject(err);
//         return;
//       }
//       resolve({ fields, files });
//     });
//   });

// const appendField = (
//   formData: FormData,
//   key: string,
//   value: string | string[] | undefined
// ) => {
//   if (value == null) return;

//   if (Array.isArray(value)) {
//     value.forEach((item) => {
//       formData.append(key, item);
//     });
//     return;
//   }

//   formData.append(key, value);
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   try {
//     const { fields, files } = await parseForm(req);

//     const formData = new FormData();

//     appendField(formData, "first_name", fields.first_name);
//     appendField(formData, "last_name", fields.last_name);
//     appendField(formData, "mobile", fields.mobile);
//     appendField(formData, "landline", fields.landline);
//     appendField(
//       formData,
//       "preferred_contact_method",
//       fields.preferred_contact_method
//     );
//     appendField(formData, "email", fields.email);
//     appendField(formData, "message", fields.message);
//     appendField(formData, "address", fields.address);
//     appendField(formData, "recurrence_frequency", fields.recurrence_frequency);
//     appendField(formData, "urgent", fields.urgent);
//     appendField(formData, "customer_uuid", fields.customer_uuid);
//     appendField(formData, "services", fields.services);

//     if (fields.image_labels) {
//       const labels = Array.isArray(fields.image_labels)
//         ? fields.image_labels
//         : [fields.image_labels];

//       labels.forEach((label: string) => {
//         formData.append("image_labels", label);
//       });
//     }

//     const imageFiles = files.images
//       ? Array.isArray(files.images)
//         ? files.images
//         : [files.images]
//       : [];

//     for (const file of imageFiles) {
//       if (!file?.filepath) continue;

//       const buffer = fs.readFileSync(file.filepath);
//       const blob = new Blob([buffer], {
//         type: file.mimetype || "application/octet-stream",
//       });

//       formData.append("images", blob, file.originalFilename || "image.jpg");
//     }

//     const backendRes = await fetch(`${process.env.BACKEND_URL}/api/quotes/create`, {
//       method: "POST",
//       headers: {
//         cookie: req.headers.cookie || "",
//         authorization: req.headers.authorization || "",
//       },
//       body: formData,
//     });

//     const text = await backendRes.text();

//     let data: unknown;
//     try {
//       data = text ? JSON.parse(text) : null;
//     } catch {
//       data = { error: text || "Invalid response from backend" };
//     }

//     return res.status(backendRes.status).json(data);
//   } catch (err: unknown) {
//     console.error("quotes/create proxy error:", err);

//     const message =
//       err instanceof Error ? err.message : "Internal server error";

//     return res.status(500).json({ error: message });
//   }
// }
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const init = {
      method: "POST",
      headers: {
        ...(req.headers["content-type"]
          ? { "content-type": req.headers["content-type"] }
          : {}),
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
        ...(req.headers.authorization
          ? { authorization: req.headers.authorization }
          : {}),
      },
      body: req as unknown as BodyInit,
      duplex: "half",
    } as RequestInit & { duplex: "half" };

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/quotes/create`,
      init
    );

    const contentType = backendRes.headers.get("content-type") || "";
    const text = await backendRes.text();

    if (contentType.includes("application/json")) {
      return res.status(backendRes.status).json(text ? JSON.parse(text) : null);
    }

    return res.status(backendRes.status).send(text);
  } catch (err: unknown) {
    console.error("quotes/create proxy error:", err);

    const message =
      err instanceof Error ? err.message : "Internal server error";

    return res.status(500).json({ error: message });
  }
}