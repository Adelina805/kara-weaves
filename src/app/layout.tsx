import type { Metadata } from "next";
import { inconsolata } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kara Weaves — Fabric Pattern Designer",
  description: "Design custom woven fabric patterns with plain, waffle, and loose weaves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inconsolata.variable} ${inconsolata.className} min-h-screen bg-stone-100 text-stone-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
