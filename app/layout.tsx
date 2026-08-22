import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import { Google_Sans_Flex } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

const googleSans = Google_Sans_Flex({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-google-sans',
});

export const metadata: Metadata = {
  title: 'GDGoC Konkuk',
  description: 'GDGoC Konkuk Landing Page',
  icons: '/GDG_logo.png',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${googleSans.variable}`}>
      <body>{children}</body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
