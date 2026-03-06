import { getDashboardData } from "./actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = await getDashboardData(locale);

  return <DashboardClient initialData={data} />;
}
