export function qs(sel, root = document) {
  return root.querySelector(sel);
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}
