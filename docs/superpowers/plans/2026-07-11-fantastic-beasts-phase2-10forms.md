# Fantastic Beasts — เฟส 2: ระบบ 10 ร่าง + ฉากต่อกลุ่มร่าง + ฉากหน้าแรก

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans — ทำทีละ task ตาม checkbox จนจบ
> ผู้รัน: Friday (Opus 4.8) · เจ้านายอนุมัติแผนแล้ว · กติการะหว่างรัน: จุดรออนุมัติเกิน 5 นาที = อนุมัติแทน + LINE แจ้ง · จุดรอไฟล์/deploy = ตั้ง loop เฝ้า ห้ามปล่อยค้าง · เสร็จทั้งแผน = LINE สรุป

**Goal:** สัตว์วิเศษโตแบบละเอียด 10 ร่าง (ไข่→โตเต็มวัย) · ฉากหลังผูกกับ "กลุ่มร่าง" · ฉากหน้าแรกเฉพาะ intro · ตั้งชื่อได้ตั้งแต่ร่างที่ 3 พร้อมโชว์ตัวน้องชัดๆ ในหน้าตั้งชื่อ

**Architecture:** ขยาย `Stage` จาก 5 → 10 ค่า (pure domain, threshold เป็นตาราง config) · sprite ตั้งชื่อไฟล์ตาม stage · `StageBackground` map ร่าง→กลุ่มฉาก · ศิลป์ทั้งหมด gen โดย Codex ทีละรอบพร้อม reference คุมตัวเดิม

**Tech:** React 18 + TS + Vite + vitest (โครงเดิม) · Codex ผ่าน skill `codex-gui-control` · ImageMagick แปลง webp

**สถานะก่อนเริ่ม (ตรวจแล้ว 2026-07-11 15:00):**
- assets มี: `beast-easy/{egg-idle,egg-happy,hatching-idle,child-idle,child-blink,child-happy,child-sad,child-sleep}.webp` + `bg-egg.webp, bg-child.webp, bg-adult.webp, logo-full.webp`
- `Stage = "egg"|"hatching"|"child"|"teen"|"adult"` ที่ `app/src/domain/types.ts:7`
- เทส 50 ตัวผ่าน · deploy GitHub Pages เขียว · dev server พอร์ต 5199 (ถ้าปิดแล้วรันใหม่: `cd app && npm run dev -- --port 5199`)

---

## A. ดีไซน์ 10 ร่าง (ล็อกแล้ว — ห้ามเปลี่ยนโดยไม่ถามเจ้านาย)

| # | Stage id | ชื่อไทย (โชว์จอ) | % เป้า | ภาพท่าที่ต้องมี | หมายเหตุ |
|---|---|---|---|---|---|
| 1 | `egg` | ไข่ปริศนา | 0% | idle, happy, sleep | ✅ idle+happy มีแล้ว (egg-*) — gen เพิ่มแค่ sleep |
| 2 | `cracking` | ไข่เริ่มแตก | 5% | idle, happy, sleep | ไข่มีรอยร้าว + **ขา/หาง/แขนจิ๋วโผล่ออกมา** (ตามเจ้านายสั่ง) |
| 3 | `peeking` | โผล่พ้นไข่ | 12% | idle, blink, happy, sad, sleep | ครึ่งท่อนบนโผล่ ท่อนล่างอยู่ในไข่ · ✅ idle มีแล้ว (rename จาก hatching-idle) · **ร่างนี้เริ่มตั้งชื่อได้ + หน้าตั้งชื่อโชว์ร่างนี้ตัวใหญ่** |
| 4 | `newborn` | แรกเกิด | 20% | idle, blink, happy, sad, sleep | ออกจากไข่เต็มตัว ตัวจิ๋วสุด มีเศษเปลือกไข่ครอบหัวเป็นหมวก (น่ารัก+สื่อว่าเพิ่งฟัก) |
| 5 | `baby` | วัยทารก | 30% | idle, blink, happy, sad, sleep | ตัวป้อมกลม คลาน/นั่ง สัดส่วนหัวโตสุด |
| 6 | `child` | วัยเด็ก | 42% | idle, blink, happy, sad, sleep | ✅ มีครบแล้ว (child-*) ไม่ต้อง gen |
| 7 | `junior` | เด็กโต | 55% | idle, blink, happy, sad, sleep | ยืนมั่นคง ตัวสูงขึ้น ขน/แผงผมฟูขึ้น เริ่มเห็นเค้าโครงโต |
| 8 | `teen` | วัยรุ่น | 68% | idle, blink, happy, sad, sleep | ตัวเพรียวขึ้น เขา/ปีก/หางยาวชัด ท่าทางมั่นใจ |
| 9 | `grown` | วัยหนุ่มสาว | 83% | idle, blink, happy, sad, sleep | เกือบเต็มวัย องค์ประกอบครบ แต่ยังอ่อนกว่า adult |
| 10 | `adult` | โตเต็มวัย | 100% | idle, blink, happy, sad, sleep | เต็มยศ สง่างาม ออร่าเวทมนตร์ ประกายรอบตัว |

