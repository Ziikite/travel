"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import { useTrip } from "@/lib/trip-context";
import type { Itinerary, ItineraryPlace, Place } from "@/lib/types";
import { ItineraryItemRow } from "./ItineraryItemRow";
import { TripMap, type MapPoint } from "./TripMap";

type RawItineraryPlace = ItineraryPlace & { places: Place | Place[] | null };

function stripEmbed(row: RawItineraryPlace): ItineraryPlace {
  const { places, ...rest } = row;
  void places;
  return rest;
}

function buildDateRange(start: string | null, end: string | null): string[] {
  if (!start || !end) return [];
  const dates: string[] = [];
  const cur = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function ItineraryBoard({
  tripId,
  tripStartDate,
  tripEndDate,
  initialItineraries,
  initialItineraryPlaces,
  allPlaces,
}: {
  tripId: string;
  tripStartDate: string | null;
  tripEndDate: string | null;
  initialItineraries: Itinerary[];
  initialItineraryPlaces: RawItineraryPlace[];
  allPlaces: Place[];
}) {
  const { role } = useTrip();
  const canEdit = role === "owner" || role === "editor";

  const [itineraries, setItineraries] = useState<Itinerary[]>(initialItineraries);
  const [itineraryPlaces, setItineraryPlaces] = useState<ItineraryPlace[]>(
    initialItineraryPlaces.map(stripEmbed)
  );
  const [extraDates, setExtraDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addingPlaceId, setAddingPlaceId] = useState("");

  const itinerariesRef = useRef(itineraries);
  useEffect(() => {
    itinerariesRef.current = itineraries;
  }, [itineraries]);

  const placesById = useMemo(() => {
    const map = new Map<string, Place>();
    allPlaces.forEach((p) => map.set(p.id, p));
    return map;
  }, [allPlaces]);

  const allDates = useMemo(() => {
    const set = new Set<string>([
      ...buildDateRange(tripStartDate, tripEndDate),
      ...itineraries.map((i) => i.itinerary_date),
      ...extraDates,
    ]);
    return Array.from(set).sort();
  }, [tripStartDate, tripEndDate, itineraries, extraDates]);

  const effectiveSelectedDate = selectedDate ?? allDates[0] ?? null;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`itinerary-${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "itineraries", filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setItineraries((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Itinerary;
              return prev.some((i) => i.id === row.id) ? prev : [...prev, row];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Itinerary;
              return prev.map((i) => (i.id === row.id ? row : i));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as Itinerary;
              return prev.filter((i) => i.id !== row.id);
            }
            return prev;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "itinerary_places" },
        (payload) => {
          const row = (payload.new ?? payload.old) as ItineraryPlace;
          if (!itinerariesRef.current.some((i) => i.id === row.itinerary_id)) return;

          setItineraryPlaces((prev) => {
            if (payload.eventType === "INSERT") {
              return prev.some((p) => p.id === row.id) ? prev : [...prev, row];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((p) => (p.id === row.id ? row : p));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.id !== row.id);
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

  const currentItinerary = itineraries.find((i) => i.itinerary_date === effectiveSelectedDate);
  const dayItems = useMemo(
    () =>
      itineraryPlaces
        .filter((ip) => ip.itinerary_id === currentItinerary?.id)
        .sort((a, b) => a.visit_order - b.visit_order),
    [itineraryPlaces, currentItinerary]
  );

  const mapPoints: MapPoint[] = useMemo(
    () =>
      dayItems.map((item) => {
        const place = placesById.get(item.place_id);
        return {
          id: item.id,
          name: place?.name_zh ?? "",
          longitude: place?.longitude ?? null,
          latitude: place?.latitude ?? null,
        };
      }),
    [dayItems, placesById]
  );

  const availablePlaces = allPlaces.filter(
    (p) => !dayItems.some((item) => item.place_id === p.id)
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleAddPlace() {
    if (!addingPlaceId || !effectiveSelectedDate) return;
    const supabase = createClient();

    let itinerary = currentItinerary;
    if (!itinerary) {
      const { data, error } = await supabase
        .from("itineraries")
        .upsert(
          { trip_id: tripId, itinerary_date: effectiveSelectedDate },
          { onConflict: "trip_id,itinerary_date" }
        )
        .select()
        .single();
      if (error || !data) return;
      itinerary = data;
      setItineraries((prev) => (prev.some((i) => i.id === data.id) ? prev : [...prev, data]));
    }

    const currentDayItems = itineraryPlaces.filter((ip) => ip.itinerary_id === itinerary!.id);
    const nextOrder = currentDayItems.length
      ? Math.max(...currentDayItems.map((i) => i.visit_order)) + 1
      : 0;

    const { data: inserted } = await supabase
      .from("itinerary_places")
      .insert({ itinerary_id: itinerary.id, place_id: addingPlaceId, visit_order: nextOrder })
      .select()
      .single();

    if (inserted) {
      setItineraryPlaces((prev) => (prev.some((p) => p.id === inserted.id) ? prev : [...prev, inserted]));
    }
    setAddingPlaceId("");
  }

  async function handleRemove(itineraryPlaceId: string) {
    const supabase = createClient();
    setItineraryPlaces((prev) => prev.filter((p) => p.id !== itineraryPlaceId));
    await supabase.from("itinerary_places").delete().eq("id", itineraryPlaceId);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dayItems.findIndex((i) => i.id === active.id);
    const newIndex = dayItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(dayItems, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      visit_order: idx,
    }));

    setItineraryPlaces((prev) =>
      prev.map((p) => reordered.find((r) => r.id === p.id) ?? p)
    );

    const supabase = createClient();
    await Promise.all(
      reordered.map((item) =>
        supabase.from("itinerary_places").update({ visit_order: item.visit_order }).eq("id", item.id)
      )
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {allDates.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => setSelectedDate(date)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              date === effectiveSelectedDate
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {date}
          </button>
        ))}
        {canEdit && (
          <input
            type="date"
            onChange={(e) => {
              if (!e.target.value) return;
              setExtraDates((prev) => Array.from(new Set([...prev, e.target.value])));
              setSelectedDate(e.target.value);
              e.target.value = "";
            }}
            className="rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 dark:border-zinc-700"
          />
        )}
      </div>

      {!effectiveSelectedDate ? (
        <p className="py-10 text-center text-sm text-zinc-500">날짜를 추가해서 일정을 시작해보세요.</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            {canEdit && (
              <div className="flex gap-2">
                <select
                  value={addingPlaceId}
                  onChange={(e) => setAddingPlaceId(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <option value="">이 날짜에 추가할 장소 선택...</option>
                  {availablePlaces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_zh}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddPlace}
                  disabled={!addingPlaceId}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
                >
                  추가
                </button>
              </div>
            )}

            {dayItems.length === 0 ? (
              <p className="py-10 text-center text-sm text-zinc-500">
                이 날짜에 배치된 장소가 없어요.
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={dayItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {dayItems.map((item, idx) => (
                      <ItineraryItemRow
                        key={item.id}
                        item={item}
                        place={placesById.get(item.place_id)}
                        order={idx + 1}
                        role={role}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <TripMap points={mapPoints} />
        </div>
      )}
    </div>
  );
}
