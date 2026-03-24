import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'ServiMatch — Encuentra el profesional ideal', template: '%s | ServiMatch' },
  description: 'Conecta con plomeros, electricistas, soldadores y más. Profesionales verificados cerca de ti.',
  keywords: ['plomero', 'electricista', 'soldador', 'servicios a domicilio', 'Colombia'],
  openGraph: {
    title: 'ServiMatch',
    description: 'Marketplace de servicios bajo demanda en Colombia',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="flex flex-col min-h-screen font-sans">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}