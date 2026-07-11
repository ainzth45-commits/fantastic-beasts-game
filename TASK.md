# TASK — Fantastic Beasts (เฟส 1 POC)

> งานใหญ่ข้าม session · เจ้านายอนุมัติแล้ว: ลุยเต็มที่ อนุมัติแทนได้ถ้าไม่ตอบใน 5 นาที (LINE แจ้งสิ่งที่อนุมัติ) · เสร็จ LINE บอก
> spec: `docs/superpowers/specs/2026-07-11-fantastic-beasts-design.md` · plan: `docs/superpowers/plans/2026-07-11-fantastic-beasts-phase1-poc.md`

- [x] Spec + plan + git init
- [x] Task 1: Scaffold app (Vite React TS + vitest) ✅
- [x] Task 2: growth engine (TDD 13 เทส) ✅
- [x] Task 3: mood engine (TDD 17 เทส) ✅
- [x] Task 4: state store + mock feed + ระบบตั้งชื่อ ✅
- [x] Task 5: ศิลป์ Codex — concept 3 ตัว + sprite แกะยูนิคอร์น 8 ท่า (ตรวจตาแล้ว ตัวเดิมทุกภาพ) ✅
- [x] Task 6: Beast component + แอนิเมชันมีชีวิต (หายใจ/กะพริบสุ่ม/quirk/mood/เด้งรับยอด) ✅
- [x] Task 7: จอ TV + logo wordmark + naming + dev panel + **ระบบเริ่มเลี้ยง/พักเลี้ยง** (เพิ่มตามคำสั่ง) ✅
- [x] Task 8: deploy GitHub Pages เขียว + เทสเว็บจริงผ่าน (https://ainzth45-commits.github.io/fantastic-beasts-game/) ✅
- [x] Task 9: Codex review 5 findings → แก้ครบ (dailyTotals/midnight/sanitize/timers/build) + logo เต็ม + พื้นหลัง + ฟอนต์ Mali + ซ่อนเป้า + ระบบเริ่ม/พักเลี้ยง · เทส 50 ผ่าน · เว็บจริงเทสแล้ว ✅ **เฟส 1 จบ**

## บันทึกการอนุมัติแทน (auto-approve log) — เพิ่มเติม
- 13:21 สร้าง GitHub repo สาธารณะ `fantastic-beasts-game` (จำเป็นสำหรับ Pages ฟรี แพทเทิร์นเดียวกับเกมที่1) — แจ้งขอไว้ 13:15 ไม่มีคำตอบใน 5 นาที

## กติกาจากเจ้านาย (ระหว่างทำ)
- 🌟 **สำคัญเท่าระบบ: สัตว์ต้อง "น่ารัก" และ "ดูมีชีวิต"** — มาทื่อๆ ไม่ได้ ต้องกระตุ้นความอยากเลี้ยง → ลงน้ำหนักศิลป์+แอนิเมชัน: idle หลายท่าสุ่มจังหวะ (หายใจ/กะพริบ/เหลือบมอง/กระดิก), squash & stretch, ปฏิกิริยามีนิสัย
- จุดรออนุมัติ: ไม่ตอบใน 5 นาที → อนุมัติแทน + LINE แจ้งว่าอนุมัติอะไร
- จุดที่ต้องรออะไรก็ตาม → ตั้ง loop เช็คต่อเนื่อง ห้ามปล่อยงานค้าง
- จบเฟส 1: รีวิวเอง→แก้จนมั่นใจ→Codex รีวิว→แก้→ค่อยส่งงาน

## บันทึกการอนุมัติแทน (auto-approve log)
- 2026-07-11 12:35 — เลือก concept สัตว์: ใช้ทั้ง 3 ตัวจาก Codex เป็น 3 ระดับ · ง่าย=แกะยูนิคอร์น · กลาง=จิ้งจอกเมฆ · ยาก=มังกรชมพู (POC ทำแกะก่อน) — ไฟล์ concept อยู่ `app/public/assets/concepts/`