- **ภาพใหม่ที่ต้อง gen: 38 ภาพ** (ร่าง1: 1 · ร่าง2: 3 · ร่าง3: 4 · ร่าง4,5: 10 · ร่าง7-10: 20) — ร่าง 6 ใช้ของเดิมครบ
- ชื่อไฟล์: `app/public/assets/beast-easy/{stage}-{pose}.webp` เช่น `cracking-idle.webp`, `newborn-sleep.webp`
- rename ของเดิม (git mv): `hatching-idle.webp → peeking-idle.webp` (egg-* และ child-* ชื่อตรงอยู่แล้ว)
- mood→pose (ตรรกะเดิมใน sprites.ts): sleep→sleep · blink→blink · thrilled/happy→happy · sad/lonely→sad · calm→idle · ร่างที่ไม่มี pose → fallback idle ของร่างนั้น → ถอยร่างก่อนหน้า (อัปเดตตาราง fallback ให้ครบ 10 ร่าง)

## B. กลุ่มฉากหลัง (ฉากผูกกับกลุ่มร่าง — ร่างในกลุ่มเดียวกันใช้ฉากเดียวกัน)

| กลุ่ม | ร่าง | ไฟล์ฉาก | สถานะ |
|---|---|---|---|
| G1 ไข่ (ยังไม่ฟัก) | egg, cracking | `bg-egg.webp` (ถ้ำคริสตัล) | ✅ มีแล้ว |
| G2 ฟัก/ทารก | peeking, newborn, baby | `bg-nursery.webp` | 🆕 gen ใหม่ |
| G3 เด็ก | child, junior | `bg-child.webp` (ป่าเวทมนตร์) | ✅ มีแล้ว |
| G4 วัยรุ่น | teen, grown | `bg-valley.webp` | 🆕 gen ใหม่ |
| G5 เต็มวัย | adult | `bg-adult.webp` (อาณาจักรลอยฟ้า) | ✅ มีแล้ว |
| หน้าแรกเท่านั้น | (intro splash) | `bg-intro.webp` | 🆕 gen ใหม่ — ห้ามซ้ำธีมกับ 5 ฉากบน |

crossfade ตอนข้ามกลุ่ม (กลไก `StageBackground` เดิมรองรับอยู่แล้ว แค่เปลี่ยนตาราง map)

## C. บรีฟ Codex (ข้อความเต็ม — copy วางได้เลย)

**วิธีส่งทุกรอบ (skill `codex-gui-control`):**
1. เช็กเครื่องว่าง: `screencapture -x -D 2 <scratch>/check.png` แล้ว Read ดูว่า Codex ไม่ได้กำลังรันงานอยู่ (composer ว่าง ไม่มี "กำลังคิด")
2. เขียนบรีฟลงไฟล์ .txt → `pbcopy < ไฟล์` → `osascript activate (bundle id com.openai.codex)` → **Cmd+N (key code 45+cmd) เปิดงานใหม่ให้ composer โฟกัส** → รอ 1.2s → Cmd+V (key code 9+cmd) → screencap ตรวจว่าข้อความลงครบ → Enter (key code 36)
3. ตั้ง watcher background loop เฝ้าไฟล์ .png ปลายทาง (ตัวอย่างอยู่ในประวัติ session: loop ls ทุก 30s timeout 30-40 นาที)
4. ไฟล์มาแล้ว → **Read ดูภาพจริงทุกภาพ** เช็ก: ตัวเดิมเป๊ะกับ reference / โปร่งใส / ไม่มีตัวหนังสือ / ท่าตรงบรีฟ → ไม่ผ่านข้อไหน ส่งบรีฟแก้เฉพาะภาพนั้นทันที (ระบุไฟล์+ปัญหา)
5. ผ่านแล้ว: `magick {f}.png -resize 640x640 {f}.webp` (sprite) หรือ `-resize 1920x1080 -quality 82` (ฉาก) แล้ว `rm` ไฟล์ .png (gitignore กันอยู่แล้ว แต่ลบกันรก)

