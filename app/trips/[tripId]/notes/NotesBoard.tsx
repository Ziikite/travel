"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTrip } from "@/lib/trip-context";
import type { InfoNote } from "@/lib/types";
import { AddNoteDialog } from "./AddNoteDialog";
import { NoteCard } from "./NoteCard";

type Member = { userId: string; nickname: string };

export function NotesBoard({
  tripId,
  currentUserId,
  initialNotes,
  memberNicknames,
}: {
  tripId: string;
  currentUserId: string;
  initialNotes: InfoNote[];
  memberNicknames: Member[];
}) {
  const { role } = useTrip();
  const [notes, setNotes] = useState<InfoNote[]>(initialNotes);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const nicknameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    memberNicknames.forEach((m) => map.set(m.userId, m.nickname));
    return map;
  }, [memberNicknames]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set);
  }, [notes]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notes-${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "info_notes", filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setNotes((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as InfoNote;
              return prev.some((n) => n.id === row.id) ? prev : [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as InfoNote;
              return prev.map((n) => (n.id === row.id ? row : n));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as InfoNote;
              return prev.filter((n) => n.id !== row.id);
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

  const visibleNotes = notes.filter(
    (n) => categoryFilter === "all" || n.category === categoryFilter
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {categories.length > 0 ? (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="all">분류 전체</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <div />
        )}

        <AddNoteDialog tripId={tripId} currentUserId={currentUserId} />
      </div>

      {visibleNotes.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">
          아직 등록된 정보가 없어요. 유용한 링크나 꿀팁을 추가해보세요.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              role={role}
              creatorNickname={nicknameByUserId.get(note.created_by) ?? "알 수 없음"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
