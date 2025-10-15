import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  variable: "--font-sans" 
});

export const metadata: Metadata = {
  title: "Njila",
  description: "Njila Logistics Dashboard - Efficient delivery coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          poppins.variable
        )}
      >
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
