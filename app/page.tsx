import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import PlannerApp from "@/components/PlannerApp";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <PlannerApp userId={user.id} userEmail={user.email ?? ""} />;
}
