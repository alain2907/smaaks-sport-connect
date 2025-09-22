import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import { BottomTabs } from "@/components/navigation/BottomTabs";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMAAKS Sport Connect",
  description: "Plateforme de connexion sportive",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#5A2D82" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <BottomTabs />
        </AuthProvider>
      </body>
    </html>
  );
}
