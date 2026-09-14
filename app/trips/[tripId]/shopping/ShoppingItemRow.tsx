"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadItemImage } from "@/lib/storage";
import { DetailDialog } from "@/components/DetailDialog";
import type { PurchaseType, Role, ShoppingItem, ShoppingStatus } from "@/lib/types";

type Member = { userId: string; nickname: string };
type PlaceOption = { id: string; name_zh: string };

const STATUS_LABEL: Record<ShoppingStatus, string> = {
  pending: "미구매",
  purchased: "구매완료",
  out_of_stock: "품절",
  cancelled: "보류",
};

const STATUS_STYLE: Record<ShoppingStatus, string> = {
  pending: "bg-surface-sunken text-ink-muted dark:bg-zinc-800 dark:text-zinc-400",
  purchased: "bg-success/10 text-success dark:bg-emerald-950 dark:text-emerald-300",
  out_of_stock: "bg-danger/10 text-danger dark:bg-amber-950 dark:text-amber-300",
  cancelled: "bg-danger/10 text-danger dark:bg-red-950 dark:text-red-300",
};

export function ShoppingItemRow({
  item,
  role,
  creatorNickname,
  assigneeNickname,
  placeName,
  members,
  places,
}: {
  item: ShoppingItem;
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
    detailRef.current?.close();
  }

  return (
    <>
      <div
        onClick={() => detailRef.current?.showModal()}
        className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border p-4 hover:border-border dark:border-zinc-800"
      >
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.product_name}
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-strong text-ink dark:text-zinc-50">
              {item.product_name}
              {item.quantity > 1 && (
                <span className="ml-1 text-sm text-ink-muted">× {item.quantity}</span>
              )}
            </p>
            {item.product_name_zh && (
              <span className="text-sm text-ink-muted">({item.product_name_zh})</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-ink-muted dark:bg-zinc-800">
              {item.purchase_type === "group" ? "공동구매" : "개인구매"}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            {placeName && <span>📍 {placeName}</span>}
            {item.expected_price_cny != null && <span>예상 ¥{item.expected_price_cny}</span>}
            {assigneeNickname && <span>담당: {assigneeNickname}</span>}
            <span>요청: {creatorNickname}</span>
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
              <ShoppingItemEditForm
                item={item}
                members={members}
                places={places}
                onDone={() => setEditing(false)}
              />
            </div>
          )}

          {canEdit && item.status === "purchased" && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-2 flex items-center gap-2 text-xs"
            >
              <span className="text-ink-muted">실제 구매금액(¥)</span>
              <input
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                onBlur={saveActualPrice}
                type="number"
                step="0.01"
                className="w-24 rounded-lg border border-border px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          )}
        </div>

        {canEdit && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <select
              value={item.status}
              onChange={(e) => updateStatus(e.target.value as ShoppingStatus)}
              className="rounded-lg border border-border px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="pending">미구매</option>
              <option value="purchased">구매완료</option>
              <option value="out_of_stock">품절</option>
              <option value="cancelled">보류</option>
            </select>
          </div>
        )}
      </div>

      <DetailDialog
        ref={detailRef}
        title={item.product_name}
        subtitle={item.product_name_zh ?? undefined}
        fields={[
          { label: "상태", value: STATUS_LABEL[item.status] },
          { label: "구매유형", value: item.purchase_type === "group" ? "공동구매" : "개인구매" },
          { label: "수량", value: item.quantity },
          {
            label: "가격",
            value:
              item.expected_price_cny != null || item.actual_price_cny != null
                ? `예상 ¥${item.expected_price_cny ?? "-"}${
                    item.actual_price_cny != null ? ` · 실제 ¥${item.actual_price_cny}` : ""
                  }`
                : null,
          },
          { label: "구매 장소", value: placeName },
          { label: "담당자", value: assigneeNickname },
          { label: "요청자", value: creatorNickname },
          {
            label: "참고 링크",
            value: item.reference_url ? (
              <a href={item.reference_url} target="_blank" rel="noopener noreferrer" className="text-ink underline">
                {item.reference_url}
              </a>
            ) : null,
          },
          {
            label: "사진",
            value: item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.product_name} className="max-h-64 max-w-full rounded-lg" />
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

function ShoppingItemEditForm({
  item,
  members,
  places,
  onDone,
}: {
  item: ShoppingItem;
  members: Member[];
  places: PlaceOption[];
  onDone: () => void;
}) {
  const [productName, setProductName] = useState(item.product_name);
  const [productNameZh, setProductNameZh] = useState(item.product_name_zh ?? "");
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [expectedPrice, setExpectedPrice] = useState(item.expected_price_cny?.toString() ?? "");
  const [assignedTo, setAssignedTo] = useState(item.assigned_to ?? "");
  const [placeId, setPlaceId] = useState(item.place_id ?? "");
  const [referenceUrl, setReferenceUrl] = useState(item.reference_url ?? "");
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(item.purchase_type);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const imageFile = new FormData(form).get("image") as File | null;

    const supabase = createClient();
    const imageUrl = imageFile && imageFile.size > 0 ? await uploadItemImage(imageFile) : undefined;

    await supabase
      .from("shopping_items")
      .update({
        product_name: productName,
        product_name_zh: productNameZh || null,
        quantity: Number(quantity) || 1,
        expected_price_cny: expectedPrice ? Number(expectedPrice) : null,
        assigned_to: assignedTo || null,
        place_id: placeId || null,
        reference_url: referenceUrl || null,
        purchase_type: purchaseType,
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
      })
      .eq("id", item.id);
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 border-t border-border pt-3 dark:border-zinc-800">
      <input
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="상품명"
        required
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <input
        value={productNameZh}
        onChange={(e) => setProductNameZh(e.target.value)}
        placeholder="중국어 상품명"
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <div className="flex gap-2">
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          type="number"
          min={1}
          placeholder="수량"
          className="w-20 rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <input
          value={expectedPrice}
          onChange={(e) => setExpectedPrice(e.target.value)}
          type="number"
          step="0.01"
          placeholder="예상 가격(¥)"
          className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>
      <select
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
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
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      >
        <option value="">구매 장소 미정</option>
        {places.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name_zh}
          </option>
        ))}
      </select>
      <input
        value={referenceUrl}
        onChange={(e) => setReferenceUrl(e.target.value)}
        placeholder="타오바오·샤오홍슈 링크"
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <div>
        <label className="mb-1 block text-xs text-ink-muted">사진 교체 (선택)</label>
        <input name="image" type="file" accept="image/*" className="block w-full text-sm text-ink-muted dark:text-zinc-300" />
      </div>
      <div className="flex gap-3 text-sm">
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={purchaseType === "group"}
            onChange={() => setPurchaseType("group")}
          />{" "}
          공동 구매
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={purchaseType === "personal"}
            onChange={() => setPurchaseType("personal")}
          />{" "}
          개인 구매
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="self-end rounded-lg bg-primary px-3 py-1.5 text-body-strong text-on-primary disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        저장
      </button>
    </form>
  );
}
