"use server";

import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";

export async function createTrip(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/trips");

  const title = String(formData.get("title") ?? "").trim();
  const destinationCity = String(formData.get("destination_city") ?? "").trim() || null;
  const startDate = String(formData.get("start_date") ?? "") || null;
  const endDate = String(formData.get("end_date") ?? "") || null;

  if (!title) {
    redirect(`/trips?error=${encodeURIComponent("여행 제목을 입력해주세요.")}`);
  }

  let lastErrorMessage = "여행방 생성에 실패했습니다.";

  for (let attempt = 0; attempt < 5; attempt++) {
    const inviteCode = nanoid(8);
    const { data, error } = await supabase
      .from("trips")
      .insert({
        owner_id: user.id,
        title,
        destination_city: destinationCity,
        start_date: startDate,
        end_date: endDate,
        invite_code: inviteCode,
      })
      .select("id")
      .single();

    if (!error && data) {
      redirect(`/trips/${data.id}`);
    }

    lastErrorMessage = error?.message ?? lastErrorMessage;
    if (error?.code !== "23505") break;
  }

  redirect(`/trips?error=${encodeURIComponent(lastErrorMessage)}`);
}
