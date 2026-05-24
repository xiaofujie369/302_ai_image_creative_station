import type { Metadata } from "next";
import "@/styles/globals.css";
import SiteHeader from "@/components/saas/site-header";

export const metadata: Metadata = {
  title: "AI Image Creative Station",
  description: "A production-ready AI image generation SaaS with credits and billing.",
};

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
