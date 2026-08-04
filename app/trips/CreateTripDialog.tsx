"use client";

import { useRef } from "react";
import { createTrip } from "./actions";

export function CreateTripDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        + 새 여행방
      </button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 p-6 backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <form action={createTrip} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            새 여행방 만들기
          </h2>
          <input
            name="title"
            placeholder="예: 충칭 4박 5일"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            name="destination_city"
            placeholder="목적지 도시 (예: 충칭)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <div className="flex gap-2">
            <input
              type="date"
              name="start_date"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
            <input
              type="date"
              name="end_date"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
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
              만들기
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
