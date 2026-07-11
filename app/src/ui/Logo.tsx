// Logo — ภาพโลโก้เกมเต็ม (gen โดย Codex: ตัวหนังสือ bubbly + ไข่ยูนิคอร์น + เมฆ)
// สไตล์เดียวกับโลโก้เกมที่1 (text อยู่ในภาพ)

import "./logo.css";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      className={`fb-logo${compact ? " fb-logo--compact" : ""}`}
      src={`${import.meta.env.BASE_URL}assets/logo-full.webp`}
      alt="Fantastic Beasts"
      draggable={false}
    />
  );
}
