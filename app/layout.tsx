import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HL7 Explorer - Parse, Inspect, and Create HL7 v2 Messages",
  description: "A powerful web application for parsing, inspecting, and creating HL7 v2 messages. Supports MDM^T02 messages with intuitive tree, table, and raw views. Built for healthcare IT professionals and developers.",
  keywords: [
    "HL7",
    "HL7 v2",
    "HL7 parser",
    "HL7 generator",
    "MDM messages",
    "healthcare integration",
    "HL7 explorer",
    "HL7 inspector",
    "healthcare IT",
    "HL7 message",
    "HL7 viewer",
    "HL7 creator",
  ],
  authors: [{ name: "Metourni Noureddine", url: "https://www.linkedin.com/in/metourni-noureddine/" }],
  creator: "Metourni Noureddine",
  openGraph: {
    type: "website",
    title: "HL7 Explorer - Parse, Inspect, and Create HL7 v2 Messages",
    description: "A powerful web application for parsing, inspecting, and creating HL7 v2 messages. Supports MDM^T02 messages with intuitive tree, table, and raw views.",
    siteName: "HL7 Explorer",
  },
  twitter: {
    card: "summary_large_image",
    title: "HL7 Explorer - Parse, Inspect, and Create HL7 v2 Messages",
    description: "A powerful web application for parsing, inspecting, and creating HL7 v2 messages. Supports MDM^T02 messages.",
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
  verification: {
    // Add your verification codes here if needed
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
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

