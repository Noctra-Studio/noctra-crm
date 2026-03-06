import type { Metadata } from "next";
import DashboardLayoutClient from "./DashboardLayoutClient";
import { getDashboardData } from "./actions";

export const metadata: Metadata = {
  title: "Dashboard | Noctra Studio",
  description: "Project status and deliverables.",
  icons: [
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "/favicon-dark.svg",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "/favicon-light.svg",
      media: "(prefers-color-scheme: dark)",
    },
  ],
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = await getDashboardData(locale);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <DashboardLayoutClient profile={data?.profile}>
        {children}
      </DashboardLayoutClient>
    </div>
  );
}
