"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { CopyButton } from "@/components/CopyButton";
import { mapUrl } from "@/lib/maps";
import type { ItineraryPlace, Place, Role } from "@/lib/types";

export function ItineraryItemRow({
  item,
  place,
  order,
  role,
  onRemove,
}: {
  item: ItineraryPlace;
  place: Place | undefined;
  order: number;
  role: Role;
  onRemove: (id: string) => void;
}) {
  const canEdit = role === "owner" || role === "editor";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  async function update(patch: Partial<ItineraryPlace>) {
    const supabase = createClient();
    await supabase.from("itinerary_places").update(patch).eq("id", item.id);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 rounded-xl border border-border p-3 dark:border-zinc-800"
    >
      {canEdit && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 shrink-0 cursor-grab text-ink-muted"
          aria-label="순서 변경"
        >
          ⠿
        </button>
      )}

      <span className="mt-0.5 shrink-0 text-sm font-semibold text-ink-muted">{order}</span>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-body-strong text-ink dark:text-zinc-50">
                {place?.name_zh ?? "삭제된 장소"}
              </p>
              {place?.name_zh && (
                <CopyButton
                  value={place.name_zh}
                  label="이름 복사"
                  successMessage="장소 이름을 복사했습니다"
                  className="shrink-0 rounded-full bg-surface-sunken px-2 py-0.5 text-caption text-ink-muted transition-colors hover:bg-border hover:text-ink"
                />
              )}
            </div>
            {place?.address_zh && (
              <p className="truncate text-caption text-ink-muted">{place.address_zh}</p>
            )}
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="shrink-0 text-xs text-danger hover:underline"
            >
              제거
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <input
            type="time"
            defaultValue={item.planned_arrival ?? ""}
            disabled={!canEdit}
            onBlur={(e) => update({ planned_arrival: e.target.value || null })}
            className="rounded-lg border border-border px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
          />
          <span className="text-ink-muted">~</span>
          <input
            type="time"
            defaultValue={item.planned_departure ?? ""}
            disabled={!canEdit}
            onBlur={(e) => update({ planned_departure: e.target.value || null })}
            className="rounded-lg border border-border px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800"
          />

          <label className="flex items-center gap-1 text-ink-muted">
            <input
              type="checkbox"
              defaultChecked={item.is_time_fixed}
              disabled={!canEdit}
              onChange={(e) => update({ is_time_fixed: e.target.checked })}
            />
            시간 고정
          </label>
          <label className="flex items-center gap-1 text-ink-muted">
            <input
              type="checkbox"
              defaultChecked={item.is_meal}
              disabled={!canEdit}
              onChange={(e) => update({ is_meal: e.target.checked })}
            />
            식사
          </label>

          {place?.amap_url ? (
            <a
              href={place.amap_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-2 py-1 text-ink-muted dark:border-zinc-700 dark:text-zinc-300"
            >
              고덕지도에서 열기
            </a>
          ) : (
            place?.latitude &&
            place?.longitude && (
              <a
                href={mapUrl(
                  place.latitude,
                  place.longitude,
                  place.coordinate_system,
                  place.name_zh,
                  place.amap_poi_id
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-2 py-1 text-ink-muted dark:border-zinc-700 dark:text-zinc-300"
              >
                {place.coordinate_system === "GCJ02" ? "고덕지도에서 열기" : "구글맵에서 열기"}
              </a>
            )
          )}
          {place?.address_zh && (
            <CopyButton
              value={place.address_zh}
              label="주소 복사"
              successMessage="주소를 복사했습니다"
            />
          )}
        </div>
      </div>
    </div>
  );
}
