// types/global.d.ts
export {};

type Props = {};

declare global {
  interface Window {
    grecaptcha: any; // simplified typing for v2 + v3
  }
}
