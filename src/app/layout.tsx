import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SNS Campus Navigator",
  description: "Find departments and classrooms inside SNS College of Technology, Coimbatore.",
  keywords: [
    "SNS College of Technology",
    "Campus Map",
    "Campus Navigation",
    "Coimbatore",
    "Department Finder",
    "Classroom Navigation",
  ],
  authors: [{ name: "SNS Technology Team" }],
  openGraph: {
    title: "SNS Campus Navigator",
    description: "Find departments and classrooms inside SNS College of Technology, Coimbatore.",
    url: "https://sns-campus-navigator.vercel.app",
    siteName: "SNS Campus Navigator",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
