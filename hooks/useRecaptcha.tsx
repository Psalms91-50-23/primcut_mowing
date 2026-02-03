export const useRecaptcha = () => {
  const loadV3 = () =>
    new Promise<void>((resolve, reject) => {
      if (!window.grecaptcha) return reject("reCAPTCHA v3 not loaded");
      window.grecaptcha.ready(resolve);
    });

  const loadV2 = () =>
    new Promise<void>((resolve) => {
      if (document.getElementById("v2-script")) resolve();
      else {
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js";
        script.id = "v2-script";
        script.onload = () => resolve();
        document.body.appendChild(script);
      }
    });

  return { loadV3, loadV2 };
};
