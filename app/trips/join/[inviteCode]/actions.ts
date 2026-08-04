"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function joinTrip(formData: FormData) {
  const inviteCode = String(formData.get("invite_code") ?? "");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/trips/join/${inviteCode}`)}`);

  const { data: tripId, error } = await supabase.rpc("join_trip", {
    p_invite_code: inviteCode,
  });

  if (error || !tripId) {
    redirect(
      `/trips/join/${inviteCode}?error=${encodeURIComponent("초대 링크가 유효하지 않습니다.")}`
    );
  }

  redirect(`/trips/${tripId}`);
}
