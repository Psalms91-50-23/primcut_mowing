import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "../../lib/nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { name, phone , email, message } = req.body;
  if (!name || !phone || !email || !message) return res.status(400).json({ message: "Missing fields" });

  try {
    await sendEmail(name, phone, email, message);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
}
