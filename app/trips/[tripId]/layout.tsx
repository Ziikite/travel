import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TripProvider } from "@/lib/trip-context";
import { TripNav } from "./TripNav";

export default async function TripLayout(props: LayoutProps<"/trips/[tripId]">) {
  const { tripId } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/trips/${tripId}`)}`);

  const { data: trip } = await supabase.from("trips").select("*").eq("id", tripId).maybeSingle();
  if (!trip) notFound();

  const { data: member } = await supabase
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) notFound();

  return (
    <TripProvider value={{ tripId, role: member.role, trip }}>
      <div className="flex flex-1 flex-col">
        <TripNav />
        <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{props.children}</div>
      </div>
    </TripProvider>
  );
}
