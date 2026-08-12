import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getTripMembership } from "@/lib/supabase/server";
import { TripProvider } from "@/lib/trip-context";
import { TripNav } from "./TripNav";

export default async function TripLayout(props: LayoutProps<"/trips/[tripId]">) {
  const { tripId } = await props.params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/trips/${tripId}`)}`);

  const { trip, role } = await getTripMembership(tripId);
  if (!trip || !role) notFound();

  return (
    <TripProvider value={{ tripId, role, trip }}>
      <div className="flex flex-1 flex-col">
        <TripNav />
        <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{props.children}</div>
      </div>
    </TripProvider>
  );
}
