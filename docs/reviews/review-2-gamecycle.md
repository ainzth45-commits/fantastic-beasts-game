# Review 2: Game Cycle + Tier System

วันที่รีวิว: 2026-07-13

ขอบเขต:
- `app/src/state/gameState.ts` (`monthKey`, `syncCarryOver`, `isComplete`, `finishCycle`, `sanitizeGameState`)
- `app/src/state/config.ts` (`REWARDS`, `NEXT_TIER`, `TIER_LABEL`)
- `app/src/state/useGameStore.tsx` (`completeCycle`, `syncCarryOver` effect)
- `app/src/features/tv/CelebrationOverlay.tsx`
- `app/src/state/gameCycle.test.ts`

ข้อสรุป: **REQUEST CHANGES** → ✅ **แก้ครบแล้ว 2026-07-13** (ฟรายเดย์): HIGH → เพิ่ม `feedSaleSynced` (sync จาก `sale.at` ก่อนคิดแต้ม) ใช้ทั้ง path mock+Supabase + `syncCarryOver` เป็น monotonic กันนาฬิกาย้อน · MEDIUM → regex เดือน `(0[1-9]|1[0-2])` · เทสเพิ่ม 3 ตัวตามที่แนะนำ รวม 89/89 ผ่าน

พบ bug จริง 2 ประเด็น:
- HIGH 1 ประเด็น
- MEDIUM 1 ประเด็น

ไม่พบ bug ปัจจุบันใน `REWARDS` / `NEXT_TIER` / `TIER_LABEL` หรือ teaser ของ `CelebrationOverlay`: overlay และ `finishCycle` ใช้ `NEXT_TIER` กลางชุดเดียวกัน จึงยังไม่เห็น state desync ระหว่าง teaser กับ tier ที่ store เริ่มจริง

## Findings

### 1. HIGH: ยอดแรกหลังข้ามเดือนอาจไม่โดน carryOver x0.75 เพราะ store sync เป็นรอบ 30 วินาที

ไฟล์/บรรทัด:
- `app/src/state/useGameStore.tsx:79-91`
- `app/src/state/useGameStore.tsx:106-119`
- `app/src/state/useGameStore.tsx:133-144`
- `app/src/state/gameState.ts:77-80`
- `app/src/state/gameState.ts:181-184`

ปัญหา:
`syncCarryOver` ถูกเรียกจาก effect ที่ผูกกับ `nowTick` ทุก 30 วินาทีเท่านั้น แต่ทั้ง path mock/manual feed และ Supabase feed เรียก `feedSale(current, sale, moodAtSale)` โดยตรงก่อน sync สถานะรอบตามเวลาของยอดนั้น

ผลกระทบ:
- ถ้าจอเปิดค้างข้ามเดือน และยอดเข้าก่อน timer tick ถัดไป ยอดแรกของเดือนใหม่จะใช้ `state.carryOver=false` เดิม ทำให้ได้แต้มเต็ม 1.0x แทน 0.75x
- ถ้ายอดนั้นทำให้ครบเป้าพอดี เกมอาจจบรอบเร็วผิด และ `CelebrationOverlay` / teaser ตัวถัดไปจะขึ้นจาก state ที่จบผิดเวลา
- เคสข้ามหลายเดือนก็ยังมีช่องเดียวกัน: ตราบใดที่ sale path ไม่ sync ก่อนคิดแต้ม ยอดแรกหลังเปิด/หลัง rollover อาจคิดจาก flag เก่า
- เคสเวลาเครื่องเพี้ยน: `syncCarryOver` ใช้ `Date.now()` จากเครื่องผ่าน `nowTick`; ถ้าเครื่องถูกปรับย้อนกลับมาเดือนเดิม effect สามารถพลิก `carryOver` จาก true กลับ false ได้ ทั้งที่กติกา "ข้ามเดือนแล้วโตช้า" ควรคงอยู่จน adult/reset/finishCycle

ตัวอย่าง scenario:
1. เริ่มเลี้ยงวันที่ 2026-07-31 และยังไม่ adult
2. จอเปิดค้างถึง 2026-08-01 00:00:01
3. Supabase ส่งยอดขายเข้าก่อน effect 30 วินาทีทำงาน
4. `feedSale` ใช้ `state.carryOver=false` แล้วคิดแต้มเต็ม

แนวทางแก้:
- ก่อนคิดแต้มในทุก sale ingestion path ให้ sync จากเวลาเดียวกับยอดขาย เช่น `const synced = syncCarryOver(current, sale.at)` แล้วค่อย `feedSale(synced, sale, moodAtSale)`
- หรือปรับ model ให้ carry-over เป็น monotonic state เช่น activated แล้วไม่ revert จน `finishCycle` / `resetGame`
- ถ้าต้องรองรับเวลาเครื่องเพี้ยนจริง ควรเลือก authority เดียวสำหรับ month boundary ระหว่าง `sale.at` จาก feed กับ `Date.now()` ของเครื่อง หรืออย่างน้อย detect skew ใหญ่

