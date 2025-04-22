import type { Metadata } from "next";
import { Geist, Geist_Mono, Agu_Display, Kalam } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import { ReactQueryProvider } from "@/lib/react-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const aguDisplay = Agu_Display({
  variable: "--font-agu-display",
  subsets: ["latin"],
});
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Yygdrasil",
  description: "",
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
        <UserProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </UserProvider>
      </body>
    </html>
  );
}
