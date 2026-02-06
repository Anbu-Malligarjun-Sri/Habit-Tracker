import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { TRPCProvider } from "@/shared/providers/trpc-provider";
import { Toaster } from "@/shared/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HabitQuest - Build Better Habits",
    template: "%s | HabitQuest",
  },
  description: "Track your habits, achieve your goals, and level up your life with gamified habit tracking.",
  keywords: ["habit tracker", "productivity", "goals", "gamification", "self-improvement"],
  authors: [{ name: "HabitQuest Team" }],
  creator: "HabitQuest",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HabitQuest",
    title: "HabitQuest - Build Better Habits",
    description: "Track your habits, achieve your goals, and level up your life with gamified habit tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitQuest - Build Better Habits",
    description: "Track your habits, achieve your goals, and level up your life with gamified habit tracking.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCProvider>
              {children}
              <Toaster richColors closeButton position="bottom-right" />
            </TRPCProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
