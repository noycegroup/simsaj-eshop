export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://simsaj.sk").replace(/\/$/, "");

export const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();
