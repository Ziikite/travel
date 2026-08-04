import { createClient } from "@/lib/supabase/server";
import { PlaceBoard } from "./PlaceBoard";

export default async function PlacesPage(props: PageProps<"/trips/[tripId]/places">) {
  const { tripId } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: places }, { data: trip }, { data: members }] = await Promise.all([
    supabase
      .from("places")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false }),
    supabase.from("trips").select("destination_city").eq("id", tripId).single(),
    supabase.from("trip_members").select("user_id, profiles(nickname)").eq("trip_id", tripId),
  ]);

  const placeIds = places?.map((p) => p.id) ?? [];
  const { data: votes } = placeIds.length
    ? await supabase.from("place_votes").select("place_id, user_id").in("place_id", placeIds)
    : { data: [] };

  const memberNicknames = (members ?? []).map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return { userId: m.user_id, nickname: profile?.nickname ?? "알 수 없음" };
  });

  return (
    <PlaceBoard
      tripId={tripId}
      destinationCity={trip?.destination_city ?? null}
      currentUserId={user?.id ?? ""}
      initialPlaces={places ?? []}
      initialVotes={votes ?? []}
      memberNicknames={memberNicknames}
    />
  );
}
