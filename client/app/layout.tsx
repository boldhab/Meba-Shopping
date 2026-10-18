import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { Providers } from "./providers";
import "../styles/globals.css";
import "../styles/variables.css";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Meba Shopping | Premier Online Supermarket & Marketplace",
    template: "%s | Meba Shopping",
  },
  description: "Discover fresh groceries, daily deals, electronics, fashion, and essentials with fast delivery and buyer protection.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans text-slate-900 bg-slate-50 antialiased selection:bg-orange-500 selection:text-white">
        <Providers>
          <div className="site-shell min-h-screen flex flex-col">
            <Navbar />
            <main className="site-main flex-1 w-full">{children}</main>
            <Footer />
            <CartDrawer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
