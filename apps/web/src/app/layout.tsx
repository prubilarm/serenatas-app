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
