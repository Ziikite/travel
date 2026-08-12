import { createClient } from "@/lib/supabase/client";

const BUCKET = "item-images";
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;

/**
 * 휴대폰 카메라 원본(수 MB)을 그대로 올리면 목록의 56px 썸네일 하나 보려고
 * 매번 원본 전체를 내려받게 되어 페이지가 느려진다. 업로드 전에 브라우저에서
 * 리사이즈/재인코딩해 용량을 줄인다. 실패 시(비이미지 등) 원본을 그대로 올린다.
 */
async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadItemImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const supabase = createClient();
  const body = await compressImage(file).catch(() => file);
  const ext = body === file ? file.name.split(".").pop() ?? "jpg" : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body);
  if (error) {
    console.error("이미지 업로드 실패:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