> ⚠️ ทุกบรีฟ sprite ต้องย้ำ 3 อย่างเสมอ: (1) เปิดไฟล์ reference ก่อนวาด (2) พื้นหลังโปร่งใส 1024×1024 (3) ห้ามมีตัวหนังสือ
> ⚠️ Codex ชอบเซฟเป็น .png — ระบุ path .png ให้เลย ทีมแปลง webp เอง
> ⚠️ ถ้า Codex ทำผิดทิศ (เช่นเพี้ยนจาก reference) อย่าฝืนแก้เกิน 2 รอบ — ให้ระบุปัญหาแบบเจาะจงขึ้น หรือแนบชื่อไฟล์ reference เพิ่ม

### รอบที่ 1 — ร่าง 1-2 (ไข่ 4 ภาพ)
```
งานชุดใหม่ของเกม Fantastic Beasts: ขยายร่างสัตว์เป็น 10 ร่าง — รอบนี้ทำชุดไข่ 4 ภาพ
ตัวละคร: "น้องแกะยูนิคอร์น" — reference หลัก: เปิดไฟล์ app/public/assets/concepts/concept-3-unisheep.png และไข่เดิม app/public/assets/beast-easy/egg-idle.webp (ไข่สีครีมลายปุยเมฆ+แถบรุ้งพาสเทล เขาทองจิ๋วบนยอด วางบนปุยเมฆ) — ทุกภาพต้องเป็นไข่ใบเดิมนี้เป๊ะๆ

สร้าง 4 ภาพ บันทึกเป็น PNG ลง app/public/assets/beast-easy/ ชื่อไฟล์เป๊ะๆ:
1. egg-sleep.png — ไข่ใบเดิม "หลับ" อยู่บนปุยเมฆ: บรรยากาศนิ่งสงบ มีผ้าห่มเมฆบางๆ คลุมครึ่งใบ ดาว zzz เล็กๆ ลอย 1-2 ดวง แสงสลัวอุ่นๆ
2. cracking-idle.png — ไข่ใบเดิมมี "รอยแตกร้าว" หลายเส้นชัดเจน และมี "ขาหน้าเล็กจิ๋วสีครีม 1 ข้าง กับปลายหางฟูพาสเทล" โผล่ออกมาจากรอยแตก (ยังไม่เห็นหน้า) — สื่อว่าน้องข้างในกำลังดิ้น
3. cracking-happy.png — ไข่ใบเดิมรอยแตกเยอะขึ้น สั่นดุ๊กดิ๊ก ขาจิ๋ว+หางโผล่ขยับ มีประกายดาวแตกกระจายรอบ หัวใจเล็กๆ ลอย — สื่อว่าใกล้ได้เจอกันแล้ว
4. cracking-sleep.png — ไข่ร้าว (ขา/หางโผล่) แต่นิ่งสงบ หลับอยู่ ดาว zzz ลอย แสงสลัว
สเปกทุกภาพ: พื้นหลังโปร่งใส PNG 1024x1024 · สไตล์ chibi พาสเทลเดิม · ห้ามมีตัวหนังสือใดๆ · ไข่อยู่กลางภาพขนาดใกล้เคียง egg-idle เดิม
เสร็จแล้วตอบว่าบันทึกครบ 4 ไฟล์ไหม
```

