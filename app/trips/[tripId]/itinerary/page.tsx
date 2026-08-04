import { createClient } from "@/lib/supabase/server";
import { ItineraryBoard } from "./ItineraryBoard";

export default async function ItineraryPage(props: PageProps<"/trips/[tripId]/itinerary">) {
  const { tripId } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: trip }, { data: itineraries }, { data: places }, { data: shoppingList }, { data: members }] =
    await Promise.all([
      supabase.from("trips").select("start_date, end_date").eq("id", tripId).single(),
      supabase.from("itineraries").select("*").eq("trip_id", tripId).order("itinerary_date"),
      supabase
        .from("places")
        .select("*")
        .eq("trip_id", tripId)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase.from("shopping_lists").select("id").eq("trip_id", tripId).limit(1).maybeSingle(),
      supabase.from("trip_members").select("user_id, profiles(nickname)").eq("trip_id", tripId),
    ]);

  const itineraryIds = itineraries?.map((i) => i.id) ?? [];
  const { data: itineraryPlaces } = itineraryIds.length
    ? await supabase
        .from("itinerary_places")
        .select("*, places(*)")
        .in("itinerary_id", itineraryIds)
        .order("visit_order", { ascending: true })
    : { data: [] };

  const memberNicknames = (members ?? []).map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return { userId: m.user_id, nickname: profile?.nickname ?? "알 수 없음" };
  });

  return (
    <ItineraryBoard
      tripId={tripId}
      tripStartDate={trip?.start_date ?? null}
      tripEndDate={trip?.end_date ?? null}
      initialItineraries={itineraries ?? []}
      initialItineraryPlaces={itineraryPlaces ?? []}
      allPlaces={places ?? []}
      currentUserId={user?.id ?? ""}
      shoppingListId={shoppingList?.id ?? null}
      memberNicknames={memberNicknames}
    />
  );
}
