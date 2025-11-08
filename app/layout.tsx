import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhereToSit - Carpooling Coordinator",
  description: "WhenToMeet but for carpooling. Organize rides with your friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
