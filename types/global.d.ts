export {};

declare global {
  interface Window {
    grecaptcha: any;
  }
}

declare module "*.css";