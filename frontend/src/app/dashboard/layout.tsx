'use client'
import { SidebarProvider } from "@/src/components/ui/sidebar";
import "../globals.css";
import { AppSidebar } from "@/src/components/sidebar/app-sidebar";
import { Header } from "@/src/components/header/header";
import { ReactQueryProvider } from "@/src/providers/reactQuery";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ReactQueryProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-screen h-screen bg-[#F5F7FA]">
            <Header />
            {children}
          </main>
        </SidebarProvider>
      </ReactQueryProvider>
    </div>
  );
}
