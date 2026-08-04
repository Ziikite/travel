"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog } from "@/lib/types";

const ENTITY_LABEL: Record<string, string> = {
  places: "장소",
  itinerary_places: "일정",
  shopping_items: "쇼핑 항목",
};

const ACTION_LABEL: Record<string, string> = {
  insert: "추가했습니다",
  update: "수정했습니다",
  delete: "삭제했습니다",
};

function summarize(log: ActivityLog, nickname: string): string {
  if (log.entity_type === "place_votes") {
    return `${nickname}님이 ${log.action_type === "insert" ? "투표했습니다" : "투표를 취소했습니다"}`;
  }
  const entityLabel = ENTITY_LABEL[log.entity_type] ?? log.entity_type;
  const actionLabel = ACTION_LABEL[log.action_type] ?? log.action_type;
  return `${nickname}님이 ${entityLabel}을 ${actionLabel}`;
}

export function ActivityFeed({
  tripId,
  initialLogs,
  memberNicknames,
}: {
  tripId: string;
  initialLogs: ActivityLog[];
  memberNicknames: { userId: string; nickname: string }[];
}) {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);

  const nicknameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    memberNicknames.forEach((m) => map.set(m.userId, m.nickname));
    return map;
  }, [memberNicknames]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`activity-${tripId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs", filter: `trip_id=eq.${tripId}` },
        (payload) => {
          const row = payload.new as ActivityLog;
          setLogs((prev) => [row, ...prev].slice(0, 30));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  if (logs.length === 0) {
    return <p className="text-sm text-zinc-500">아직 활동 기록이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      {logs.map((log) => (
        <li key={log.id} className="flex items-baseline justify-between gap-3">
          <span>{summarize(log, log.user_id ? nicknameByUserId.get(log.user_id) ?? "알 수 없음" : "알 수 없음")}</span>
          <span className="shrink-0 text-xs text-zinc-400">
            {new Date(log.created_at).toLocaleString("ko-KR", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </li>
      ))}
    </ul>
  );
}
