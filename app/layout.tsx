import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://airant.co.uk"),
  title: "AIRant — Therapy for people who've argued with AI",
  description:
    "Turn your most frustrating AI moments into the apology, roast, or verdict you deserved.",
  openGraph: {
    title: "AIRant — Your AI messed up. Let it out.",
    description: "Rant. Get closure. Share the verdict.",
    url: "https://airant.co.uk",
    siteName: "AIRant",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "AIRant — Your AI messed up. Let it out." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIRant — Your AI messed up. Let it out.",
    description: "Rant. Get closure. Share the verdict.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
