import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Customer Dispatch Generator",
  description: "Generate weekly SE customer dispatch reports."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
