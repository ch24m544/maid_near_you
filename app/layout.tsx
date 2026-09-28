import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://maidnearyou.in"),

  title: {
    default: "Maid Near You – Find Maids, Cooks & Cleaners Near You",
    template: "%s | Maid Near You",
  },

  description:
    "Maid Near You helps you find local maids, cooks and cleaners by city, area and locality. Maids can register their profiles for free and customers can contact them directly.",

  keywords: [
    "maid near me",
    "maid near you",
    "house maid",
    "domestic help",
    "cook near me",
    "cleaner near me",
    "part time maid",
    "full time maid",
    "maid jobs",
    "domestic worker",
    "house help",
  ],

  authors: [{ name: "Maid Near You" }],
  creator: "Maid Near You",
  publisher: "Maid Near You",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://maidnearyou.in",
    siteName: "Maid Near You",
    title: "Maid Near You – Find Maids, Cooks & Cleaners Near You",
    description:
      "Find local maids, cooks and cleaners by city, area and locality. Free registration for domestic workers.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Maid Near You",
    description:
      "Find maids, cooks and cleaners near you.",
  },

  alternates: {
    canonical: "https://maidnearyou.in",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}