const SITE_URL = "https://farda-foundation.vercel.app";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}
