type Listener = (message: string, variant: "success" | "error") => void;

let listener: Listener | null = null;

export function setToastListener(l: Listener | null) {
  listener = l;
}

export function showToast(message: string, variant: "success" | "error" = "success") {
  listener?.(message, variant);
}
