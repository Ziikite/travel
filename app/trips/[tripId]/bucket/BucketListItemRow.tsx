"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DetailDialog } from "@/components/DetailDialog";
import type { BucketListItem, BucketListStatus, Role } from "@/lib/types";

const STATUS_LABEL: Record<BucketListStatus, string> = {
  pending: "예약 전",
  booked: "예약완료",
  done: "완료",
  cancelled: "취소",
};

const STATUS_STYLE: Record<BucketListStatus, string> = {
  pending: "bg-zinc-100 text-zinc-600",
  booked: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
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
}: {
  item: BucketListItem;
  role: Role;
  creatorNickname: string;
  assigneeNickname: string | null;
  placeName: string | null;
}) {
  const canEdit = role === "owner" || role === "editor";
  const [actualPrice, setActualPrice] = useState(item.actual_price_cny?.toString() ?? "");
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
        className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-zinc-200 p-4 hover:border-zinc-300"
      >
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.title} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-zinc-900">{item.title}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
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
          </div>

          {canEdit && item.status === "done" && (
            <div onClick={(e) => e.stopPropagation()} className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-zinc-500">실제 지불금액(¥)</span>
              <input
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                onBlur={saveActualPrice}
                type="number"
                step="0.01"
                className="w-24 rounded-lg border border-zinc-300 px-2 py-1"
              />
            </div>
          )}
        </div>

        {canEdit && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <select
              value={item.status}
              onChange={(e) => updateStatus(e.target.value as BucketListStatus)}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-xs"
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
            <button type="button" onClick={remove} className="text-sm text-red-500 hover:underline">
              삭제
            </button>
          )
        }
      />
    </>
  );
}
