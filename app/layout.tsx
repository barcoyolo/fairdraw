import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FairDraw Community Lottery",
  description: "Transparent public lottery tools for civic and community giveaways."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
