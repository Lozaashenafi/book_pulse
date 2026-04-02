import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import { AuthProvider } from "@/components/auth-provider"; // Import here
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  metadataBase: new URL("https://bookpulse.lozi.me"),
  title: {
    default: "BookPulse | Turn the page, together",
    template: "%s | BookPulse",
  },
  description: "BookPulse is a social reading platform...",
  openGraph: {
    title: "BookPulse | Turn the page, together",
    description: "The social reading platform for book lovers.",
    url: "https://bookpulse.lozi.me",
    siteName: "BookPulse",
    images: [
      {
        url: "https://bookpulse.lozi.me/image/home.png", // Full URL
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://bookpulse.lozi.me/image/home.png"], // Full URL
  },
};


// app/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Google Analytics Script */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
      </Script>

      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* FIX: Children MUST be inside the ThemeProvider tags */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              // Added a custom linear-gradient to the end of the string to act as the "vein"
              toast:
                "group w-full flex items-center gap-4 p-5 bg-[#fdfcf8] dark:bg-[#1a1c1a] border-2 border-tertiary  shadow-[8px_8px_20px_rgba(26,63,34,0.15)] relative overflow-hidden bg-[linear-gradient(135deg,transparent_49.5%,rgba(26,63,34,0.05)_50%,transparent_50.5%)] dark:bg-[linear-gradient(135deg,transparent_49.5%,rgba(212,163,115,0.05)_50%,transparent_50.5%)]",
              title:
                "font-serif font-black text-tertiary dark:text-[#d4a373] text-base leading-tight",
              description:
                "font-serif italic text-xs text-primary-half dark:text-gray-400 mt-1",
              success:
                "bg-gradient-to-br from-[#fdfcf8] to-[#f0f7f1] !border-tertiary",
              error:
                "bg-gradient-to-br from-[#fdfcf8] to-[#fff5f5] !border-red-900",
            },
          }}
        />
      </body>
    </html>
  );
}