### รอบที่ 2 — ร่าง 3 peeking (4 ภาพ — ร่างสำคัญ ใช้ในหน้าตั้งชื่อ)
```
ต่อเนื่องชุด 10 ร่าง: รอบนี้ร่าง "โผล่พ้นไข่" (peeking) — reference: เปิดไฟล์ app/public/assets/beast-easy/peeking-idle.webp (น้องแกะยูนิคอร์นครึ่งท่อนบนโผล่จากไข่แตก ท่อนล่างยังอยู่ในเปลือก) และ concept-3-unisheep.png — ทุกภาพต้องเป็นตัวเดิม ท่าเดิม (ครึ่งบนโผล่จากไข่ใบเดิม) เปลี่ยนเฉพาะสีหน้า/อารมณ์

สร้าง 4 ภาพ PNG ลง app/public/assets/beast-easy/:
1. peeking-blink.png — เหมือน peeking-idle เป๊ะทุกอย่าง แต่ "ตาปิด" (กะพริบ ยิ้มเหมือนเดิม) ห้ามขยับส่วนอื่น
2. peeking-happy.png — น้องในไข่ยิ้มกว้างตาเป็นประกายดาว ชูแขนจิ๋วสองข้างพ้นขอบเปลือก เศษเปลือกกระเด็น ดาว+หัวใจลอยรอบ
3. peeking-sad.png — น้องในไข่หูตก ตาโตรื้นน้ำตาคลอ ปากเบะ มุดต่ำลงในเปลือกนิดๆ (เศร้าแบบน่ากอด)
4. peeking-sleep.png — น้องในไข่หลับ ตาปิดสนิท หน้าพิงขอบเปลือก zzz ลอย สงบน่าเอ็นดู
สเปก: โปร่งใส 1024x1024 · chibi พาสเทลเดิม · ห้ามตัวหนังสือ · ขนาด/ตำแหน่งตัวใกล้เคียง peeking-idle
เสร็จแล้วตอบว่าครบ 4 ไฟล์ไหม
```

### รอบที่ 3 — ร่าง 4 newborn (5 ภาพ)
```
ต่อเนื่อง: ร่าง "แรกเกิด" (newborn) — น้องแกะยูนิคอร์นออกจากไข่เต็มตัวครั้งแรก ตัวจิ๋วที่สุด สัดส่วนหัวโตมาก ขายังเตาะแตะ และมี "เศษเปลือกไข่ครอบบนหัวเป็นหมวก" (เอกลักษณ์ร่างนี้ ทุกท่าต้องมี)
reference ตัวละคร: app/public/assets/concepts/concept-3-unisheep.png + child-idle.webp (แต่ทำให้เด็กกว่า เล็กกว่า ป้อมกว่า child ชัดเจน) — ขนครีมฟู ผมหน้าม้ารุ้งพาสเทล (สั้นกว่าวัยเด็ก) เขาทองจิ๋วมาก ยังไม่มีปลอกคอ ยืน/นั่งบนปุยเมฆ

สร้าง 5 ภาพ PNG ลง app/public/assets/beast-easy/:
1. newborn-idle.png — นั่งเตาะแตะบนเมฆ ตาโตกลมใส ยิ้มเบิกบาน เปลือกไข่ครอบหัว
2. newborn-blink.png — ท่าเดียวกับ idle เป๊ะ แต่ตาปิด (กะพริบ)
3. newborn-happy.png — ตบมือ/ชูแขนดีใจ ตาประกายดาว เปลือกบนหัวเอียง ดาวหัวใจลอย
4. newborn-sad.png — นั่งห่อตัว หูตก น้ำตาคลอ เปลือกไข่เกือบปิดตา
5. newborn-sleep.png — นอนขดกลมบนเมฆ เปลือกไข่คลุมเหมือนผ้าห่ม zzz ลอย
สเปก: โปร่งใส 1024x1024 · chibi พาสเทล · ห้ามตัวหนังสือ · ตัวเล็กกว่า child-idle ราว 20% ในเฟรม
เสร็จแล้วตอบว่าครบ 5 ไฟล์ไหม
```

### รอบที่ 4 — ร่าง 5 baby (5 ภาพ)
```
ต่อเนื่อง: ร่าง "วัยทารก" (baby) — โตกว่า newborn แต่เด็กกว่า child: ตัวป้อมกลมสุดๆ ไม่มีเปลือกไข่แล้ว เริ่มมีปลอกคอพาสเทลเส้นเล็ก (จี้เพชรจิ๋ว) ผมหน้าม้ารุ้งฟูขึ้นเล็กน้อย เขาทองยังจิ๋ว
reference: concept-3-unisheep.png + newborn-idle.png (ที่เพิ่งทำ) + child-idle.webp — baby ต้องอยู่ "ตรงกลาง" ระหว่างสองร่างนี้ชัดเจน ตัวเดิมคนเดิม

สร้าง 5 ภาพ PNG ลง app/public/assets/beast-easy/: baby-idle.png (คลาน/นั่งป้อมยิ้มสดใส) · baby-blink.png (ท่าเดิมตาปิด) · baby-happy.png (กลิ้งเล่นดีใจ ตาดาว หัวใจลอย) · baby-sad.png (นั่งหูตกตาคลอ) · baby-sleep.png (นอนขดกอดปุยเมฆชิ้นเล็ก zzz)
สเปก: โปร่งใส 1024x1024 · chibi พาสเทล · ห้ามตัวหนังสือ
เสร็จแล้วตอบว่าครบ 5 ไฟล์ไหม
```

