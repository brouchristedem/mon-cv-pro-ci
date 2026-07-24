import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AuthProvider } from "@/lib/AuthContext";

const siteUrl = "https://mon-cv-pro-ci.vercel.app";
const title = "Mon CV Pro CI — Créez un CV professionnel en quelques minutes";
const description =
  "Créez un CV professionnel et moderne, prisé par les recruteurs internationaux. 15 modèles, personnalisation complète, export PDF. Pensé pour la Côte d'Ivoire.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Mon CV Pro CI",
  },
  description,
  keywords: [
    "créer un CV",
    "CV en ligne",
    "CV professionnel",
    "modèle de CV",
    "CV gratuit",
    "CV Côte d'Ivoire",
    "CV Abidjan",
    "générateur de CV",
    "faire un CV PDF",
  ],
  authors: [{ name: "CV Pro CI" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  verification: {
    google: "p9gV1Gq-92jhVbkcomEXCRKBbOKmkzbU8k9ZCZfd-H0",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Mon CV Pro CI",
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mon CV Pro CI — Créez un CV professionnel en quelques minutes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Mon CV Pro CI",
              url: siteUrl,
              description,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                priceCurrency: "XOF",
                price: "500",
              },
              inLanguage: ["fr", "en"],
            }),
          }}
        />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
