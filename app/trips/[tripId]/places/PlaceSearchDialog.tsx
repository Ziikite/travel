"use client";

import { useRef, useState } from "react";
import { searchPlaces, type PlaceSearchResult } from "@/lib/maps";
import { createClient } from "@/lib/supabase/client";

export function PlaceSearchDialog({
  tripId,
  destinationCity,
  currentUserId,
}: {
  tripId: string;
  destinationCity: string | null;
  currentUserId: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const places = await searchPlaces(keyword.trim(), destinationCity);
      setResults(places);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "검색에 실패했습니다. 구글맵 API 키가 설정되어 있는지 확인해주세요."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(place: PlaceSearchResult) {
    const supabase = createClient();
    const { error } = await supabase.from("places").insert({
      trip_id: tripId,
      created_by: currentUserId,
      // amap_poi_id 컬럼에 구글맵 place_id를 저장한다(지도 제공자에 무관한 범용 외부 POI 식별자로 취급).
      amap_poi_id: place.placeId,
      name_zh: place.name,
      address_zh: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      coordinate_system: "WGS84",
      category: place.category,
    });
    if (!error) {
      setSavedIds((prev) => new Set(prev).add(place.placeId));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        + 장소 검색해서 추가
      </button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl border border-zinc-200 p-6 backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">장소 검색</h2>
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              setResults([]);
              setKeyword("");
            }}
            className="text-sm text-zinc-500"
          >
            닫기
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 洪崖洞, 火锅"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {loading ? "검색 중..." : "검색"}
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <ul className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto">
          {results.map((place) => (
            <li
              key={place.placeId}
              className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {place.name}
                </p>
                <p className="truncate text-xs text-zinc-500">{place.address}</p>
                {place.category && (
                  <p className="mt-0.5 truncate text-xs text-zinc-400">{place.category}</p>
                )}
              </div>
              <button
                type="button"
                disabled={savedIds.has(place.placeId)}
                onClick={() => handleSave(place)}
                className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
              >
                {savedIds.has(place.placeId) ? "저장됨" : "저장"}
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
