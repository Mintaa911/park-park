import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ReactQueryClientProvider } from "@/components/reactquery-client-provider";
import { Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Park Park",
  description: "Parking made easy",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <nav className="w-full flex justify-center h-16 fixed top-0 bg-white">
              <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                  <Link href={"/"}>
                    <div className="flex items-center gap-1 cursor-pointer">
                      <Image
                        className="p-1"
                        src="/logo3.png"
                        alt="Logo"
                        width={50}
                        height={50}
                      />
                      <span className="text-xl font-bold tracking-tight text-gray-800">
                        Pro Parking
                      </span>{" "}
                    </div>
                  </Link>
                </div>
              </div>
            </nav>
            <main className="mt-24">
              {children}
            </main>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
