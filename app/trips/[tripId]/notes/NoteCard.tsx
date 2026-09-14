"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DetailDialog } from "@/components/DetailDialog";
import type { InfoNote, Role } from "@/lib/types";

const CATEGORY_SUGGESTIONS = ["교통", "통신/심카드", "환전", "안전", "링크", "꿀팁", "기타"];

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
  const [editing, setEditing] = useState(false);
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
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex flex-wrap gap-3">
            {note.url && <span className="truncate">🔗 {note.url}</span>}
            <span>등록: {creatorNickname}</span>
          </div>
          {canEdit && (
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
            <NoteEditForm note={note} onDone={() => setEditing(false)} />
          </div>
        )}
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

function NoteEditForm({ note, onDone }: { note: InfoNote; onDone: () => void }) {
  const [title, setTitle] = useState(note.title);
  const [url, setUrl] = useState(note.url ?? "");
  const [category, setCategory] = useState(note.category ?? "");
  const [content, setContent] = useState(note.content ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("info_notes")
      .update({
        title,
        url: url || null,
        category: category || null,
        content: content || null,
      })
      .eq("id", note.id);
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        required
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        type="url"
        placeholder="관련 링크"
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        list="note-edit-category-suggestions"
        placeholder="분류"
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <datalist id="note-edit-category-suggestions">
        {CATEGORY_SUGGESTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용"
        rows={3}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <button
        type="submit"
        disabled={saving}
        className="self-end rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        저장
      </button>
    </form>
  );
}
