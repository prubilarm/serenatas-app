import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SISTEMA AVENTURERO v4.0",
  description: "Mariachi Aventurero",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className} style={{ background: '#000' }}>
        <div className="app-layout">
          <Sidebar />
          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
