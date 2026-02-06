import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "./_components/ToastProvider";
export const metadata: Metadata = {
  title: "HamroPadhai",
  description: "Education Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
