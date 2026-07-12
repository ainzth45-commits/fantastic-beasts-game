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
- [x] ฉาก 3 ภาพ nursery/valley/intro ✅ เสร็จ+deploy แล้ว (ทำทันก่อน limit)
### แล้วปิดงาน (Task 6-7):
- [ ] เติม AVAILABLE ครบ 10 ร่าง + แปลงฉาก webp ลบ placeholder
- [ ] verify + deploy + ไล่เทส 10 ร่างบนเว็บจริง + Codex review + LINE สรุป

## เฟส 3 — log
- 3.1 เสร็จ: DB พร้อมอยู่แล้ว (anon SELECT sales/employees/teams + sales ใน realtime publication — dashboard เดิมปูทาง) ไม่ต้องแก้ DB
- auto-approve: ใช้ Supabase publishable key ฝังใน client (ออกแบบมาให้ public + pattern เดียวกับ dashboard เดิม) แทน inject ผ่าน secret

## เฟส 3 — เสร็จสมบูรณ์ (2026-07-11 17:05) ✅
- ฟีดยอดจริง Supabase ทำงานบนเว็บจริง — พิสูจน์ end-to-end: ยอดจริง "เตย มนัสนันท์ +1,790" (sale id 10785) เข้าจอสด ยอดวันขยับตรงเป๊ะ อารมณ์เปลี่ยน
- เชื่อมเฉพาะช่วงเปิดเลี้ยง · dedupe/แก้/ลบยอดรองรับ (ledger counted) · badge สถานะเชื่อมต่อ · toast รูปพนักงาน · mock ผ่าน ?mock=1 · export/import แต้ม
- 74 เทสผ่าน · deploy เขียว (72c189d — มี 1 commit พังก่อนหน้า 2b01e3b fix ทันที)
### งานต่อจากนี้ (session หน้า)
1. ⏸WAIT[Codex limit] ปิดเฟส 2: junior→teen→grown/adult (บรีฟ docs/art-briefs/phase2-remaining-unisheep.md)
2. เฟส 4A วงจรรอบเกม (โค้ดล้วน ทำได้เลย) → ตาม master roadmap

## เพิ่มเติมท้ายวัน (2026-07-11 ค่ำ) ✅
- [x] ปุ่ม logo: กดมุมซ้ายบน → หน้าแรก (logo ใหญ่ค้าง + พักเลี้ยงอัตโนมัติ) · กด logo ใหญ่ → กลับเกม + เริ่มเลี้ยงอัตโนมัติ — เทสจริงผ่าน deploy แล้ว
- [x] พรีวิวโปรโมท: เกมที่2/พรีวิว-หน้าแรก.jpg (logo+ฉาก composite 1920x1080)

## สถานะปิดวัน 2026-07-11
เฟส 1 ✅ · เฟส 2 = 80% (⏸รอ Codex limit — เหลือ junior/teen/grown/adult) · เฟส 3 ✅ (ยอดจริง end-to-end) · เฟส 4A พร้อมเริ่ม (โค้ดล้วน)
เปิด session ใหม่: อ่าน master-roadmap.md + TASK.md นี้ · Codex หายลิมิต → ยิงบรีฟจาก docs/art-briefs/phase2-remaining-unisheep.md ตามลำดับ

## เฟส 2 — ปิดสมบูรณ์ (2026-07-12 เช้า) ✅
Codex หายลิมิต → ไล่ 3 รอบสุดท้ายจบในเช้าเดียว:
- [x] junior 5 ภาพ (รอบ 5 — บรีฟค้างในช่องจากรอบก่อน Codex รันเองต่อจนจบ) → ตรวจตาผ่าน → webp → push 3f14967
- [x] teen 5 ภาพ (รอบ 6) — แก้ 1 รอบ: ภาพแรกไม่มีปุยเมฆรองเหมือนร่างอื่น สั่งเติมเมฆแบบชี้ชัด (ห้ามแตะอย่างอื่น) ✅ → push cddec50
- [x] grown+adult 10 ภาพ (รอบ 7) — ผ่านรอบเดียว adult มีออร่ารุ้งสวยตามบรีฟ → push 944fe4e
- [x] AVAILABLE ครบ 10 ร่าง · เทส 76/76 ผ่าน · curl เช็ค webp ใหม่ทั้ง 20 ไฟล์บน Pages = 200 หมด
- [x] เทสเต็มระบบบนเว็บจริง (?mock=1): ไล่ egg→cracking→peeking(ตั้งชื่อเด้ง)→newborn→baby→child→teen→grown→adult ครบ ฉากเปลี่ยนถูกทุกกลุ่ม (egg→nursery→ทุ่งเห็ด→หุบเขาลอยฟ้า→ปราสาทฟ้า) — junior label ข้ามไปเพราะ mood ×1.5 เร่งแต้มระหว่างคลิก แต่ sprite junior ยืนยันจาก contact sheet + เทสหน่วย + ไฟล์ live แล้ว
- [x] Codex code review: ไม่มี blocker · แก้ MEDIUM แล้ว (เทส map-to-disk 77/77 ผ่าน, push bd00900) · LOW 2 ข้อจดไว้ (fallback regression + STAGE_FALLBACK drift)
- หมายเหตุ: กติกาใหม่จากเจ้านาย — Codex/Claude ติดหรือใกล้ limit ให้แจ้ง LINE ทันที (บันทึกใน memory line-notify-on-limit แล้ว)

