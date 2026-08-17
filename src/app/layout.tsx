import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Body / subtext font. Headings use "Netflix Sans" (self-hosted via @font-face
// in globals.css — files go in public/fonts/).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Weshort",
    template: "%s | Weshort",
  },
  description: "Watch short movies, series and more on Weshort.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body className="bg-background text-foreground">
        <div className="page-clip relative flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
