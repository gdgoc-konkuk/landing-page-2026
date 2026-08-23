import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import { Google_Sans_Flex } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { MotionConfig } from 'motion/react';

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
  // Google Sans Flex has no fallback metrics in next/font's built-in data,
  // so next/font cannot auto-generate a size-adjusted fallback face (the
  // "Failed to find font override values" build warning). Supplying an
  // explicit metrics-compatible system fallback reduces (but does not
  // fully eliminate) layout shift during the font swap.
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'GDGoC Konkuk',
  description: 'Google Developer Groups on Campus Konkuk — Share and Challenge, Together!',
  icons: '/GDG_logo.png',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${googleSans.variable}`}>
      <body>
        {/* motion/react는 기본값(reducedMotion="never")으로는 OS의 "동작 줄이기"를
            무시한다. transform/layout 애니메이션(히어로 reveal, stage sweep, CTA
            spring)에 대해 이를 강제로 존중하게 한다. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
