"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function updateMemberRole(formData: FormData) {
  const tripId = String(formData.get("trip_id"));
  const userId = String(formData.get("user_id"));
  const role = String(formData.get("role")) as Role;

  const supabase = await createClient();
  await supabase
    .from("trip_members")
    .update({ role })
    .eq("trip_id", tripId)
    .eq("user_id", userId);

  revalidatePath(`/trips/${tripId}/settings`);
}

export async function removeMember(formData: FormData) {
  const tripId = String(formData.get("trip_id"));
  const userId = String(formData.get("user_id"));

  const supabase = await createClient();
  await supabase.from("trip_members").delete().eq("trip_id", tripId).eq("user_id", userId);

  revalidatePath(`/trips/${tripId}/settings`);
}
