// persist helper — localStorage พังได้ (Safari private mode/โควตาเต็ม) ห้ามให้เกมล้ม

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // เพิกเฉย — จำไม่ได้ดีกว่าพัง
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // เพิกเฉย
  }
}
