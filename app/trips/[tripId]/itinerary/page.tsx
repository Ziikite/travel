import { createClient } from "@/lib/supabase/server";
import { ItineraryBoard } from "./ItineraryBoard";

export default async function ItineraryPage(props: PageProps<"/trips/[tripId]/itinerary">) {
  const { tripId } = await props.params;
  const supabase = await createClient();

  const [{ data: trip }, { data: itineraries }, { data: places }] = await Promise.all([
    supabase.from("trips").select("start_date, end_date").eq("id", tripId).single(),
    supabase.from("itineraries").select("*").eq("trip_id", tripId).order("itinerary_date"),
    supabase
      .from("places")
      .select("*")
      .eq("trip_id", tripId)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  const itineraryIds = itineraries?.map((i) => i.id) ?? [];
  const { data: itineraryPlaces } = itineraryIds.length
    ? await supabase
        .from("itinerary_places")
        .select("*, places(*)")
        .in("itinerary_id", itineraryIds)
        .order("visit_order", { ascending: true })
    : { data: [] };

  return (
    <ItineraryBoard
      tripId={tripId}
      tripStartDate={trip?.start_date ?? null}
      tripEndDate={trip?.end_date ?? null}
      initialItineraries={itineraries ?? []}
      initialItineraryPlaces={itineraryPlaces ?? []}
      allPlaces={places ?? []}
    />
  );
}
