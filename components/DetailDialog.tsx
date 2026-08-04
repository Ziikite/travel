"use client";

import { forwardRef } from "react";

export interface DetailField {
  label: string;
  value: React.ReactNode;
}

export const DetailDialog = forwardRef<
  HTMLDialogElement,
  { title: string; subtitle?: string; fields: DetailField[]; actions?: React.ReactNode }
>(function DetailDialog({ title, subtitle, fields, actions }, ref) {
  const visibleFields = fields.filter(
    (f) => f.value !== null && f.value !== undefined && f.value !== ""
  );

  return (
    <dialog
      ref={ref}
      className="w-full max-w-md rounded-2xl border border-zinc-200 p-6 backdrop:bg-black/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={(e) => (e.currentTarget.closest("dialog") as HTMLDialogElement | null)?.close()}
          className="shrink-0 text-sm text-zinc-500"
        >
          닫기
        </button>
      </div>

      <dl className="mt-4 flex flex-col gap-3 text-sm">
        {visibleFields.map((f) => (
          <div key={f.label}>
            <dt className="text-xs font-medium text-zinc-400">{f.label}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-words text-zinc-800">{f.value}</dd>
          </div>
        ))}
      </dl>

      {actions && (
        <div className="mt-5 flex justify-end gap-3 border-t border-zinc-100 pt-4">{actions}</div>
      )}
    </dialog>
  );
});
