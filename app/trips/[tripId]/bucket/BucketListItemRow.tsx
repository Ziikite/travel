"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadItemImage } from "@/lib/storage";
import { DetailDialog } from "@/components/DetailDialog";
import type { BucketListItem, BucketListStatus, Role } from "@/lib/types";

type Member = { userId: string; nickname: string };
type PlaceOption = { id: string; name_zh: string };

const CONTACT_METHODS = ["웨이신(위챗)", "따종디엔핑", "전화", "현장 예약", "기타"];

function toDatetimeLocalValue(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_LABEL: Record<BucketListStatus, string> = {
  pending: "예약 전",
  booked: "예약완료",
  done: "완료",
  cancelled: "취소",
};

const STATUS_STYLE: Record<BucketListStatus, string> = {
  pending: "bg-surface-sunken text-ink-muted",
  booked: "bg-surface-sunken text-ink",
  done: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

function formatScheduledAt(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BucketListItemRow({
  item,
  role,
  creatorNickname,
  assigneeNickname,
  placeName,
  members,
  places,
}: {
  item: BucketListItem;
  role: Role;
  creatorNickname: string;
  assigneeNickname: string | null;
  placeName: string | null;
  members: Member[];
  places: PlaceOption[];
}) {
  const canEdit = role === "owner" || role === "editor";
  const [actualPrice, setActualPrice] = useState(item.actual_price_cny?.toString() ?? "");
  const [editing, setEditing] = useState(false);
  const detailRef = useRef<HTMLDialogElement>(null);

  async function updateStatus(status: BucketListStatus) {
    const supabase = createClient();
    await supabase.from("bucket_list_items").update({ status }).eq("id", item.id);
  }

  async function saveActualPrice() {
    const supabase = createClient();
    await supabase
      .from("bucket_list_items")
      .update({ actual_price_cny: actualPrice ? Number(actualPrice) : null })
      .eq("id", item.id);
  }

  async function remove() {
    const supabase = createClient();
    await supabase.from("bucket_list_items").delete().eq("id", item.id);
    detailRef.current?.close();
  }

  return (
    <>
      <div
        onClick={() => detailRef.current?.showModal()}
        className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border p-4 hover:border-border"
      >
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.title} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-strong text-ink">{item.title}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            {placeName && <span>📍 {placeName}</span>}
            {item.scheduled_at && <span>🕒 {formatScheduledAt(item.scheduled_at)}</span>}
            {item.contact_method && (
              <span>
                연락: {item.contact_method}
                {item.contact_info ? ` (${item.contact_info})` : ""}
              </span>
            )}
            {item.expected_price_cny != null && <span>예상 ¥{item.expected_price_cny}</span>}
            {assigneeNickname && <span>담당: {assigneeNickname}</span>}
            <span>등록: {creatorNickname}</span>
            {canEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing((v) => !v);
                }}
                className="hover:underline"
              >
                {editing ? "닫기" : "수정"}
              </button>
            )}
          </div>

          {editing && (
            <div onClick={(e) => e.stopPropagation()}>
              <BucketListItemEditForm
                item={item}
                members={members}
                places={places}
                onDone={() => setEditing(false)}
              />
            </div>
          )}

          {canEdit && item.status === "done" && (
            <div onClick={(e) => e.stopPropagation()} className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-ink-muted">실제 지불금액(¥)</span>
              <input
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                onBlur={saveActualPrice}
                type="number"
                step="0.01"
                className="w-24 rounded-lg border border-border px-2 py-1"
              />
            </div>
          )}
        </div>

        {canEdit && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <select
              value={item.status}
              onChange={(e) => updateStatus(e.target.value as BucketListStatus)}
              className="rounded-lg border border-border px-2 py-1 text-xs"
            >
              <option value="pending">예약 전</option>
              <option value="booked">예약완료</option>
              <option value="done">완료</option>
              <option value="cancelled">취소</option>
            </select>
          </div>
        )}
      </div>

      <DetailDialog
        ref={detailRef}
        title={item.title}
        fields={[
          { label: "상태", value: STATUS_LABEL[item.status] },
          { label: "연락 방법", value: item.contact_method },
          { label: "연락처", value: item.contact_info },
          { label: "예약 시간", value: formatScheduledAt(item.scheduled_at) },
          {
            label: "가격",
            value:
              item.expected_price_cny != null || item.actual_price_cny != null
                ? `예상 ¥${item.expected_price_cny ?? "-"}${
                    item.actual_price_cny != null ? ` · 실제 ¥${item.actual_price_cny}` : ""
                  }`
                : null,
          },
          { label: "연관 장소", value: placeName },
          { label: "담당자", value: assigneeNickname },
          { label: "등록자", value: creatorNickname },
          { label: "메모", value: item.memo },
          {
            label: "사진",
            value: item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.title} className="max-h-64 max-w-full rounded-lg" />
            ) : null,
          },
        ]}
        actions={
          canEdit && (
            <button type="button" onClick={remove} className="text-sm text-danger hover:underline">
              삭제
            </button>
          )
        }
      />
    </>
  );
}

