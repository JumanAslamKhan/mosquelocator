import HomeClient from "@/components/home-client";
import { listMosques } from "@/lib/mosque-store";

export default async function Home() {
  const initialMosques = await listMosques({});

  return <HomeClient initialMosques={initialMosques} />;
}