## เฟส 4A — เสร็จ (2026-07-12 สาย) ✅
- [x] startedCycle ตั้งจากยอดแรก · syncCarryOver อัตโนมัติตามนาฬิกา (ข้ามเดือน+ยังไม่เต็มวัย → ×0.75) · เต็มวัยแล้วไม่นับ carryOver
- [x] ฉากฉลองโตเต็มวัย: confetti CSS + ชื่อน้อง + รางวัล (config REWARDS) + ทีเซอร์ตัวถัดไป + ปุ่มแอดมิน "รับรางวัล & เริ่มตัวถัดไป" + ปุ่มฉลองต่อ (พับเก็บ/เปิดใหม่จากป้าย 🎉)
- [x] finishCycle → history (หอเกียรติยศ) + เริ่ม tier ถัดไป · resetGame ไม่ล้าง history · sanitize ครบ
- [x] เทสวงจร 10 เคส + เทสจริงบน dev: เลี้ยงจบ→ฉลอง→รับรางวัล→ไข่ตัวใหม่ ✅ (push 2e41d02)
- auto-approve (5 นาที ไม่มีคำตอบ): ① ลำดับตัวล็อก easy→medium→hard (ตรงกติกา "เริ่มจากง่าย") ไม่ทำหน้าจอเลือกอิสระ — ใช้ทีเซอร์ในฉากฉลองแทน ② ครบ 3 ตัว → วนกลับ easy ③ ข้อความรางวัล = placeholder "รางวัลพิเศษจากหัวหน้า 🎁" ④ เป้า medium/hard ใช้ DEFAULT_GOALS 2.4M/3.0M — ทั้งหมดเปลี่ยนทีหลังได้ใน app/src/state/config.ts

## เฟส 4B — เริ่มแล้ว (ศิลป์จิ้งจอกเมฆ + โค้ด tier)
- [x] F1 ไข่จิ้งจอกเมฆ 6 ภาพ ✅ ตรวจตาผ่าน (โทนฟ้าน้ำแข็ง ต่างจากไข่แกะชัด) push 682ede9
- [x] โค้ด tier: beastSprite(tier,...) แยกโฟลเดอร์ beast-easy/medium/hard · fallback ในสายพันธุ์เดียวเท่านั้น · สายพันธุ์ไม่มีศิลป์ → placeholder ไข่แกะ (auto-approve กันจอพัง) · ฉากใช้ร่วม 3 สายพันธุ์ไปก่อน (ตาม roadmap ข้อแนะนำ ก) push 27a8300
- [ ] F2 peeking (Codex กำลังทำ) → F3-F8 ตามโซ่ → มังกร D1-D8

## เฟส 5 + เฟส 6 บางส่วน (2026-07-12 บ่าย — ช่วง Codex ติดลิมิต)
- [x] เฟส 5 ระบบเสียง: `app/src/sound/sound.ts` WebAudio สังเคราะห์ (auto-approve ทาง ข — ไม่ต้องโหลดไฟล์/ขออนุมัติ สลับเป็น CC0 ทีหลังได้โดย API เดิม) · SFX: ยอดเข้า ding / ยอดใหญ่≥50k bigding / เลื่อนร่าง sparkle / เต็มวัย fanfare / เศร้า-เหงา aww / ปุ่ม pop · ปุ่ม 🔊/🔇 จำค่า · ปลดล็อกที่ปุ่มเริ่มเลี้ยง (ผ่าน autoplay policy) · ไม่มี BGM (ตาม default) · เทส 86/86 + เช็ค console บน dev สะอาด — push 68db9dc
- [ ] ⚠️ รอเจ้านายฟังเสียงจริงบนจอ/ลำโพงจริง — ฟรายเดย์ฟังไม่ได้ ถ้าไม่ถูกใจเปลี่ยนเป็นไฟล์ CC0 ได้ (ต้องดาวน์โหลด = ขออนุมัติ)
- [x] เฟส 6 ข้อย่อย: ซ่อน DevPanel ใน production — โชว์เฉพาะ ?dev=1 / ?mock=1 (push d3e7acc)
- [x] เทสจริงบน dev: จอ medium โชว์ไข่จิ้งจอกเมฆถูกต้อง (tier pipeline ครบวงจร)
- Codex: F5 child มาครบก่อนลิมิตตัด → เข้าเกมแล้ว · จิ้งจอกเมฆคืบ 26/46 ภาพ · feedback เก็บที่ docs/art-briefs/codex-feedback-2026-07-12.md · ลิมิตรีเซ็ต 14:04 (มี watcher ปลุก) → ต่อ F6→F7→F8 → มังกร + ตามผลรีวิว #2
