import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "El Mariachi Aventurero | Gestión",
  description: "Sistema interno de gestión de serenatas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 h-screen overflow-y-auto bg-black p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
