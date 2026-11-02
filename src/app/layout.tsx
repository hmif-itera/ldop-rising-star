import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/modules/shared';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TERRAFEST 2026 - Terra Festival ITERA',
  description: 'Platform Resmi Manajemen Acara dan Tiket Konser Terra Festival ITERA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
