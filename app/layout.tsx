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
  title: 'Paralar',
  description: 'Aplikasi pelacak keuangan dan arus kas pintar PWA dengan multi-rekening, valas, dan sinkronisasi cloud.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Paralar',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Paralar',
    description: 'Aplikasi pelacak keuangan dan arus kas pintar PWA dengan multi-rekening, valas, dan sinkronisasi cloud.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Paralar',
    description: 'Aplikasi pelacak keuangan dan arus kas pintar PWA dengan multi-rekening, valas, dan sinkronisasi cloud.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark" data-font-size="normal" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('cashflow_monochrome_theme') || localStorage.getItem('cashflow_theme');
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.classList.remove('dark');
                }
                const savedFontSize = localStorage.getItem('paralar_font_size') || 'normal';
                document.documentElement.setAttribute('data-font-size', savedFontSize);
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
