export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Note243 | Avis clients Lubumbashi",
  description:
    "Plateforme d'avis clients pour les établissements de Lubumbashi (inspiré Trustpilot / Google Reviews).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Header />
          <main className="min-h-screen bg-slate-50">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

