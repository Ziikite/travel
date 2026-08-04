"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PurchaseType } from "@/lib/types";

type Member = { userId: string; nickname: string };
type PlaceOption = { id: string; name_zh: string };

export function AddShoppingItemDialog({
  shoppingListId,
  currentUserId,
  members,
  places,
}: {
  shoppingListId: string;
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

    const quantity = Number(formData.get("quantity") ?? 1) || 1;
    const expectedPrice = formData.get("expected_price_cny");
    const assignedTo = String(formData.get("assigned_to") ?? "");
    const placeId = String(formData.get("place_id") ?? "");

    await supabase.from("shopping_items").insert({
      shopping_list_id: shoppingListId,
      created_by: currentUserId,
      product_name: String(formData.get("product_name") ?? ""),
      product_name_zh: String(formData.get("product_name_zh") ?? "") || null,
      quantity,
      expected_price_cny: expectedPrice ? Number(expectedPrice) : null,
      assigned_to: assignedTo || null,
      place_id: placeId || null,
      reference_url: String(formData.get("reference_url") ?? "") || null,
      purchase_type: formData.get("purchase_type") as PurchaseType,
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
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        + 상품 추가
      </button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 p-6 backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">쇼핑 항목 추가</h2>

          <input
            name="product_name"
            placeholder="상품명 (예: 훠궈 소스)"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            name="product_name_zh"
            placeholder="중국어 상품명"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />

          <div className="flex gap-2">
            <input
              name="quantity"
              type="number"
              min={1}
              defaultValue={1}
              placeholder="수량"
              className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
            <input
              name="expected_price_cny"
              type="number"
              step="0.01"
              placeholder="예상 가격(¥)"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <select
            name="assigned_to"
            defaultValue=""
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
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
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">구매 장소 미정</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name_zh}
                </option>
              ))}
            </select>
          )}

          <input
            name="reference_url"
            placeholder="타오바오·샤오홍슈 링크"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />

          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="purchase_type" value="group" defaultChecked /> 공동 구매
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="purchase_type" value="personal" /> 개인 구매
            </label>
          </div>

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
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              추가
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
