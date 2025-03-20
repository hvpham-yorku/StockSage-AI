import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/header";
import { SidebarProvider} from "@/context/sidebarContext";
import { Sidebar } from "@/components/sidebar";
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
  title: "StockSage-AI | Stock Trading Simulator",
  description: "AI-Enhanced Stock Trading Simulator for educational purposes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f0f0f] text-[#ededed]`}
      >

      <ThemeProvider>
          <SidebarProvider>
              <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <div className="flex flex-1 flex-col overflow-hidden">
                      <Header />
                      <main className="flex-1 overflow-auto bg-muted/40 pb-6">{children}</main>
                  </div>
              </div>
          </SidebarProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}