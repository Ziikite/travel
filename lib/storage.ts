import { createClient } from "@/lib/supabase/client";

const BUCKET = "item-images";

export async function uploadItemImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) {
    console.error("이미지 업로드 실패:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
