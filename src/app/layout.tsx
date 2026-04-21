import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/components/providers/auth-provider";
import { geistMono, geistSans } from "@/app/fonts";

export const metadata: Metadata = {
  title: "ExamGuard — Hệ thống thi trắc nghiệm online",
  description: "Hệ thống thi trắc nghiệm trực tuyến chống gian lận",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-bg-primary font-sans text-text-primary">
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