### รอบที่ 5 — ร่าง 7 junior (5 ภาพ)
```
ต่อเนื่อง: ร่าง "เด็กโต" (junior) — โตกว่าวัยเด็ก (child) หนึ่งขั้น: ตัวสูงขึ้น ยืนสี่ขามั่นคง ขนแผงคอ/ผมหน้าม้ารุ้งยาวฟูขึ้นชัด หางรุ้งพาสเทลยาวขึ้น เขาทองเกลียวยาวขึ้นเล็กน้อย ปลอกคอ+จี้เพชรเหมือนเดิม สัดส่วนหัวเล็กลงกว่า child นิดหน่อย (โตขึ้น)
reference: app/public/assets/beast-easy/child-idle.webp + concept-3-unisheep.png — ตัวเดิมคนเดิม โตขึ้น

สร้าง 5 ภาพ PNG ลง app/public/assets/beast-easy/: junior-idle.png (ยืนยิ้มมั่นใจ) · junior-blink.png (ท่าเดิมตาปิด) · junior-happy.png (กระโดดดีใจ ตาดาว) · junior-sad.png (หมอบห่อตัว หูตก ตาคลอ) · junior-sleep.png (นอนขดบนเมฆ zzz)
สเปก: โปร่งใส 1024x1024 · chibi พาสเทล · ห้ามตัวหนังสือ · ยืนบนปุยเมฆเหมือนทุกร่าง
เสร็จแล้วตอบว่าครบ 5 ไฟล์ไหม
```

### รอบที่ 6 — ร่าง 8 teen (5 ภาพ)
```
ต่อเนื่อง: ร่าง "วัยรุ่น" (teen) — ตัวเพรียวสง่าขึ้นชัดเจน: ขายาวขึ้น คอระหง เขาทองเกลียวยาวสวย แผงคอ/ผมรุ้งพาสเทลสยายพลิ้ว หางรุ้งยาวพลิ้ว เริ่มมี "ปีกเมฆเล็กๆ" งอกที่หลัง (เอกลักษณ์ใหม่ของวัยรุ่น) ปลอกคอจี้เพชรเดิม
reference: junior-idle.png (ที่เพิ่งทำ) + concept-3-unisheep.png — ตัวเดิม โตเป็นวัยรุ่น

สร้าง 5 ภาพ PNG ลง app/public/assets/beast-easy/: teen-idle.png (ยืนสง่า ยิ้มมั่นใจ) · teen-blink.png (ตาปิด ท่าเดิม) · teen-happy.png (โยกเต้น/ควงตัวร่าเริง ประกายรอบ) · teen-sad.png (นั่งซึม หูตก มองต่ำ) · teen-sleep.png (นอนหมอบ ปีกเมฆคลุมตัว zzz)
สเปก: โปร่งใส 1024x1024 · chibi พาสเทล (ยังน่ารัก ไม่ realistic) · ห้ามตัวหนังสือ
เสร็จแล้วตอบว่าครบ 5 ไฟล์ไหม
```

