import { createClient } from "@/lib/supabase/server";
import { Toaster } from "@/components/Toaster";
import { AppHeader } from "./AppHeader";

export default async function TripsLayout({ children }: LayoutProps<"/trips">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .maybeSingle();
    nickname = profile?.nickname ?? null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader nickname={nickname} />
      <div className="flex flex-1 flex-col">{children}</div>
      <Toaster />
    </div>
  );
}
