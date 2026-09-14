"use client";

export function RoleSelect({
  tripId,
  userId,
  role,
  action,
}: {
  tripId: string;
  userId: string;
  role: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="trip_id" value={tripId} />
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-border bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
      >
        <option value="editor">편집자</option>
        <option value="viewer">조회자</option>
      </select>
    </form>
  );
}