function BucketListItemEditForm({
  item,
  members,
  places,
  onDone,
}: {
  item: BucketListItem;
  members: Member[];
  places: PlaceOption[];
  onDone: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [contactMethod, setContactMethod] = useState(item.contact_method ?? "");
  const [contactInfo, setContactInfo] = useState(item.contact_info ?? "");
  const [expectedPrice, setExpectedPrice] = useState(item.expected_price_cny?.toString() ?? "");
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocalValue(item.scheduled_at));
  const [assignedTo, setAssignedTo] = useState(item.assigned_to ?? "");
  const [placeId, setPlaceId] = useState(item.place_id ?? "");
  const [memo, setMemo] = useState(item.memo ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const imageFile = new FormData(form).get("image") as File | null;

    const supabase = createClient();
    const imageUrl = imageFile && imageFile.size > 0 ? await uploadItemImage(imageFile) : undefined;

    await supabase
      .from("bucket_list_items")
      .update({
        title,
        contact_method: contactMethod || null,
        contact_info: contactInfo || null,
        expected_price_cny: expectedPrice ? Number(expectedPrice) : null,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        assigned_to: assignedTo || null,
        place_id: placeId || null,
        memo: memo || null,
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
      })
      .eq("id", item.id);
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 border-t border-border pt-3 dark:border-zinc-800">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        required
        className="rounded-lg border border-border px-2 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <select
          value={contactMethod}
          onChange={(e) => setContactMethod(e.target.value)}
          className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm"
        >
          <option value="">연락 방법 선택</option>
          {CONTACT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="위챗 아이디 / 전화번호 등"
          className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <input
          value={expectedPrice}
          onChange={(e) => setExpectedPrice(e.target.value)}
          type="number"
          step="0.01"
          placeholder="예상 가격(¥)"
          className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm"
        />
        <input
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          type="datetime-local"
          className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm"
        />
      </div>
      <select
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        className="rounded-lg border border-border px-2 py-1.5 text-sm"
      >
        <option value="">담당자 미정</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.nickname}
          </option>
        ))}
      </select>
      <select
        value={placeId}
        onChange={(e) => setPlaceId(e.target.value)}
        className="rounded-lg border border-border px-2 py-1.5 text-sm"
      >
        <option value="">연관 장소 없음</option>
        {places.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name_zh}
          </option>
        ))}
      </select>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모"
        rows={3}
        className="rounded-lg border border-border px-2 py-1.5 text-sm"
      />
      <div>
        <label className="mb-1 block text-xs text-ink-muted">사진 교체 (선택)</label>
        <input name="image" type="file" accept="image/*" className="block w-full text-sm text-ink-muted" />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="self-end rounded-lg bg-primary px-3 py-1.5 text-body-strong text-on-primary disabled:opacity-50"
      >
        저장
      </button>
    </form>
  );
}
