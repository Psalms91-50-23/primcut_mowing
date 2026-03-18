import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  // async headers() {
  //   const csp = `
  //     default-src 'self';
  //     script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://www.google.com https://www.gstatic.com;
  //     style-src 'self' 'unsafe-inline';
  //     img-src 'self' data: https://www.google.com https://www.gstatic.com;
  //     connect-src 'self' ${apiUrl} https://www.google.com https://www.gstatic.com;
  //     frame-src https://www.google.com;
  //     base-uri 'self';
  //     form-action 'self';
  //   `.replace(/\s{2,}/g, " ").trim();

  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: csp,
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;