### รอบที่ 7 — ร่าง 9-10 grown + adult (10 ภาพ — รอบใหญ่สุดท้ายของ sprite)
```
ต่อเนื่อง 2 ร่างสุดท้าย: "วัยหนุ่มสาว" (grown) และ "โตเต็มวัย" (adult)
reference: teen-idle.png + concept-3-unisheep.png — ตัวเดิมคนเดิม

grown (วัยหนุ่มสาว — เกือบเต็มวัย): ปีกเมฆใหญ่ขึ้นครึ่งกาง เขาทองเกลียวเต็มความยาว แผงคอรุ้งเต็ม ท่าทางสง่านุ่มนวล ยังไม่มีออร่า
สร้าง: grown-idle.png · grown-blink.png · grown-happy.png · grown-sad.png · grown-sleep.png

adult (โตเต็มวัย — ร่างสุดท้าย สวยที่สุด): ปีกเมฆกางเต็มสง่างาม มี "ออร่าแสงเวทมนตร์สีรุ้งอ่อนๆ" ล้อมรอบตัว ประกายดาวลอยรอบ ยืนบนปุยเมฆใหญ่ ท่าทางภูมิฐานแต่ใบหน้ายังอ่อนโยนน่ารัก
สร้าง: adult-idle.png · adult-blink.png · adult-happy.png (ผงกหัวเริงร่า โปรยประกาย) · adult-sad.png · adult-sleep.png
สเปกทุกภาพ: โปร่งใส 1024x1024 · chibi พาสเทล · ห้ามตัวหนังสือ · ตัวใหญ่เต็มเฟรมกว่าร่างก่อนๆ เล็กน้อย
เสร็จแล้วตอบว่าครบ 10 ไฟล์ไหม
```

### รอบที่ 8 — ฉากใหม่ 3 ภาพ (nursery + valley + intro)
```
งานฉากพื้นหลัง 3 ภาพสุดท้าย — โทนเวทมนตร์แฟนตาซีสดใสเดียวกับ bg-egg/bg-child/bg-adult ที่ทำไว้ (เปิดดู app/public/assets/bg-egg.webp, bg-child.webp, bg-adult.webp เป็น reference โทน) · ทุกภาพ 1920x1080 เต็มเฟรม · ไม่มีตัวละคร/สัตว์/ตัวหนังสือ · กลางล่างโล่งไว้วางสัตว์:

1. app/public/assets/bg-nursery.png — "เรือนเพาะฟักเวทมนตร์" สำหรับร่างแรกเกิด/ทารก: โพรงไม้ใหญ่อบอุ่นบุด้วยรังหญ้านุ่มและปุยเมฆ โคมดอกไม้เรืองแสงห้อยเพดาน แสงทองอ่อนนุ่มเหมือนแสงตะเกียง ผ้าห่มเมฆ ของเล่นคริสตัลจิ๋ววางมุมภาพ — ให้ความรู้สึก "เนิร์สเซอรี่อบอุ่นปลอดภัย" ต่างจากถ้ำคริสตัล (bg-egg) ชัดเจน
2. app/public/assets/bg-valley.png — "หุบเขาสายลมเวทมนตร์" สำหรับวัยรุ่น: ที่ราบสูงเปิดกว้าง มองเห็นหุบเขา/แม่น้ำเรืองแสงเบื้องล่าง ท้องฟ้ากว้างพระอาทิตย์บ่าย เมฆลอยระดับสายตา ธงเวทมนตร์/เสาหินรูน สายลมพัดกลีบดอกไม้ปลิว — สื่อ "โลกกว้าง การผจญภัย อิสระ" ต่างจากป่า (bg-child) และอาณาจักร (bg-adult)
3. app/public/assets/bg-intro.png — ฉากหน้าแรกของเกม (ใช้กับโลโก้ใหญ่กลางจอเท่านั้น): "ประตูเวทมนตร์สู่โลกสัตว์วิเศษ" — ซุ้มประตูหินโค้งยักษ์กลางภาพ (โลโก้จะลอยอยู่หน้าซุ้ม เว้นกลางภาพให้โล่ง) ด้านหลังประตูเห็นแสงเวทมนตร์รุ้งทะลุออกมา ท้องฟ้าพลบค่ำม่วง-ทองมีทางช้างเผือกสีรุ้ง ผีเสื้อแสง ประกายลอย — ธีมต้องเข้ากับโลโก้มังกร (ทอง-ม่วง-ฟ้าคราม) และห้ามซ้ำบรรยากาศกับฉากอีก 5 ภาพ
เสร็จแล้วตอบว่าครบ 3 ไฟล์ไหม
```

**หลังทุกรอบผ่านการตรวจ:** แปลง webp → commit ทันทีทีละรอบ (อย่ารวมยาว เดี๋ยว iCloud สร้างไฟล์ " 2" แทรก — เจอไฟล์ `* 2.*` ให้ลบทิ้งทันที)

---

