import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "./providers";
import "@/styles/globals.css";
import "@/styles/variables.css";

export const metadata: Metadata = {
  title: "Meba Shopping",
  description: "Full-stack shopping platform for storefront, account, and admin flows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="site-shell">
            <Navbar />
            <main className="site-main">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
