import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Matchday - Booking Lapangan Futsal & Badminton",
    template: "%s · Matchday",
  },
  description: "Cari lapangan, pilih jam main, dan booking dalam hitungan menit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        {children}
        <Toaster position="top-center" theme="light" richColors />
      </body>
    </html>
  );
}