## D. งานโค้ด (ทำคู่ขนานระหว่างรอ Codex — ใช้ placeholder ก่อนได้)

### Task 1: Domain — 10 ร่าง (TDD)
**Files:** `app/src/domain/types.ts` · `app/src/domain/growth.ts` · `growth.test.ts`
- [ ] แก้ `Stage` เป็น: `"egg"|"cracking"|"peeking"|"newborn"|"baby"|"child"|"junior"|"teen"|"grown"|"adult"`
- [ ] แก้ `STAGE_THRESHOLDS` ตามตาราง A (0/.05/.12/.20/.30/.42/.55/.68/.83/1.0)
- [ ] เขียนเทสก่อน: ขอบเขตทุกร่าง (ก่อนถึง/ถึงพอดี), เป้า 0 → adult, ติดลบ → egg · `nextStageInfo` คืนร่างถัดไปถูกทุกช่วง
- [ ] `npx vitest run` ผ่าน → commit `feat(domain): 10 growth forms`

### Task 2: Sprites mapping + rename ไฟล์เดิม
**Files:** `app/src/ui/beast/sprites.ts` · `sprites.test.ts` · rename ใน `app/public/assets/beast-easy/`
- [ ] `git mv app/public/assets/beast-easy/hatching-idle.webp app/public/assets/beast-easy/peeking-idle.webp`
- [ ] เขียน `AVAILABLE` ใหม่ครบ 10 ร่าง (pose ตามตาราง A — ร่างที่ยังไม่มีภาพจริง ให้ประกาศเฉพาะที่มีจริงบนดิสก์ ณ ตอนนั้น แล้วค่อยเติมทีละรอบเมื่อภาพมา)
- [ ] `STAGE_FALLBACK` ถอยทีละขั้น: cracking→egg, peeking→cracking, newborn→peeking, baby→newborn, child→baby, junior→child, teen→junior, grown→teen, adult→grown
- [ ] เทส: ทุกร่าง×ทุก mood คืน path ที่มีจริง (สร้าง test ที่ล้อ AVAILABLE) + fallback ทำงานตอนภาพยังไม่ครบ → commit

### Task 3: Labels + StageBackground map กลุ่มฉาก
**Files:** `app/src/features/tv/TvScreen.tsx` (STAGE_LABEL) · `app/src/ui/StageBackground.tsx`
- [ ] `STAGE_LABEL` ไทยครบ 10 ตามตาราง A
- [ ] `STAGE_BG`: egg,cracking→`bg-egg` · peeking,newborn,baby→`bg-nursery` · child,junior→`bg-child` · teen,grown→`bg-valley` · adult→`bg-adult`
- [ ] วางไฟล์ placeholder ชั่วคราว: `cp bg-egg.webp bg-nursery.webp; cp bg-child.webp bg-valley.webp` (แทนจริงเมื่อรอบ 8 มา)
- [ ] `npm run build` + เทสผ่าน → commit

### Task 4: ตั้งชื่อที่ร่าง peeking + โชว์ตัวน้องในหน้าตั้งชื่อ
**Files:** `app/src/state/gameState.ts` (`isHatched`) · `app/src/features/tv/NamingOverlay.tsx` · `tv.css`
- [ ] `isHatched(state)` = ร่างปัจจุบันถึง `peeking` ขึ้นไป (index เทียบลำดับใน STAGE_THRESHOLDS ≥ 2) — เทสขอบ 11.9% ยังไม่ได้ตั้ง / 12% ตั้งได้
- [ ] NamingOverlay: แทน emoji 🐣 ด้วย `<img src=beastSprite("peeking","happy",false)>` ตัวใหญ่ (clamp ~200-280px) + แอนิเมชันเด้งเบาๆ (reuse `beast-breathe`) — **เจ้านายสั่ง: ให้เห็นน้องร่างนี้ชัดๆ ตอนตั้งชื่อ**
- [ ] เทสด้วยตาบน dev: reset → +180k×2 → overlay ขึ้นพร้อมรูป peeking-happy → commit

### Task 5: Intro ใช้ฉากเฉพาะ bg-intro
**Files:** `app/src/features/intro/IntroSplash.tsx`
- [ ] เปลี่ยน `intro__bg` src เป็น `assets/bg-intro.webp` (placeholder: cp bg-adult.webp bg-intro.webp จนกว่ารอบ 8 มา)
- [ ] build ผ่าน → commit

