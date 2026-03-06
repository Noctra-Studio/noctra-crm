import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal | Noctra Studio",
  description: "Access your project dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
