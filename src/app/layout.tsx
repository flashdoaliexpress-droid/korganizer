import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korganizer",
  description: "Personal organization app for Kauã",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
