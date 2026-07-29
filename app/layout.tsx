import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnalyticsTracker } from "./AnalyticsTracker";

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
  title: { default: "AIRant — Therapy for People Who've Argued With AI", template: "%s | AIRant" },
  description:
    "Turn your most frustrating AI moments into the apology, roast, or verdict you deserved.",
  alternates: { canonical: "/" },
  applicationName: "AIRant",
  category: "entertainment",
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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://airant.co.uk/#organization", name: "AIRant", url: "https://airant.co.uk", logo: "https://airant.co.uk/airant-instagram-profile.png" },
      { "@type": "WebSite", "@id": "https://airant.co.uk/#website", name: "AIRant", url: "https://airant.co.uk", publisher: { "@id": "https://airant.co.uk/#organization" }, description: "Therapy for people who've argued with AI." },
      { "@type": "WebApplication", name: "AIRant", url: "https://airant.co.uk", applicationCategory: "EntertainmentApplication", operatingSystem: "Web", isAccessibleForFree: true, description: "An anonymous place to rant about a frustrating AI interaction and receive a humorous apology, roast or verdict.", offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" } },
    ],
  };
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
