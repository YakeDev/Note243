const normalizeHost = (value: string) =>
  value.startsWith("http") ? value : `https://${value}`;

export function resolveAppUrl(ctx?: { url?: string }) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return normalizeHost(process.env.VERCEL_URL);
  if (ctx?.url) return new URL(ctx.url).origin;
  return "http://localhost:3000";
}
