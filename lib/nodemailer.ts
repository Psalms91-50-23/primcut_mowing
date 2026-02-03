import nodemailer from "nodemailer";

export const sendEmail = async (
  firstName: string,
  lastName: string,
  mobile: string,
  landline: string,
  preferredContactMethod: string,
  email: string,
  message: string,
  services: string[],
  images: { label: string; url: string }[]
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // background-image: url('https://yourdomain.com/path-to-image.jpg'); 

  const htmlImages = images
    .filter(img => img.url)
    .map(img => `
      <div style="margin-bottom: 10px;">
        <strong>${img.label || "Image"}</strong><br/>
        <img src="${img.url}" width="300" style="border:1px solid #ddd; padding:5px;" />
      </div>
    `)
    .join("");

  await transporter.sendMail({
  from: `"Primcut Contact" <${process.env.EMAIL_USER}>`,
  to: process.env.SEND_TO,
  subject: `New Message from ${firstName} ${lastName}`,
  text: `
    New message from website contact form.

    Full Name: ${firstName} ${lastName}
    Mobile: ${mobile || "N/A"}
    Landline: ${landline || "N/A"}
    Preferred Contact: ${preferredContactMethod || "N/A"}
    Email: ${email}
    Services: ${services?.length ? services.join(", ") : "N/A"}
    Message:
    ${message}

    Images:
    ${images?.length ? images.map(img => `${img.label}: ${img.url}`).join("\n") : "No images"}
  `,
  html: `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <div style="background:#2f855a; padding: 20px; text-align:center; color:#fff;">
        <h1 style="margin:0; font-size: 24px;">PrimCut Mowing Ltd</h1>
      </div>

      <div style="padding: 20px;">
        <h2 style="margin-top: 0; font-size: 18px; color:#2f855a;">New Contact Message</h2>

        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: 600; width: 160px;">Full Name</td>
            <td style="padding: 8px;">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: 600;">Mobile</td>
            <td style="padding: 8px;">${mobile || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: 600;">Landline</td>
            <td style="padding: 8px;">${landline || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: 600;">Preferred Contact</td>
            <td style="padding: 8px;">${preferredContactMethod || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: 600;">Email</td>
            <td style="padding: 8px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: 600;">Services</td>
            <td style="padding: 8px;">${services?.length ? services.join(", ") : "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: 600;">Message</td>
            <td style="padding: 8px;">${message.replace(/\n/g, "<br/>")}</td>
          </tr>
        </table>

        ${images?.length ? `
          <div style="margin-top: 20px;">
            <h3 style="margin: 0 0 10px 0; color:#2f855a;">Images</h3>
            ${images.map(img => `
              <div style="margin-bottom: 10px;">
                <div style="font-weight: 600;">${img.label || "Image"}</div>
                <a href="${img.url}" target="_blank" style="color:#2f855a;">View Image</a>
              </div>
            `).join("")}
          </div>
        ` : `
          <p style="margin-top: 20px; font-style: italic; color:#6b7280;">
            No images were provided.
          </p>
        `}
      </div>

      <div style="background:#f3f4f6; padding: 10px 20px; text-align:center; font-size:12px; color:#6b7280;">
        This message was sent from your website contact form.
      </div>
    </div>
    `,
    
  });

}