### Task 6: ศิลป์ครบแล้ว — เก็บงานจริง
- [ ] ภาพ sprite ครบ 38 + ฉาก 3: เติม `AVAILABLE` ให้ครบทุกร่างทุก pose · ลบ placeholder ฉาก · ตรวจ `beastSprite` เทสอัปเดตตาม
- [ ] ไล่ดูทุกร่างบน dev ด้วย DevPanel (+180k ทีละคลิกไต่ร่าง 1→10): sprite ถูกร่าง, ฉากเปลี่ยนถูกกลุ่ม (5 ฉาก), crossfade นุ่ม, ป้ายชื่อร่างถูก
- [ ] mood ทุกแบบบนร่างสุ่ม 3 ร่าง (บังคับอารมณ์จาก DevPanel): ท่าเปลี่ยนถูก
- [ ] commit

### Task 7: Verify + Deploy + ส่งงาน
- [ ] `npx vitest run` ผ่านหมด · `npm run build` เขียว · `npx tsc --noEmit` เงียบ
- [ ] push → `gh run watch` เขียว → เทสเว็บจริง (ไต่ร่าง 1→10 บน production ด้วย DevPanel + รีเฟรชกลางทางเช็ค persist)
- [ ] Self-review: ไล่เช็ก edge — localStorage เก่า **ไม่ต้อง migrate** (GameState เก็บ points ไม่ได้เก็บชื่อร่าง — ร่างคำนวณใหม่จากแต้มเสมอ แค่ยืนยันว่าโหลด state เดิมแล้วจอขึ้นร่างถูกตามแต้ม) · จอเปิดข้ามคืน · ไฟล์ " 2" จาก iCloud
- [ ] ส่ง Codex รีวิวโค้ดรอบสุดท้าย (บรีฟ: "รีวิว diff ล่าสุดใน app/src เฉพาะระบบ 10 ร่าง หา edge case/บั๊ก ตอบเป็นลิสต์") → แก้ตาม findings ที่เป็นบั๊กจริง
- [ ] อัปเดต `TASK.md` + memory `fantastic-beasts-project.md` (10 ร่าง + ฉากกลุ่ม)
- [ ] LINE สรุป: ลิงก์เกม + สิ่งที่ทำ + สิ่งที่อนุมัติแทน (ถ้ามี) + จุดให้เจ้านายเทส

---

## E. ลำดับการรันที่แนะนำ (สลับงานให้ไม่มีคอขวด)

```
ส่งบรีฟรอบ 1 ให้ Codex ──รอ──▶ ตรวจ+แปลง ─▶ ส่งรอบ 2 ─▶ … ─▶ รอบ 8
        │ (ระหว่างรอแต่ละรอบ)
        └─▶ ทำ Task 1 → 2 → 3 → 4 → 5 (โค้ด+placeholder เสร็จได้ก่อนภาพครบ)
ภาพครบทุกรอบ ─▶ Task 6 ─▶ Task 7
```
- Codex 1 รอบ ≈ 8-15 นาที → ตั้ง watcher ทุกรอบ ห้ามนั่งรอเฉย
- ถ้า Codex คิวยาว/ค้าง >30 นาที: screencap ดูสถานะ ถ้า error ให้ส่งบรีฟซ้ำใน task ใหม่ (Cmd+N)
- **ข้อควรระวังที่เคยเจอ:** composer หลุดโฟกัสหลังงานจบ → ใช้ Cmd+N เสมอ · ไทยใน keystroke เพี้ยน → ใช้ pbcopy+key code 9 เท่านั้น · iCloud สร้าง "ไฟล์ 2" → ลบทิ้ง · `pkill -f vite` ห้ามใช้ (โดน vitest)

## F. เกณฑ์ "งานคอมพลีท"
1. เว็บจริงไต่ครบ 10 ร่าง ฉากเปลี่ยนถูก 5 ฉาก + intro ฉากเฉพาะ ✅
2. ตั้งชื่อเด้งที่ร่าง 3 พร้อมรูปน้องตัวใหญ่ ✅
3. เทสทั้งหมดผ่าน + build เขียว + Codex review ไม่มีบั๊กจริงค้าง ✅
4. TASK.md/memory อัปเดต + LINE สรุปแล้ว ✅
