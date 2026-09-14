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
          className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-body-strong text-on-primary disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-danger/10 px-2 py-1.5 text-xs text-danger dark:bg-red-950 dark:text-red-300">
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
                className="w-full rounded-lg border border-border p-2 text-left text-xs hover:border-border dark:border-zinc-700 dark:hover:border-zinc-500"
              >
                <p className="font-medium text-ink dark:text-zinc-50">{place.name}</p>
                <p className="text-ink-muted">{place.address}</p>
                {place.category && <p className="text-ink-muted">{place.category}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
