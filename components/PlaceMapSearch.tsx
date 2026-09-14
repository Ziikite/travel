"use client";

import { useState } from "react";
import { searchPlaces, type PlaceSearchResult } from "@/lib/maps";

export function PlaceMapSearch({
  destinationCity,
  onSelect,
}: {
  destinationCity?: string | null;
  onSelect: (place: PlaceSearchResult) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchPlaces(keyword.trim(), destinationCity));
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="가게 이름으로 검색 (예: 火锅)"
          className="flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
          {results.map((place) => (
            <li key={place.placeId}>
              <button
                type="button"
                onClick={() => onSelect(place)}
                className="w-full rounded-lg border border-zinc-200 p-2 text-left text-xs hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
              >
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{place.name}</p>
                <p className="text-zinc-500">{place.address}</p>
                {place.category && <p className="text-zinc-400">{place.category}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
