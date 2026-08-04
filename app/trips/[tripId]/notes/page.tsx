import { createClient } from "@/lib/supabase/server";
import { NotesBoard } from "./NotesBoard";

export default async function NotesPage(props: PageProps<"/trips/[tripId]/notes">) {
  const { tripId } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: notes }, { data: members }] = await Promise.all([
    supabase
      .from("info_notes")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false }),
    supabase.from("trip_members").select("user_id, profiles(nickname)").eq("trip_id", tripId),
  ]);

  const memberNicknames = (members ?? []).map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return { userId: m.user_id, nickname: profile?.nickname ?? "알 수 없음" };
  });

  return (
    <NotesBoard
      tripId={tripId}
      currentUserId={user?.id ?? ""}
      initialNotes={notes ?? []}
      memberNicknames={memberNicknames}
    />
  );
}
