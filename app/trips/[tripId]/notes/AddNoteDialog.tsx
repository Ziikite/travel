"use client";

import { useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_SUGGESTIONS = ["교통", "통신/심카드", "환전", "안전", "링크", "꿀팁", "기타"];

export function AddNoteDialog({ tripId, currentUserId }: { tripId: string; currentUserId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "");
    const url = String(formData.get("url") ?? "") || null;
    const content = String(formData.get("content") ?? "") || null;
    const category = String(formData.get("category") ?? "") || null;

    form.reset();
    dialogRef.current?.close();

    const supabase = createClient();
    void supabase.from("info_notes").insert({
      trip_id: tripId,
      created_by: currentUserId,
      title,
      url,
      content,
      category,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        + 정보 추가
      </button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl border border-zinc-200 p-6 backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">기타 정보 추가</h2>

          <input
            name="title"
            placeholder="제목 (예: 지하철 앱 추천)"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />

          <input
            name="url"
            type="url"
            placeholder="관련 링크 (선택, https://...)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />

          <input
            name="category"
            list="note-category-suggestions"
            placeholder="분류 (선택, 예: 교통/환전/꿀팁)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <datalist id="note-category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <textarea
            name="content"
            placeholder="내용 (꿀팁, 설명 등)"
            rows={4}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg px-4 py-2 text-sm text-zinc-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
            >
              추가
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
