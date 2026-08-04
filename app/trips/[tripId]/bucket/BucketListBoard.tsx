"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTrip } from "@/lib/trip-context";
import type { BucketListItem, BucketListStatus, Place } from "@/lib/types";
import { AddBucketListItemDialog } from "./AddBucketListItemDialog";
import { BucketListItemRow } from "./BucketListItemRow";

type Member = { userId: string; nickname: string };
type PlaceOption = { id: string; name_zh: string };

export function BucketListBoard({
  tripId,
  bucketListId,
  currentUserId,
  initialItems,
  memberNicknames,
  places: initialPlaces,
}: {
  tripId: string;
  bucketListId: string | null;
  currentUserId: string;
  initialItems: BucketListItem[];
  memberNicknames: Member[];
  places: PlaceOption[];
}) {
  const { role } = useTrip();
  const [items, setItems] = useState<BucketListItem[]>(initialItems);
  const [places, setPlaces] = useState<PlaceOption[]>(initialPlaces);
  const [statusFilter, setStatusFilter] = useState<"all" | BucketListStatus>("all");

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
    if (!bucketListId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`bucket-list-${bucketListId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bucket_list_items" },
        (payload) => {
          const row = (payload.new ?? payload.old) as BucketListItem;
          if (row.bucket_list_id !== bucketListId) return;

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
  }, [bucketListId]);

  // 장소 탭에서 새로 저장한 장소가 바로 반영되게 동기화한다.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`bucket-places-${tripId}`)
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

  const visibleItems = items
    .filter((item) => statusFilter === "all" || item.status === statusFilter)
    .sort((a, b) => {
      if (!a.scheduled_at && !b.scheduled_at) return 0;
      if (!a.scheduled_at) return 1;
      if (!b.scheduled_at) return -1;
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });

  if (!bucketListId) {
    return <p className="py-10 text-center text-sm text-zinc-500">버킷리스트를 불러올 수 없어요.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | BucketListStatus)}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
        >
          <option value="all">상태 전체</option>
          <option value="pending">예약 전</option>
          <option value="booked">예약완료</option>
          <option value="done">완료</option>
          <option value="cancelled">취소</option>
        </select>

        <AddBucketListItemDialog
          bucketListId={bucketListId}
          currentUserId={currentUserId}
          members={memberNicknames}
          places={places}
        />
      </div>

      {visibleItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">아직 버킷리스트 항목이 없어요.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleItems.map((item) => (
            <BucketListItemRow
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
