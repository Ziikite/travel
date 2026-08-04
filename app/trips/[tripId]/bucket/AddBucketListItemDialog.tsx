"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Member = { userId: string; nickname: string };
type PlaceOption = { id: string; name_zh: string };

const CONTACT_METHODS = ["웨이신(위챗)", "따종디엔핑", "전화", "현장 예약", "기타"];

export function AddBucketListItemDialog({
  bucketListId,
  currentUserId,
  members,
  places,
}: {
  bucketListId: string;
  currentUserId: string;
  members: Member[];
  places: PlaceOption[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const expectedPrice = formData.get("expected_price_cny");
    const assignedTo = String(formData.get("assigned_to") ?? "");
    const placeId = String(formData.get("place_id") ?? "");
    const scheduledAtLocal = String(formData.get("scheduled_at") ?? "");

    await supabase.from("bucket_list_items").insert({
      bucket_list_id: bucketListId,
      created_by: currentUserId,
      title: String(formData.get("title") ?? ""),
      contact_method: String(formData.get("contact_method") ?? "") || null,
      contact_info: String(formData.get("contact_info") ?? "") || null,
      expected_price_cny: expectedPrice ? Number(expectedPrice) : null,
      scheduled_at: scheduledAtLocal ? new Date(scheduledAtLocal).toISOString() : null,
      assigned_to: assignedTo || null,
      place_id: placeId || null,
      memo: String(formData.get("memo") ?? "") || null,
    });

    setSaving(false);
    e.currentTarget.reset();
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
      >
        + 버킷리스트 추가
      </button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 p-6 backdrop:bg-black/40"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-zinc-900">버킷리스트 추가</h2>

          <input
            name="title"
            placeholder="예: 발마사지 예약"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            <select
              name="contact_method"
              defaultValue=""
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">연락 방법 선택</option>
              {CONTACT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              name="contact_info"
              placeholder="위챗 아이디 / 전화번호 등"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <input
              name="expected_price_cny"
              type="number"
              step="0.01"
              placeholder="예상 가격(¥)"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              name="scheduled_at"
              type="datetime-local"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>

          <select
            name="assigned_to"
            defaultValue=""
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">담당자 미정</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.nickname}
              </option>
            ))}
          </select>

          {places.length > 0 && (
            <select
              name="place_id"
              defaultValue=""
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">연관 장소 없음</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name_zh}
                </option>
              ))}
            </select>
          )}

          <textarea
            name="memo"
            placeholder="메모 (예약 방법, 유의사항 등)"
            rows={2}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg px-4 py-2 text-sm text-zinc-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