เทสที่ควรเพิ่ม:
- store-level test: จอเปิดค้างข้ามเดือน, sale เข้าก่อน timer tick, แต้มต้องโดน 0.75
- regression test: หลัง `carryOver=true` แล้ว local clock ย้อนกลับ ไม่ควรทำให้ยอดถัดไปกลับไปได้ 1.0x
- เคสจบรอบพอดีสิ้นเดือน: sale ที่ timestamp เดือนใหม่ควร sync carry-over ก่อนตรวจ completion

### 2. MEDIUM: `sanitizeGameState` รับ `startedCycle` ที่ format ถูกแต่เดือนเป็นไปไม่ได้

ไฟล์/บรรทัด:
- `app/src/state/gameState.ts:259-260`
- `app/src/state/gameState.ts:181-184`
- `app/src/state/gameCycle.test.ts:91-100`

ปัญหา:
`sanitizeGameState` เก็บ `startedCycle` ถ้าตรง regex `^\d{4}-\d{2}$` เท่านั้น ทำให้ค่าที่ shape ถูกแต่ domain ผิด เช่น `2026-00`, `2026-13`, `2026-99` หลุดเข้าระบบได้

ผลกระทบ:
- localStorage พังหรือข้อมูลเก่า format ผิดแบบ `YYYY-MM` จะไม่ถูกทิ้ง
- `syncCarryOver` ใช้ lexical compare (`monthKey(nowMs) > state.startedCycle`) จึงอาจคำนวณผิดเงียบๆ
- เช่น `startedCycle="2026-99"` จะทำให้เดือนจริงในปี 2026 ไม่มากกว่า `"2026-99"` และ carry-over อาจไม่เปิดทั้งปี

แนวทางแก้:
- validate เดือนแบบ semantic: year เป็นตัวเลข, month อยู่ใน `01` ถึง `12`
- หรือ parse/canonicalize เป็น Date แล้ว drop เป็น `null` ถ้า invalid

เทสที่ควรเพิ่ม:
- `sanitizeGameState({ startedCycle: "2026-00" }).startedCycle` ต้องเป็น `null`
- `sanitizeGameState({ startedCycle: "2026-13" }).startedCycle` ต้องเป็น `null`
- `sanitizeGameState({ startedCycle: "2026-12" }).startedCycle` ยังต้องคงอยู่

## Edge Case Notes

- ข้ามเดือนหลายเดือนติด: string `YYYY-MM` ที่ valid compare ถูกตาม lexical order แต่ bug HIGH ยังเกิดกับยอดแรกที่เข้าก่อน store sync
- จบรอบพอดีสิ้นเดือน: pure `finishCycle` ทำงานถูกเมื่อ state complete แล้ว และ reset ไป tier ถัดไปผ่าน `NEXT_TIER`; ความเสี่ยงอยู่ที่ sale ที่ทำให้ complete อาจถูกคิดแต้มผิดก่อนถึงจุดนั้น
- localStorage พัง/JSON parse ไม่ได้: `loadJson` fallback + `sanitizeGameState` กันจอพังได้ แต่ยังมีช่อง invalid month ที่ shape ถูก
- เวลาเครื่องเพี้ยน: ปัจจุบันใช้ทั้ง `sale.at` และ `Date.now()` คนละจุด ทำให้ carry-over อาจ flip เร็ว/ช้าหรือ revert ถ้าเวลาเครื่องเปลี่ยน
- teaser/celebration กับ store: ตอนนี้ไม่พบ desync เพราะ `CelebrationOverlay` อ่าน `NEXT_TIER[state.tier]` และ `finishCycle` ก็ใช้ `NEXT_TIER[state.tier]` เดียวกัน

## Test Coverage Assessment

ชุด `gameCycle.test.ts` ครอบ pure helpers ได้ดี:
- `startedCycle` จากยอดแรก
- `syncCarryOver` เดือนเดิม/เดือนถัดไป/idempotent
- adult แล้วไม่เปิด carryOver
- `finishCycle` บันทึก history และขยับ tier
- sanitize round-trip บางส่วน

ช่องว่างที่ควรปิด:
- ยังไม่มี test ของ `useGameStore` sale path จึงไม่จับ bug HIGH
- ยังไม่มี test ของ `CelebrationOverlay` / `TvScreen` ว่า teaser ตรงกับ tier หลัง `completeCycle`
- sanitize ยังไม่ test `YYYY-MM` ที่ regex ผ่านแต่เดือน invalid

Verification ที่รัน:
- `npm run build` ใน `app` ผ่าน
- `npx vitest run src/state/gameCycle.test.ts src/state/gameState.test.ts` ใน `app` ผ่าน: 2 files, 30 tests

