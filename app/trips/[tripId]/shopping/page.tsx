import { createClient } from "@/lib/supabase/server";
import { ShoppingBoard } from "./ShoppingBoard";

export default async function ShoppingPage(props: PageProps<"/trips/[tripId]/shopping">) {
  const { tripId } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: shoppingList }, { data: members }, { data: places }] = await Promise.all([
    supabase.from("shopping_lists").select("*").eq("trip_id", tripId).limit(1).maybeSingle(),
    supabase.from("trip_members").select("user_id, profiles(nickname)").eq("trip_id", tripId),
    supabase
      .from("places")
      .select("id, name_zh")
      .eq("trip_id", tripId)
      .eq("status", "active"),
  ]);

  const { data: items } = shoppingList
    ? await supabase
        .from("shopping_items")
        .select("*")
        .eq("shopping_list_id", shoppingList.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const memberNicknames = (members ?? []).map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return { userId: m.user_id, nickname: profile?.nickname ?? "알 수 없음" };
  });

  return (
    <ShoppingBoard
      tripId={tripId}
      shoppingListId={shoppingList?.id ?? null}
      currentUserId={user?.id ?? ""}
      initialItems={items ?? []}
      memberNicknames={memberNicknames}
      places={places ?? []}
    />
  );
}
