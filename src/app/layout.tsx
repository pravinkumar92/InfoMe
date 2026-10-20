import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "InfoMe – AI-Powered Notice Intelligence",
  description: "Get instant AI-powered alerts for government notices, university updates, scholarships, jobs, exams, and civic alerts. Never miss an important deadline.",
  keywords: "government notices, university alerts, scholarship, sarkari naukri, exam schedule, AKTU, UP government",
  openGraph: {
    title: "InfoMe | AI Notice Intelligence",
    description: "AI-Based Government & University Alert System",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Manrope:wght@600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-card-solid)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-primary)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
