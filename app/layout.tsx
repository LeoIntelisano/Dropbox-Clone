// app/layout.tsx
import "./globals.css";
import { Providers } from "@/app/providers";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My HeroUI App",
  description: "A clean setup using HeroUI, ImageKit, and ThemeProvider",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            enableSystem: true,
          }}
        >
          {children}
        </Providers>
      </body>
    </html>
    </ClerkProvider>
  );
}
