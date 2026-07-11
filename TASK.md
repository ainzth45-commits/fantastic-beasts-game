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

# เฟส 2 (10 ร่าง) — แผน: docs/superpowers/plans/2026-07-11-fantastic-beasts-phase2-10forms.md
- [ ] ศิลป์ Codex 8 รอบ (sprite 38 + ฉาก 3)
- [ ] Task 1-5: โค้ด 10 ร่าง + ฉากกลุ่ม + ตั้งชื่อที่ peeking + intro bg
- [ ] Task 6-7: เก็บงานจริง + verify + deploy + Codex review + LINE

## บันทึกการอนุมัติแทน (auto-approve log) — เพิ่มเติม
- 13:21 สร้าง GitHub repo สาธารณะ `fantastic-beasts-game` (จำเป็นสำหรับ Pages ฟรี แพทเทิร์นเดียวกับเกมที่1) — แจ้งขอไว้ 13:15 ไม่มีคำตอบใน 5 นาที

## กติกาจากเจ้านาย (ระหว่างทำ)
- 🌟 **สำคัญเท่าระบบ: สัตว์ต้อง "น่ารัก" และ "ดูมีชีวิต"** — มาทื่อๆ ไม่ได้ ต้องกระตุ้นความอยากเลี้ยง → ลงน้ำหนักศิลป์+แอนิเมชัน: idle หลายท่าสุ่มจังหวะ (หายใจ/กะพริบ/เหลือบมอง/กระดิก), squash & stretch, ปฏิกิริยามีนิสัย
- จุดรออนุมัติ: ไม่ตอบใน 5 นาที → อนุมัติแทน + LINE แจ้งว่าอนุมัติอะไร
- จุดที่ต้องรออะไรก็ตาม → ตั้ง loop เช็คต่อเนื่อง ห้ามปล่อยงานค้าง
- จบเฟส 1: รีวิวเอง→แก้จนมั่นใจ→Codex รีวิว→แก้→ค่อยส่งงาน

## บันทึกการอนุมัติแทน (auto-approve log)
- 2026-07-11 12:35 — เลือก concept สัตว์: ใช้ทั้ง 3 ตัวจาก Codex เป็น 3 ระดับ · ง่าย=แกะยูนิคอร์น · กลาง=จิ้งจอกเมฆ · ยาก=มังกรชมพู (POC ทำแกะก่อน) — ไฟล์ concept อยู่ `app/public/assets/concepts/`

## เฟส 2 — auto-approve log
- 2026-07-11 ~15:30 — ปรับดีไซน์ร่าง "cracking" (ไข่เริ่มแตก): เดิมเจ้านายอยากให้มีขา/หาง/แขนโผล่ แต่ Codex วาดอวัยวะโผล่ไม่ชัด (ออกมาเป็นลูกกลม+รูดำ) 3 รอบ → เปลี่ยนเป็น "ไข่ร้าว + ปุยขนโผล่จากรอยแตกนิดเดียว" แทน (Codex ทำได้ดีกว่า ยังสื่อว่าเริ่มฟัก) — cracking เป็นร่างเปลี่ยนผ่านสั้น 5-12%

## เฟส 2 — สถานะพัก (Codex ติด limit 2026-07-11 ~15:45)
เสร็จ+commit แล้ว (art): egg, cracking, peeking, newborn, baby (+ child ของเดิม) = 6 ร่างมีศิลป์ครบ
โค้ดเสร็จหมด 69 เทสผ่าน (domain 10 ร่าง, sprite fallback, labels, ฉากกลุ่ม, ตั้งชื่อ peeking, intro bg placeholder)

### เหลือทำเมื่อ limit หาย (Codex):
- [ ] junior (5 ภาพ) — บรีฟ: scratchpad/p2-r5.txt (พิมพ์ค้างในช่อง Codex แล้ว ยังไม่ส่ง)
- [ ] teen (5) — p2-r6.txt (อ้าง junior-idle)
- [ ] grown+adult (10) — p2-r7.txt (อ้าง teen-idle)
- [ ] ฉาก 3 ภาพ nursery/valley/intro — p2-r8.txt (ยิงไปแล้วแต่ limit ก่อนเสร็จ ต้องยิงใหม่)
### แล้วปิดงาน (Task 6-7):
- [ ] เติม AVAILABLE ครบ 10 ร่าง + แปลงฉาก webp ลบ placeholder
- [ ] verify + deploy + ไล่เทส 10 ร่างบนเว็บจริง + Codex review + LINE สรุป
