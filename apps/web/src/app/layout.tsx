import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Meba Supermarket",
  description: "Online supermarket platform for customers and administrators."
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

