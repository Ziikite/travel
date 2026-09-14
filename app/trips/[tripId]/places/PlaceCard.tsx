"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CopyButton } from "@/components/CopyButton";
import { DetailDialog } from "@/components/DetailDialog";
import { PlaceMapSearch } from "@/components/PlaceMapSearch";
import { mapUrl } from "@/lib/maps";
import type { PlaceSearchResult } from "@/lib/maps";
import type { Place, Priority, Role } from "@/lib/types";

const PRIORITY_LABEL: Record<Priority, string> = {
  must: "꼭 가기",
  want: "가고 싶음",
  maybe: "선택",
};

const PRIORITY_STYLE: Record<Priority, string> = {
  must: "bg-danger/10 text-danger dark:bg-red-950 dark:text-red-300",
  want: "bg-surface-sunken text-ink dark:bg-blue-950 dark:text-blue-300",
  maybe: "bg-surface-sunken text-ink-muted dark:bg-zinc-800 dark:text-zinc-400",
};

export function PlaceCard({
  place,
  voteCount,
  hasVoted,
  currentUserId,
  role,
  creatorNickname,
}: {
  place: Place;
  voteCount: number;
  hasVoted: boolean;
  currentUserId: string;
  role: Role;
  creatorNickname: string;
}) {
  const [editing, setEditing] = useState(false);
  const canEdit = role === "owner" || role === "editor";
  const isDeleted = place.status === "deleted";
  const detailRef = useRef<HTMLDialogElement>(null);

  async function toggleVote() {
    const supabase = createClient();
    if (hasVoted) {
      await supabase
        .from("place_votes")
        .delete()
        .eq("place_id", place.id)
        .eq("user_id", currentUserId);
    } else {
      await supabase.from("place_votes").insert({ place_id: place.id, user_id: currentUserId });
    }
  }

  async function setStatus(status: "active" | "deleted") {
    const supabase = createClient();
    await supabase.from("places").update({ status }).eq("id", place.id);
    detailRef.current?.close();
  }

  return (
    <>
      <div
        onClick={() => detailRef.current?.showModal()}
        className="cursor-pointer rounded-xl border border-border p-4 hover:border-border dark:border-zinc-800"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-body-strong text-ink dark:text-zinc-50">{place.name_zh}</p>
              {place.name_ko && <p className="text-sm text-ink-muted">({place.name_ko})</p>}
              <CopyButton
                value={place.name_zh}
                label="이름 복사"
                successMessage="장소 이름을 복사했습니다"
                className="text-caption text-ink-muted hover:text-ink hover:underline"
              />
            </div>
            {place.address_zh && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-body-role text-ink-muted">{place.address_zh}</p>
                <CopyButton
                  value={place.address_zh}
                  label="주소 복사"
                  successMessage="주소를 복사했습니다"
                  className="text-caption text-ink-muted hover:text-ink hover:underline"
                />
              </div>
            )}
          </div>

          {!isDeleted && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleVote();
              }}
              className={`flex shrink-0 flex-col items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                hasVoted
                  ? "border-success bg-success/10 text-success dark:bg-orange-950"
                  : "border-border text-ink-muted dark:border-zinc-700"
              }`}
            >
              <span>👍 {voteCount}</span>
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_STYLE[place.priority]}`}>
            {PRIORITY_LABEL[place.priority]}
          </span>
          {place.category && (
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-ink-muted dark:bg-zinc-800 dark:text-zinc-400">
              {place.category.split(";")[0]}
            </span>
          )}
          {place.stay_minutes && (
            <span className="text-ink-muted">체류 {place.stay_minutes}분</span>
          )}
          {place.opening_hours && <span className="text-ink-muted">{place.opening_hours}</span>}
        </div>

        {place.memo && (
          <p className="mt-2 text-body-role text-ink-muted dark:text-zinc-400">💬 {place.memo}</p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
          <span>{creatorNickname}님이 등록</span>

          {canEdit && !isDeleted && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditing((v) => !v);
              }}
              className="hover:underline"
            >
              {editing ? "닫기" : "수정"}
            </button>
          )}
        </div>

        {editing && (
          <div onClick={(e) => e.stopPropagation()}>
            <PlaceEditForm place={place} onDone={() => setEditing(false)} />
          </div>
        )}
      </div>

      <DetailDialog
        ref={detailRef}
        title={place.name_zh}
        subtitle={place.name_ko ?? undefined}
        fields={[
          {
            label: "주소",
            value: place.address_zh ? (
              <span className="flex flex-wrap items-center gap-2">
                {place.address_zh}
                <CopyButton
                  value={place.address_zh}
                  label="복사"
                  successMessage="주소를 복사했습니다"
                  className="text-caption text-ink-muted hover:text-ink hover:underline"
                />
              </span>
            ) : null,
          },
          { label: "우선순위", value: PRIORITY_LABEL[place.priority] },
          { label: "카테고리", value: place.category },
          { label: "체류 시간", value: place.stay_minutes ? `${place.stay_minutes}분` : null },
          { label: "영업시간", value: place.opening_hours },
          { label: "메모", value: place.memo },
          { label: "투표", value: `${voteCount}명` },
          { label: "등록자", value: creatorNickname },
          {
            label: "지도",
            value:
              place.latitude && place.longitude ? (
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
                  className="text-ink underline"
                >
                  {place.coordinate_system === "GCJ02" ? "고덕지도에서 열기" : "구글맵에서 열기"}
                </a>
              ) : null,
          },
        ]}
        actions={
          canEdit &&
          (isDeleted ? (
            <button
              type="button"
              onClick={() => setStatus("active")}
              className="text-sm text-success hover:underline"
            >
              복구
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStatus("deleted")}
              className="text-sm text-danger hover:underline"
            >
              삭제
            </button>
          ))
        }
      />
    </>
  );
}

function PlaceEditForm({ place, onDone }: { place: Place; onDone: () => void }) {
  const [nameZh, setNameZh] = useState(place.name_zh);
  const [nameKo, setNameKo] = useState(place.name_ko ?? "");
  const [addressZh, setAddressZh] = useState(place.address_zh ?? "");
  const [latitude, setLatitude] = useState(place.latitude);
  const [longitude, setLongitude] = useState(place.longitude);
  const [amapPoiId, setAmapPoiId] = useState(place.amap_poi_id);
  const [coordinateSystem, setCoordinateSystem] = useState(place.coordinate_system);
  const [priority, setPriority] = useState<Priority>(place.priority);
  const [category, setCategory] = useState(place.category ?? "");
  const [stayMinutes, setStayMinutes] = useState(place.stay_minutes?.toString() ?? "");
  const [openingHours, setOpeningHours] = useState(place.opening_hours ?? "");
  const [memo, setMemo] = useState(place.memo ?? "");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  function applySearchResult(result: PlaceSearchResult) {
    setNameZh(result.name);
    setAddressZh(result.address);
    setLatitude(result.latitude);
    setLongitude(result.longitude);
    setAmapPoiId(result.placeId);
    setCoordinateSystem(result.coordinateSystem);
    if (result.category) setCategory(result.category);
    setSearching(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("places")
      .update({
        name_zh: nameZh,
        name_ko: nameKo || null,
        address_zh: addressZh || null,
        latitude,
        longitude,
        amap_poi_id: amapPoiId,
        coordinate_system: coordinateSystem,
        priority,
        category: category || null,
        stay_minutes: stayMinutes ? Number(stayMinutes) : null,
        opening_hours: openingHours || null,
        memo: memo || null,
      })
      .eq("id", place.id);
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 border-t border-border pt-3 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">
          {addressZh || "주소 정보 없음"}
          {latitude == null && " (지도 위치 없음)"}
        </span>
        <button
          type="button"
          onClick={() => setSearching((v) => !v)}
          className="shrink-0 text-xs hover:underline"
        >
          {searching ? "검색 닫기" : "지도에서 다시 검색"}
        </button>
      </div>
      {searching && <PlaceMapSearch onSelect={applySearchResult} />}
      <input
        value={nameZh}
        onChange={(e) => setNameZh(e.target.value)}
        placeholder="중국어 이름"
        required
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <input
        value={addressZh}
        onChange={(e) => setAddressZh(e.target.value)}
        placeholder="주소"
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <input
        value={nameKo}
        onChange={(e) => setNameKo(e.target.value)}
        placeholder="한국어 이름"
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <div className="flex gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        >
          <option value="must">꼭 가기</option>
          <option value="want">가고 싶음</option>
          <option value="maybe">선택</option>
        </select>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="카테고리"
          className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <input
          value={stayMinutes}
          onChange={(e) => setStayMinutes(e.target.value)}
          type="number"
          placeholder="체류(분)"
          className="w-24 rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>
      <input
        value={openingHours}
        onChange={(e) => setOpeningHours(e.target.value)}
        placeholder="영업시간"
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모 (추천 이유 등)"
        rows={3}
        className="rounded-lg border border-border px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <button
        type="submit"
        disabled={saving}
        className="self-end rounded-lg bg-primary px-3 py-1.5 text-body-strong text-on-primary disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        저장
      </button>
    </form>
  );
}
