import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "HCM - Healthcare Commodities Management",
  description:
    "Streamline healthcare commodity management with real-time tracking, analytics, and inventory optimization.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export const viewport: Viewport = {
  themeColor: "#1A2B4A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#f0f4f8",
              color: "#2d3748",
              borderRadius: "8px",
              padding: "12px 16px",
              boxShadow:
                "2px 2px 5px #d1d9e6, -2px -2px 5px #ffffff",
              fontWeight: "500",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
