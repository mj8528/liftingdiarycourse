import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import HeaderAuth from "./components/HeaderAuth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lifting Diary",
  description: "Track your lifting progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <div className="fixed top-4 left-4 z-50">
              <span className="text-lg font-bold tracking-tight">Lifting Diary</span>
            </div>
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
              <ThemeToggle />
              <HeaderAuth />
            </div>
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
