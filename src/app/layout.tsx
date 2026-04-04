import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const BASE_URL = "https://grandsummit.studentsxceos.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "StudentsxCEOs Grand Summit 15th",
    template: "%s | SXC Grand Summit 15th",
  },
  description:
    "StudentsxCEOs Grand Summit 15th — Indonesia's premier student business competition featuring Business Case Competition (BCC) and Management Case Competition (MCC). Open to undergraduate students nationwide.",
  keywords: [
    "StudentsxCEOs",
    "Grand Summit",
    "Grand Summit 15th",
    "SXC Grand Summit",
    "Business Case Competition",
    "BCC",
    "Management Case Competition",
    "MCC",
    "kompetisi bisnis mahasiswa",
    "business competition Indonesia",
    "student competition",
    "Bandung",
    "ITB",
  ],
  authors: [{ name: "StudentsxCEOs" }],
  creator: "StudentsxCEOs",
  publisher: "StudentsxCEOs",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "SXC Grand Summit 15th",
    title: "StudentsxCEOs Grand Summit 15th",
    description:
      "Indonesia's premier student business competition. Join BCC or MCC and compete for IDR 24.000.000++ in prizes. Open to undergraduate students nationwide.",
    images: [
      {
        url: "/grand-summit-logo.png",
        width: 1200,
        height: 630,
        alt: "StudentsxCEOs Grand Summit 15th",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudentsxCEOs Grand Summit 15th",
    description:
      "Indonesia's premier student business competition. Join BCC or MCC and compete for IDR 24.000.000++ in prizes.",
    images: ["/grand-summit-logo.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${plusJakartaSans.variable} ${poppins.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
