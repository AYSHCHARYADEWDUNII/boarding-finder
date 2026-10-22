import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boarding Finder | Find your place near campus",
  description: "Discover comfortable, affordable rooms near your university.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
