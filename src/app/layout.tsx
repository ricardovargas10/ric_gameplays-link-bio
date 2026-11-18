import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ric Gameplays | Gameplays e lives",
  description: "Gameplays, lives e muita resenha.",
  openGraph: {
    title: "Ric Gameplays | Gameplays e lives",
    description: "Gameplays, lives e muita resenha.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#C41A3B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      {process.env.NEXT_PUBLIC_ADOBE_FONTS_ID ? (
        <head>
          <link rel="stylesheet" href={`https://use.typekit.net/${process.env.NEXT_PUBLIC_ADOBE_FONTS_ID}.css`} />
        </head>
      ) : null}
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
