"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Role, ShoppingItem, ShoppingStatus } from "@/lib/types";

const STATUS_LABEL: Record<ShoppingStatus, string> = {
  pending: "미구매",
  purchased: "구매완료",
  out_of_stock: "품절",
  cancelled: "보류",
};

const STATUS_STYLE: Record<ShoppingStatus, string> = {
  pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  purchased: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  out_of_stock: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function ShoppingItemRow({
  item,
  role,
  creatorNickname,
  assigneeNickname,
  placeName,
}: {
  item: ShoppingItem;
  role: Role;
  creatorNickname: string;
  assigneeNickname: string | null;
  placeName: string | null;
}) {
  const canEdit = role === "owner" || role === "editor";
  const [actualPrice, setActualPrice] = useState(item.actual_price_cny?.toString() ?? "");

  async function updateStatus(status: ShoppingStatus) {
    const supabase = createClient();
    await supabase.from("shopping_items").update({ status }).eq("id", item.id);
  }

  async function saveActualPrice() {
    const supabase = createClient();
    await supabase
      .from("shopping_items")
      .update({ actual_price_cny: actualPrice ? Number(actualPrice) : null })
      .eq("id", item.id);
  }

  async function remove() {
    const supabase = createClient();
    await supabase.from("shopping_items").delete().eq("id", item.id);
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {item.product_name}
            {item.quantity > 1 && (
              <span className="ml-1 text-sm text-zinc-500">× {item.quantity}</span>
            )}
          </p>
          {item.product_name_zh && (
            <span className="text-sm text-zinc-500">({item.product_name_zh})</span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[item.status]}`}>
            {STATUS_LABEL[item.status]}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
            {item.purchase_type === "group" ? "공동구매" : "개인구매"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
          {placeName && <span>📍 {placeName}</span>}
          {item.expected_price_cny != null && <span>예상 ¥{item.expected_price_cny}</span>}
          {assigneeNickname && <span>담당: {assigneeNickname}</span>}
          <span>요청: {creatorNickname}</span>
          {item.reference_url && (
            <a href={item.reference_url} target="_blank" rel="noopener noreferrer" className="underline">
              참고 링크
            </a>
          )}
        </div>

        {canEdit && item.status === "purchased" && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-zinc-500">실제 구매금액(¥)</span>
            <input
              value={actualPrice}
              onChange={(e) => setActualPrice(e.target.value)}
              onBlur={saveActualPrice}
              type="number"
              step="0.01"
              className="w-24 rounded-lg border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        )}
      </div>

      {canEdit && (
        <div className="flex shrink-0 flex-col items-end gap-2">
          <select
            value={item.status}
            onChange={(e) => updateStatus(e.target.value as ShoppingStatus)}
            className="rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="pending">미구매</option>
            <option value="purchased">구매완료</option>
            <option value="out_of_stock">품절</option>
            <option value="cancelled">보류</option>
          </select>
          <button type="button" onClick={remove} className="text-xs text-red-500 hover:underline">
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
