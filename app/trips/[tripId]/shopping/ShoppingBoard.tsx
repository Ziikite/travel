"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTrip } from "@/lib/trip-context";
import type { Place, PurchaseType, ShoppingItem, ShoppingStatus } from "@/lib/types";
import { AddShoppingItemDialog } from "./AddShoppingItemDialog";
import { ShoppingItemRow } from "./ShoppingItemRow";

type Member = { userId: string; nickname: string };
type PlaceOption = { id: string; name_zh: string };

export function ShoppingBoard({
  tripId,
  shoppingListId,
  currentUserId,
  initialItems,
  memberNicknames,
  places: initialPlaces,
}: {
  tripId: string;
  shoppingListId: string | null;
  currentUserId: string;
  initialItems: ShoppingItem[];
  memberNicknames: Member[];
  places: PlaceOption[];
}) {
  const { role } = useTrip();
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [places, setPlaces] = useState<PlaceOption[]>(initialPlaces);
  const [statusFilter, setStatusFilter] = useState<"all" | ShoppingStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | PurchaseType>("all");

  const nicknameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    memberNicknames.forEach((m) => map.set(m.userId, m.nickname));
    return map;
  }, [memberNicknames]);

  const placeNameById = useMemo(() => {
    const map = new Map<string, string>();
    places.forEach((p) => map.set(p.id, p.name_zh));
    return map;
  }, [places]);

  useEffect(() => {
    if (!shoppingListId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`shopping-${shoppingListId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items" },
        (payload) => {
          const row = (payload.new ?? payload.old) as ShoppingItem;
          if (row.shopping_list_id !== shoppingListId) return;

          setItems((prev) => {
            if (payload.eventType === "INSERT") {
              return prev.some((i) => i.id === row.id) ? prev : [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((i) => (i.id === row.id ? row : i));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((i) => i.id !== row.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shoppingListId]);

  // 장소 탭에서 새로 저장하거나 이 화면의 "새 장소 추가"로 만든 장소가 바로 반영되게 동기화한다.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`shopping-places-${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "places", filter: `trip_id=eq.${tripId}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as Place;

          setPlaces((prev) => {
            if (payload.eventType === "DELETE" || row.status !== "active") {
              return prev.filter((p) => p.id !== row.id);
            }
            const option: PlaceOption = { id: row.id, name_zh: row.name_zh };
            const exists = prev.some((p) => p.id === row.id);
            return exists ? prev.map((p) => (p.id === row.id ? option : p)) : [...prev, option];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  const visibleItems = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (typeFilter !== "all" && item.purchase_type !== typeFilter) return false;
    return true;
  });

  if (!shoppingListId) {
    return <p className="py-10 text-center text-sm text-zinc-500">쇼핑리스트를 불러올 수 없어요.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | ShoppingStatus)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="all">상태 전체</option>
            <option value="pending">미구매</option>
            <option value="purchased">구매완료</option>
            <option value="out_of_stock">품절</option>
            <option value="cancelled">보류</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | PurchaseType)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="all">구매유형 전체</option>
            <option value="group">공동구매</option>
            <option value="personal">개인구매</option>
          </select>
        </div>

        <AddShoppingItemDialog
          tripId={tripId}
          shoppingListId={shoppingListId}
          currentUserId={currentUserId}
          members={memberNicknames}
          places={places}
        />
      </div>

      {visibleItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">아직 쇼핑 항목이 없어요.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleItems.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              role={role}
              creatorNickname={nicknameByUserId.get(item.created_by) ?? "알 수 없음"}
              assigneeNickname={item.assigned_to ? nicknameByUserId.get(item.assigned_to) ?? null : null}
              placeName={item.place_id ? placeNameById.get(item.place_id) ?? null : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
