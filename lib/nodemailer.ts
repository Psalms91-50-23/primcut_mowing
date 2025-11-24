import nodemailer from "nodemailer";

export const sendEmail = async (name: string, phone: string,  email: string, message: string) => {
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: Number(process.env.EMAIL_PORT),
    service: "Gmail",
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // background-image: url('https://yourdomain.com/path-to-image.jpg'); 

  await transporter.sendMail({
    from: `"Primcut Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.SEND_TO,
    subject: `New Message from ${name}`,
    text: `Name: ${name} \nPhone: ${phone}\nEmail: ${email}\nMessage:\n${message}`,
    html: `
          <div>
           <div style="
            background-color: #2f855a; 
            background-size: cover; 
            color: white; 
            padding: 20px;
            text-align: center;
          ">   
            <h1><strong>PrimCut Mowing ltd</strong></h1>
          </div>
            <h3>New Message from Website Contact Form</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong><br/>${message}</p>
          </div>
           `,
  });
};