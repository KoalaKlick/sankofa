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
  title: "PanEvent",
  description: "Create, Manage & Grow Events with Real-Time Power",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-sm.png",
    shortcut: "/logo-sm.png",
    apple: "/logo-sm.png",
  },
  metadataBase: new URL('https://sankofa-one.vercel.app/'), // Replace with your actual domain
  openGraph: {
    title: "PanEvent",
    description: "Create, Manage & Grow Events with Real-Time Power",
    url: '/',
    siteName: 'PanEvent',
    images: [
      {
        url: '/og-1.webp', // Create a proper OG image (1200x630px)
        width: 1200,
        height: 630,
        alt: 'PanEvent - Event Management Platform',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: "summary_large_image", // Changed from "summary" for better preview
    title: "PanEvent",
    description: "Create, Manage & Grow Events with Real-Time Power",
    images: ["/og-1.webp"], // Use same OG image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/logo-sm.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo-sm.png" />
        <link rel="apple-touch-icon" href="/logo-sm.png" />
        <link rel="shortcut icon" href="/logo-sm.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}