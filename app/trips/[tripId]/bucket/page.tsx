import { createClient } from "@/lib/supabase/server";
import { BucketListBoard } from "./BucketListBoard";

export default async function BucketListPage(props: PageProps<"/trips/[tripId]/bucket">) {
  const { tripId } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: bucketList }, { data: members }, { data: places }] = await Promise.all([
    supabase.from("bucket_lists").select("*").eq("trip_id", tripId).limit(1).maybeSingle(),
    supabase.from("trip_members").select("user_id, profiles(nickname)").eq("trip_id", tripId),
    supabase
      .from("places")
      .select("id, name_zh")
      .eq("trip_id", tripId)
      .eq("status", "active"),
  ]);

  const { data: items } = bucketList
    ? await supabase
        .from("bucket_list_items")
        .select("*")
        .eq("bucket_list_id", bucketList.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const memberNicknames = (members ?? []).map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return { userId: m.user_id, nickname: profile?.nickname ?? "알 수 없음" };
  });

  return (
    <BucketListBoard
      tripId={tripId}
      bucketListId={bucketList?.id ?? null}
      currentUserId={user?.id ?? ""}
      initialItems={items ?? []}
      memberNicknames={memberNicknames}
      places={places ?? []}
    />
  );
}
