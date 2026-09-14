"use client";

import { useState } from "react";

export function InviteShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-ink-muted dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 rounded-lg bg-primary px-3 py-2 text-body-strong text-on-primary dark:bg-white dark:text-zinc-900"
      >
        {copied ? "복사됨!" : "링크 복사"}
      </button>
    </div>
  );
}
