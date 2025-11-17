import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: {
    default: "Sejenak Beauty Lounge",
    template: "%s | Sejenak Beauty Lounge",
  },
  description: "Award-winning spa experience combining traditional Indonesian wellness techniques with modern luxury. Book your appointment and transform your beauty journey.",
  keywords: ["spa", "beauty", "wellness", "massage", "facial", "hair salon", "Indonesia", "luxury spa"],
  authors: [{ name: "Sejenak Beauty Lounge" }],
  creator: "Sejenak Beauty Lounge",
  publisher: "Sejenak Beauty Lounge",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sejenakbeauty.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Sejenak Beauty Lounge",
    title: "Sejenak Beauty Lounge - Award-Winning Spa Experience",
    description: "Discover the perfect blend of traditional Indonesian wellness techniques and modern luxury. Our expert therapists create personalized experiences that rejuvenate your body, mind, and spirit.",
    images: [
      {
        url: "/images/Logo Baru Sejenak-03.png",
        width: 1200,
        height: 630,
        alt: "Sejenak Beauty Lounge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sejenak Beauty Lounge - Award-Winning Spa Experience",
    description: "Discover the perfect blend of traditional Indonesian wellness techniques and modern luxury.",
    images: ["/images/Logo Baru Sejenak-03.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  category: "beauty",
  applicationName: "Sejenak Beauty Lounge",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0EEED" },
    { media: "(prefers-color-scheme: dark)", color: "#191919" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/"
      signUpUrl="/"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
