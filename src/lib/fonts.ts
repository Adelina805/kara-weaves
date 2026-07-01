import { Inconsolata } from "next/font/google";

export const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

export const canvasFontFamily = inconsolata.style.fontFamily;
