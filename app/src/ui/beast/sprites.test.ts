import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Mood, Stage } from "../../domain/types";
import { beastSprite } from "./sprites";

const STAGES: Stage[] = ["egg", "cracking", "peeking", "newborn", "baby", "child", "junior", "teen", "grown", "adult"];
const MOODS: Mood[] = ["thrilled", "happy", "calm", "lonely", "sad", "sleep"];
const ASSETS = join(__dirname, "../../../public/assets");

describe("beastSprite — เลือกภาพตามสายพันธุ์+ขั้น+ท่า พร้อม fallback", () => {
  it("easy (แกะยูนิคอร์น) ครบทุกร่างทุกท่า — ชี้ไฟล์ตรงร่าง", () => {
    expect(beastSprite("easy", "child", "calm", false)).toContain("beast-easy/child-idle");
    expect(beastSprite("easy", "child", "calm", true)).toContain("child-blink");
    expect(beastSprite("easy", "junior", "happy", false)).toContain("junior-happy");
    expect(beastSprite("easy", "teen", "sad", false)).toContain("teen-sad");
    expect(beastSprite("easy", "grown", "sleep", false)).toContain("grown-sleep");
    expect(beastSprite("easy", "adult", "thrilled", false)).toContain("adult-happy");
  });

  it("ไข่ easy: ท่าที่ไม่มี (เศร้า) fallback ไป idle ของร่างเดิม", () => {
    expect(beastSprite("easy", "egg", "sad", false)).toContain("egg-idle");
    expect(beastSprite("easy", "cracking", "sad", false)).toContain("cracking-idle");
  });

  it("medium (จิ้งจอกเมฆ): ใช้โฟลเดอร์ beast-medium — ร่างที่ยังไม่มีศิลป์ถอยลงหาไข่จิ้งจอก (ไม่ข้ามสายพันธุ์)", () => {
    expect(beastSprite("medium", "egg", "calm", false)).toContain("beast-medium/egg-idle");
    expect(beastSprite("medium", "cracking", "happy", false)).toContain("beast-medium/cracking-happy");
    // adult จิ้งจอกยังไม่มี → ถอยลงหาร่างล่าสุดที่มีของจิ้งจอกเอง ไม่ข้ามไปแกะ
    // (ไม่ล็อกชื่อร่าง — ศิลป์ทยอยมาทุกรอบ ล็อกแค่ว่าต้องอยู่โฟลเดอร์จิ้งจอก)
    expect(beastSprite("medium", "adult", "calm", false)).toContain("beast-medium/");
  });

  it("hard (มังกร) ยังไม่มีศิลป์เลย → placeholder ไข่แกะ กันจอพัง", () => {
    expect(beastSprite("hard", "egg", "calm", false)).toContain("beast-easy/egg-idle");
    expect(beastSprite("hard", "adult", "happy", false)).toContain("beast-easy/egg-idle");
  });

  // กัน AVAILABLE พิมพ์ชื่อผิด/ไฟล์หาย: ทุกสายพันธุ์×ร่าง×อารมณ์ ต้อง resolve ไปไฟล์ .webp ที่มีจริงบนดิสก์
  // (เช็คแค่ string ไม่พอ — ชื่อผิดเทสผ่านแต่รูปแตกใน production · จาก Codex review)
  it("ทุกสายพันธุ์×ร่าง×อารมณ์ ชี้ไฟล์ .webp ที่มีจริงบนดิสก์", () => {
    for (const tier of ["easy", "medium", "hard"] as const) {
      for (const stage of STAGES) {
        for (const mood of MOODS) {
          for (const blinking of [false, true]) {
            const url = beastSprite(tier, stage, mood, blinking);
            const rel = url.replace(/^.*assets\//, "");
            expect(existsSync(join(ASSETS, rel)), `${tier}/${stage}/${mood}${blinking ? "/blink" : ""} → ${rel}`).toBe(true);
          }
        }
      }
    }
  });
});
