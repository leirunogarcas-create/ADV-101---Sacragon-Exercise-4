import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scribble — a little space for big ideas",
  description: "A simple, welcoming place to keep your notes.",
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
