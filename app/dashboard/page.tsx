import DashboardClient from "@/components/dashboard-client";
import { listMosques } from "@/lib/mosque-store";

export default async function DashboardPage() {
  const initialMosques = await listMosques({});

  return <DashboardClient initialMosques={initialMosques} />;
}