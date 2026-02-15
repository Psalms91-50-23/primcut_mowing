// export const useRecaptcha = () => {
//   const loadV3 = () =>
//     new Promise<void>((resolve, reject) => {
//       if (!window.grecaptcha) return reject("reCAPTCHA v3 not loaded");
//       window.grecaptcha.ready(resolve);
//     });

//   const loadV2 = () =>
//     new Promise<void>((resolve) => {
//       if (document.getElementById("v2-script")) resolve();
//       else {
//         const script = document.createElement("script");
//         script.src = "https://www.google.com/recaptcha/api.js";
//         script.id = "v2-script";
//         script.onload = () => resolve();
//         document.body.appendChild(script);
//       }
//     });

//   return { loadV3, loadV2 };
// };

export const useRecaptcha = () => {
  const loadV3 = () =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return reject("No window");

      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(resolve);
        return;
      }

      // Prevent duplicate script
      if (document.getElementById("recaptcha-v3-script")) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY}`;
      script.id = "recaptcha-v3-script";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(resolve);
        } else {
          reject("reCAPTCHA v3 failed to load");
        }
      };

      script.onerror = () => reject("Failed to load reCAPTCHA v3");

      document.body.appendChild(script);
    });

  const loadV2 = () =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return reject("No window");

      if (document.getElementById("recaptcha-v2-script")) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.id = "recaptcha-v2-script";
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = () => reject("Failed to load reCAPTCHA v2");

      document.body.appendChild(script);
    });

  return { loadV3, loadV2 };
};