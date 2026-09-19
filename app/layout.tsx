import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Cashflow Tracker',
  description: 'A mobile-first cashflow tracker PWA with predictive forecasting, recurring bills, offline sync, and Supabase integration.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cashflow',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Cashflow Tracker',
    description: 'A mobile-first cashflow tracker PWA with predictive forecasting, recurring bills, offline sync, and Supabase integration.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cashflow Tracker',
    description: 'A mobile-first cashflow tracker PWA with predictive forecasting, recurring bills, offline sync, and Supabase integration.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('cashflow_theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (saved === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body 
        className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-950 transition-colors duration-200" 
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
