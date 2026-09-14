"use client";

import { showToast } from "@/lib/toast";

export function CopyButton({
  value,
  label,
  successMessage,
  className = "text-caption hover:underline",
}: {
  value: string;
  label: string;
  successMessage: string;
  className?: string;
}) {
  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      showToast(successMessage);
    } catch {
      showToast("복사 실패: 클립보드 접근이 차단됐습니다", "error");
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {label}
    </button>
  );
}
