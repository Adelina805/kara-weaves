import type { Metadata } from "next";
import { inconsolata } from "@/lib/fonts";
import karaWeavesLogo from "./kara-weaves-logo.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kara Weaves Design Workspace",
  description: "Design custom woven fabric patterns with plain, waffle, and loose weaves.",
  icons: {
    icon: karaWeavesLogo.src,
  },
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
