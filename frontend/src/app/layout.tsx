import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "../providers/reactQuery";
import { AuthProvider } from "@/src/providers/AuthContext";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Metadata } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "UTIStock Prime",
  description: "Solução enterprise de controle de estoque com alta performance, segurança e escalabilidade. Ideal para operações complexas e grandes volumes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body>
        <NuqsAdapter>
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </ReactQueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
