import type { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
  Montserrat,
  Roboto,
  Poppins,
} from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider as SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ResearcherProvider } from '@/contexts/ResearcherContext';
import AuthGate from '@/components/AuthGate';

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['700'],
});

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'OTI UNI Tech Lab',
  description:
    'Laboratorio Virtual 3D - Gestión y visualización de equipos de vanguardia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  document.documentElement.className = document.documentElement.className.replace(/light|dark/g, '').trim() + ' ' + theme;
                } catch (e) {
                  document.documentElement.className = document.documentElement.className.replace(/light|dark/g, '').trim() + ' dark';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${roboto.variable} ${poppins.variable} antialiased`}
      >
        <ThemeProvider>
          <SupabaseAuthProvider>
            <AuthGate>
              <InventoryProvider>
                <ProjectProvider>
                  <ResearcherProvider>{children}</ResearcherProvider>
                </ProjectProvider>
              </InventoryProvider>
            </AuthGate>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
