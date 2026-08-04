"use client";

import { useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { DetailDialog } from "@/components/DetailDialog";
import type { InfoNote, Role } from "@/lib/types";

export function NoteCard({
  note,
  role,
  creatorNickname,
}: {
  note: InfoNote;
  role: Role;
  creatorNickname: string;
}) {
  const canEdit = role === "owner" || role === "editor";
  const detailRef = useRef<HTMLDialogElement>(null);

  async function remove() {
    const supabase = createClient();
    await supabase.from("info_notes").delete().eq("id", note.id);
    detailRef.current?.close();
  }

  return (
    <>
      <div
        onClick={() => detailRef.current?.showModal()}
        className="cursor-pointer rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 dark:border-zinc-800"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{note.title}</p>
          {note.category && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {note.category}
            </span>
          )}
        </div>
        {note.content && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{note.content}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-400">
          {note.url && <span className="truncate">🔗 {note.url}</span>}
          <span>등록: {creatorNickname}</span>
        </div>
      </div>

      <DetailDialog
        ref={detailRef}
        title={note.title}
        subtitle={note.category ?? undefined}
        fields={[
          {
            label: "링크",
            value: note.url ? (
              <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {note.url}
              </a>
            ) : null,
          },
          { label: "내용", value: note.content },
          { label: "등록자", value: creatorNickname },
          {
            label: "등록일",
            value: new Date(note.created_at).toLocaleDateString("ko-KR"),
          },
        ]}
        actions={
          canEdit && (
            <button type="button" onClick={remove} className="text-sm text-red-500 hover:underline">
              삭제
            </button>
          )
        }
      />
    </>
  );
}
