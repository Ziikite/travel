"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadItemImage } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import { PlaceMapSearch } from "@/components/PlaceMapSearch";
import type { PlaceSearchResult } from "@/lib/maps";
import type { PurchaseType } from "@/lib/types";

type Member = { userId: string; nickname: string };
type PlaceOption = { id: string; name_zh: string };
type PlaceMode = "existing" | "search" | "manual";

export function AddShoppingItemDialog({
  tripId,
  shoppingListId,
  currentUserId,
  members,
  places,
  destinationCity,
}: {
  tripId: string;
  shoppingListId: string;
  currentUserId: string;
  members: Member[];
  places: PlaceOption[];
  destinationCity: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [placeMode, setPlaceMode] = useState<PlaceMode>("existing");
  const [searchedPlace, setSearchedPlace] = useState<PlaceSearchResult | null>(null);

  function resetPlacePicker() {
    setPlaceMode("existing");
    setSearchedPlace(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const quantity = Number(formData.get("quantity") ?? 1) || 1;
    const expectedPrice = formData.get("expected_price_cny");
    const assignedTo = String(formData.get("assigned_to") ?? "");
    const placeId = String(formData.get("place_id") ?? "");
    const newPlaceName = String(formData.get("new_place_name") ?? "").trim();
    const productName = String(formData.get("product_name") ?? "");
    const productNameZh = String(formData.get("product_name_zh") ?? "") || null;
    const referenceUrl = String(formData.get("reference_url") ?? "") || null;
    const purchaseType = formData.get("purchase_type") as PurchaseType;
    const imageFile = formData.get("image") as File | null;
    const mapPlace = searchedPlace;

    // 응답을 기다리지 않고 팝업을 바로 닫는다. 업로드/저장은 백그라운드에서 진행되고,
    // 완료되면 실시간 구독을 통해 목록에 반영된다.
    form.reset();
    resetPlacePicker();
    dialogRef.current?.close();

    void (async () => {
      const supabase = createClient();

      let resolvedPlaceId = placeId || null;
      if (mapPlace) {
        const { data: newPlace, error: placeError } = await supabase
          .from("places")
          .insert({
            trip_id: tripId,
            created_by: currentUserId,
            amap_poi_id: mapPlace.placeId,
            name_zh: mapPlace.name,
            address_zh: mapPlace.address,
            latitude: mapPlace.latitude,
            longitude: mapPlace.longitude,
            coordinate_system: mapPlace.coordinateSystem,
            category: mapPlace.category,
          })
          .select("id")
          .single();
        if (placeError) {
          showToast(`장소 저장 실패: ${placeError.message}`, "error");
          return;
        }
        resolvedPlaceId = newPlace?.id ?? null;
      } else if (newPlaceName) {
        const { data: newPlace, error: placeError } = await supabase
          .from("places")
          .insert({
            trip_id: tripId,
            created_by: currentUserId,
            name_zh: newPlaceName,
            coordinate_system: "WGS84",
          })
          .select("id")
          .single();
        if (placeError) {
          showToast(`장소 저장 실패: ${placeError.message}`, "error");
          return;
        }
        resolvedPlaceId = newPlace?.id ?? null;
      }

      const imageUrl = imageFile ? await uploadItemImage(imageFile) : null;
      const { error } = await supabase.from("shopping_items").insert({
        shopping_list_id: shoppingListId,
        created_by: currentUserId,
        product_name: productName,
        product_name_zh: productNameZh,
        quantity,
        expected_price_cny: expectedPrice ? Number(expectedPrice) : null,
        assigned_to: assignedTo || null,
        place_id: resolvedPlaceId,
        reference_url: referenceUrl,
        purchase_type: purchaseType,
        image_url: imageUrl,
      });
      if (error) {
        showToast(`추가 실패: ${error.message}`, "error");
      } else {
        showToast("추가되었습니다");
      }
    })();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full bg-primary px-4 py-2 text-body-strong text-on-primary transition-colors hover:bg-primary-hover dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        + 상품 추가
      </button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl border border-border p-6 backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <h2 className="text-section-title text-ink dark:text-zinc-50">쇼핑 항목 추가</h2>

          <input
            name="product_name"
            placeholder="상품명 (예: 훠궈 소스)"
            required
            className="rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            name="product_name_zh"
            placeholder="중국어 상품명"
            className="rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />

          <div className="flex gap-2">
            <input
              name="quantity"
              type="number"
              min={1}
              defaultValue={1}
              placeholder="수량"
              className="w-20 rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
            <input
              name="expected_price_cny"
              type="number"
              step="0.01"
              placeholder="예상 가격(¥)"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <select
            name="assigned_to"
            defaultValue=""
            className="rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">담당자 미정</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.nickname}
              </option>
            ))}
          </select>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-ink-muted">구매 장소</label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setPlaceMode("existing");
                    setSearchedPlace(null);
                  }}
                  className={placeMode === "existing" ? "font-semibold text-primary underline" : "text-ink-muted hover:text-ink hover:underline"}
                >
                  기존
                </button>
                <button
                  type="button"
                  onClick={() => setPlaceMode("search")}
                  className={placeMode === "search" ? "font-semibold text-primary underline" : "text-ink-muted hover:text-ink hover:underline"}
                >
                  지도 검색
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlaceMode("manual");
                    setSearchedPlace(null);
                  }}
                  className={placeMode === "manual" ? "font-semibold text-primary underline" : "text-ink-muted hover:text-ink hover:underline"}
                >
                  직접 입력
                </button>
              </div>
            </div>

            {placeMode === "existing" && (
              <select
                name="place_id"
                defaultValue=""
                className="rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="">구매 장소 미정</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_zh}
                  </option>
                ))}
              </select>
            )}

            {placeMode === "manual" && (
              <input
                name="new_place_name"
                placeholder="새 장소 이름 (예: 永辉超市)"
                className="rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            )}

            {placeMode === "search" &&
              (searchedPlace ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink dark:text-zinc-50">{searchedPlace.name}</p>
                    <p className="truncate text-xs text-ink-muted">{searchedPlace.address}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchedPlace(null)}
                    className="shrink-0 text-xs text-ink-muted hover:underline"
                  >
                    변경
                  </button>
                </div>
              ) : (
                <PlaceMapSearch destinationCity={destinationCity} onSelect={setSearchedPlace} />
              ))}
          </div>

          <input
            name="reference_url"
            placeholder="타오바오·샤오홍슈 링크"
            className="rounded-lg border border-border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />

          <div>
            <label className="mb-1 block text-xs text-ink-muted">상품 사진 (선택)</label>
            <input
              name="image"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-ink-muted dark:text-zinc-300"
            />
          </div>

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
              onClick={() => {
                resetPlacePicker();
                dialogRef.current?.close();
              }}
              className="rounded-lg px-4 py-2 text-sm text-ink-muted"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-body-strong text-on-primary dark:bg-white dark:text-zinc-900"
            >
              추가
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
