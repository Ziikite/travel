"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTrip } from "@/lib/trip-context";
import type { Place, PlaceVote, Priority } from "@/lib/types";
import { PlaceCard } from "./PlaceCard";
import { PlaceSearchDialog } from "./PlaceSearchDialog";

type MemberNickname = { userId: string; nickname: string };
type VoteRow = Pick<PlaceVote, "place_id" | "user_id">;

export function PlaceBoard({
  tripId,
  destinationCity,
  currentUserId,
  initialPlaces,
  initialVotes,
  memberNicknames,
}: {
  tripId: string;
  destinationCity: string | null;
  currentUserId: string;
  initialPlaces: Place[];
  initialVotes: VoteRow[];
  memberNicknames: MemberNickname[];
}) {
  const { role } = useTrip();
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [votes, setVotes] = useState<VoteRow[]>(initialVotes);
  const [showDeleted, setShowDeleted] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("recent");
  const [onlyVoted, setOnlyVoted] = useState(false);

  const placesRef = useRef(places);
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  const nicknameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    memberNicknames.forEach((m) => map.set(m.userId, m.nickname));
    return map;
  }, [memberNicknames]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`places-board-${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "places", filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setPlaces((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Place;
              if (prev.some((p) => p.id === row.id)) return prev;
              return [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Place;
              return prev.map((p) => (p.id === row.id ? row : p));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as Place;
              return prev.filter((p) => p.id !== row.id);
            }
            return prev;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "place_votes" },
        (payload) => {
          const row = (payload.new ?? payload.old) as VoteRow;
          if (!placesRef.current.some((p) => p.id === row.place_id)) return;

          setVotes((prev) => {
            if (payload.eventType === "INSERT") {
              if (prev.some((v) => v.place_id === row.place_id && v.user_id === row.user_id)) {
                return prev;
              }
              return [...prev, row];
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((v) => !(v.place_id === row.place_id && v.user_id === row.user_id));
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => {
      if (p.category) set.add(p.category.split(";")[0]);
    });
    return Array.from(set);
  }, [places]);

  const voteCountByPlace = useMemo(() => {
    const map = new Map<string, number>();
    votes.forEach((v) => map.set(v.place_id, (map.get(v.place_id) ?? 0) + 1));
    return map;
  }, [votes]);

  const votedPlaceIds = useMemo(
    () => new Set(votes.filter((v) => v.user_id === currentUserId).map((v) => v.place_id)),
    [votes, currentUserId]
  );

  const visiblePlaces = useMemo(() => {
    let list = places.filter((p) => (showDeleted ? p.status === "deleted" : p.status === "active"));
    if (priorityFilter !== "all") list = list.filter((p) => p.priority === priorityFilter);
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category?.split(";")[0] === categoryFilter);
    }
    if (onlyVoted) list = list.filter((p) => votedPlaceIds.has(p.id));

    list = [...list].sort((a, b) => {
      if (sortBy === "votes") {
        return (voteCountByPlace.get(b.id) ?? 0) - (voteCountByPlace.get(a.id) ?? 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [places, showDeleted, priorityFilter, categoryFilter, onlyVoted, votedPlaceIds, sortBy, voteCountByPlace]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as "all" | Priority)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="all">우선순위 전체</option>
            <option value="must">꼭 가기</option>
            <option value="want">가고 싶음</option>
            <option value="maybe">선택</option>
          </select>
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="all">카테고리 전체</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "votes" | "recent")}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="recent">최신순</option>
            <option value="votes">투표순</option>
          </select>
          <label className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700">
            <input type="checkbox" checked={onlyVoted} onChange={(e) => setOnlyVoted(e.target.checked)} />
            내가 투표한 곳만
          </label>
          <label className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-2 py-1.5 dark:border-zinc-700">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            삭제된 장소 보기
          </label>
        </div>

        <PlaceSearchDialog
          tripId={tripId}
          destinationCity={destinationCity}
          currentUserId={currentUserId}
        />
      </div>

      {visiblePlaces.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          {showDeleted ? "삭제된 장소가 없어요." : "아직 저장된 장소가 없어요. 검색해서 추가해보세요."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visiblePlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              voteCount={voteCountByPlace.get(place.id) ?? 0}
              hasVoted={votedPlaceIds.has(place.id)}
              currentUserId={currentUserId}
              role={role}
              creatorNickname={nicknameByUserId.get(place.created_by) ?? "알 수 없음"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
