import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Inter } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";
import "lenis/dist/lenis.css";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body", display: "swap" });
// The hand-lettered sign-off of the family scene (page 16 of the brief).
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });

export const metadata: Metadata = {
  // Relative canonical and Open Graph links resolve against the live address.
  metadataBase: new URL(site.url),
  // Inner pages set their own title; the template adds the brand after it.
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { title: site.title, description: site.shareDescription, type: "website", locale: "en_IN", siteName: site.name },
  twitter: { card: "summary_large_image", title: site.title },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${body.variable} ${script.variable}`}><body>{children}</body></html>;
}
