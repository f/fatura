import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
    title: "Fatura.js | GİB e-Arşiv dokümantasyonu",
    description: "fatura paketi için Türkçe dokümantasyon, API özeti ve GİB’e bağlanan canlı demo.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body>
                <div className="bg-grid" aria-hidden />
                <div className="bg-aurora" aria-hidden />
                <div className="app-shell">
                    <Header />
                    <main className="page-wrap">{children}</main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
