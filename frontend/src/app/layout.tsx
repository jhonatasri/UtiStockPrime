import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "../providers/reactQuery";
import { AuthProvider } from "@/src/providers/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

// // 
// export const metadata: Metadata = {
//   title: "UTIStock Prime",
//   description: "Solução enterprise de controle de estoque com alta performance, segurança e escalabilidade. Ideal para operações complexas e grandes volumes.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
