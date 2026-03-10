export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url) => {
  window.gtag("config", GA_ID, {
    page_path: url,
  });
};
