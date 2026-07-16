import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Noto_Sans_Arabic, Archivo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
});

// Used only for the small "WSPR · BY NASAIF" footer credit — see
// components/dashboard/footer.tsx and the wspr-brand skill.
const archivo = Archivo({
  variable: "--font-archivo",
  weight: ["300", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bahrain Taekwondo Federation",
  description: "Bahrain Taekwondo Federation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSansArabic.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Runs before any React/Tailwind paint so a saved non-default theme
            (dark-mono / light) applies immediately — no flash of the Dark
            Red default on reload. Mirrors lib/theme/store.ts's localStorage
            key and "no attribute for dark-red" convention. Next.js hoists
            beforeInteractive scripts into the real <head> regardless of
            where they're declared in JSX. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('btf-theme');if(t==='dark-mono'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
