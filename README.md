# Fantastic Beasts 🐣✨

เกมกระตุ้นยอดขายบนจอ TV — ทีมช่วยกัน "เลี้ยงสัตว์วิเศษ" ด้วยยอดขายจริง

- ไข่ → ฟัก → เด็ก → วัยรุ่น → เต็มวัย ตามแต้มโตจากยอดขาย (Supabase Realtime — เฟส 2)
- น้องมีอารมณ์ตามสถานการณ์ยอด: ดีใจสุดๆ / ร่าเริง / ปกติ / เหงา / เศร้า / หลับ — อารมณ์มีผลต่อความเร็วโต
- โตเต็มวัย = ทีมรับรางวัลจริง 🎁

## โครงสร้าง

- `app/` — React 18 + TypeScript + Vite + vitest
  - `src/domain/` — pure logic: growth engine, mood engine
  - `src/state/` — game state + store + persist
  - `src/features/tv/` — จอ TV หลัก · `src/features/dev/` — แผงเดโม POC
  - `src/ui/beast/` — สัตว์ + แอนิเมชันมีชีวิต
- `docs/superpowers/` — spec + plan
- ศิลป์: gen โดย Codex (สเปกในการ brief: โปร่งใส 1024, ห้ามตัวหนังสือ, คุม reference)

## คำสั่ง

```bash
cd app
npm run dev        # dev server
npx vitest run     # เทส
npm run build      # build (base /fantastic-beasts-game/)
```

Deploy: push `main` → GitHub Actions → GitHub Pages
