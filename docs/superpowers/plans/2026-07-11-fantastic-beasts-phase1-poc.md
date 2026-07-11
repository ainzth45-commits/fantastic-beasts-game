# Fantastic Beasts — Phase 1 (POC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** POC พิสูจน์ว่า "สัตว์วิเศษมีชีวิตบนจอ TV" ทำได้จริงและตรงใจ — สัตว์ตัวง่าย 1 ตัว, mood engine, หลอดโต, mock ยอด, logo + UI จริง (ยังไม่ต่อ Supabase)

**Architecture:** React 18 + TS + Vite + vitest (แพทเทิร์นเกมที่1) · domain = pure functions · sprite จาก Codex + CSS/JS motion ซ้อน

**Tech Stack:** React 18, TypeScript, Vite, vitest, Codex (ศิลป์), ImageMagick (แปลงภาพ)

**Spec:** `docs/superpowers/specs/2026-07-11-fantastic-beasts-design.md`

---

### Task 1: Scaffold app
**Files:** Create `app/` (vite react-ts template), `app/vitest.config.ts`, `.gitignore`
- [ ] `npm create vite@latest app -- --template react-ts` + ติดตั้ง vitest jsdom
- [ ] ล้าง boilerplate, ตั้ง base config แบบเกมที่1 (dev `/`, build `/fantastic-beasts-game/`)
- [ ] รัน `npx vitest run` + `npx tsc --noEmit` ผ่าน → commit

### Task 2: Domain — growth engine (TDD)
**Files:** `app/src/domain/types.ts`, `app/src/domain/growth.ts`, `app/src/domain/growth.test.ts`
- [ ] types: `BeastTier` (easy/medium/hard), `Stage` (egg/hatching/child/teen/adult), `Mood` (thrilled/happy/calm/lonely/sad/sleep), `GrowthConfig`
- [ ] เทสก่อน: `stageFor(points, goal)` ขอบ 0/10/30/60/100%, `pointsFor(amount, mood, carryOver)` ตัวคูณถูกต้อง
- [ ] implement ให้ผ่าน → commit

### Task 3: Domain — mood engine (TDD)
**Files:** `app/src/domain/mood.ts`, `app/src/domain/mood.test.ts`
- [ ] `moodFor(events: SaleEvent[], now: Date, config): Mood` — pure, เทสทุกเงื่อนไข: thrilled (≥5k ค้าง 15 นาที), happy (≥3 ใน 60 นาที), lonely (>2 ชม.เวลางาน), sad (หลัง 14:00 + ยอดวัน <50% เฉลี่ย), sleep (นอกเวลางาน/วันหยุด), ลำดับ sleep>thrilled>happy>sad>lonely>calm
- [ ] commit

### Task 4: State store + mock feed
**Files:** `app/src/state/gameStore.ts`, `app/src/state/config.ts`
- [ ] store: แต้มสะสม, event log, tier ปัจจุบัน — persist localStorage (try/catch)
- [ ] `feedSale(amount, employeeName?)` action + mock presets (ยอดเล็ก 500-3k / ใหญ่ 5k+)
- [ ] commit

### Task 5: ศิลป์จาก Codex — สัตว์ตัวง่าย
**Files:** `app/public/assets/beast-easy/*.webp`, brief ที่ `docs/art-briefs/`
- [ ] Codex เสนอ concept สัตว์วิเศษน่ารัก 3 แบบ → Friday เลือกที่เข้าธีมสุด (เจ้านายไม่อยู่ = ตัดสินใจเอง + จดไว้)
- [ ] gen ทีละภาพพร้อม reference: ไข่(ปกติ/ดีใจ), ฟัก, เด็ก(ปกติ/ตาหลับ/ดีใจ/เศร้า/หลับ) — โปร่งใส 1024×1024
- [ ] ตรวจตาจริงทุกภาพ (หน้าตาตัวเดิม? ไม่มีตัวหนังสือเพี้ยน?) → แปลง webp → commit

### Task 6: Beast component + แอนิเมชันมีชีวิต
**Files:** `app/src/ui/beast/Beast.tsx`, `app/src/ui/beast/beast.css`
- [ ] `<Beast stage mood/>` เลือก sprite + motion: หายใจ (scale keyframes), กะพริบ (สลับ sprite ตาหลับ สุ่มจังหวะ), เด้งรับยอด (spring), เศร้า (ห่อตัว+โทนหม่น), เหงา (โยกช้า+💭), หลับ (zzz ลอย), thrilled (กระโดด+particle)
- [ ] commit

### Task 7: จอ TV + logo + dev panel
**Files:** `app/src/features/tv/TvScreen.tsx`, `app/src/features/dev/DevPanel.tsx`, logo assets, `app/src/styles/global.css`
- [ ] เลย์เอาต์ตาม spec: logo มุมบน, อารมณ์มุมขวา, สัตว์กลาง, หลอดโต + ขั้นถัดไป, ticker, ป้ายเด้งยอดเข้า
- [ ] logo Fantastic Beasts: กราฟิกจาก Codex + ข้อความประกอบเองฟอนต์จริง
- [ ] DevPanel (ปุ่มลับเปิด/ปิด): ยิงยอดเล็ก/ใหญ่, บังคับ mood, เร่งนาฬิกา, รีเซ็ต
- [ ] commit

### Task 8: Verify + deploy + ส่งมอบ
- [ ] `npx vitest run` + `npx tsc --noEmit` ผ่านหมด
- [ ] สร้าง GitHub repo `fantastic-beasts-game` + Actions deploy (copy workflow เกมที่1) — push, รอ deploy เขียว
- [ ] เปิดเว็บจริง เทสด้วยตา: idle มีชีวิต, ยอดเข้าเด้ง, mood เปลี่ยน, หลอดโต, ขั้นเปลี่ยน
- [ ] LINE สรุป: ลิงก์เว็บ, สิ่งที่อนุมัติแทนระหว่างทาง, จุดที่อยากให้เจ้านายดู
