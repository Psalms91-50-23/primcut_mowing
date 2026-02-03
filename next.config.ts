import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: `
  //             default-src 'self';
  //             script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ 'unsafe-inline';
  //             style-src 'self' 'unsafe-inline';
  //             img-src 'self' data:;
  //             connect-src 'self' http://localhost:4000;
  //             frame-src https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
  //           `.replace(/\n/g, "").trim(),
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
