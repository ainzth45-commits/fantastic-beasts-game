import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Mood, Stage } from "../../domain/types";
import { beastSprite } from "./sprites";

describe("beastSprite — เลือกภาพตามขั้น+ท่า พร้อม fallback", () => {
  it("child idle/blink/happy/sad/sleep มีภาพตรงท่า", () => {
    expect(beastSprite("child", "calm", false)).toContain("child-idle");
    expect(beastSprite("child", "calm", true)).toContain("child-blink");
    expect(beastSprite("child", "happy", false)).toContain("child-happy");
    expect(beastSprite("child", "thrilled", false)).toContain("child-happy");
    expect(beastSprite("child", "sad", false)).toContain("child-sad");
    expect(beastSprite("child", "lonely", false)).toContain("child-sad");
    expect(beastSprite("child", "sleep", false)).toContain("child-sleep");
  });

  it("ไข่: idle/happy/sleep มีจริง · เศร้า(ไม่มี) fallback ไป idle", () => {
    expect(beastSprite("egg", "calm", false)).toContain("egg-idle");
    expect(beastSprite("egg", "happy", false)).toContain("egg-happy");
    expect(beastSprite("egg", "sleep", false)).toContain("egg-sleep");
    expect(beastSprite("egg", "sad", false)).toContain("egg-idle");
  });

  it("cracking: idle/happy/sleep มีจริง · เศร้า(ไม่มี) fallback ไป cracking-idle", () => {
    expect(beastSprite("cracking", "calm", false)).toContain("cracking-idle");
    expect(beastSprite("cracking", "happy", false)).toContain("cracking-happy");
    expect(beastSprite("cracking", "sleep", false)).toContain("cracking-sleep");
    expect(beastSprite("cracking", "sad", false)).toContain("cracking-idle");
  });

  it("junior มีครบทุกท่า", () => {
    expect(beastSprite("junior", "calm", false)).toContain("junior-idle");
    expect(beastSprite("junior", "calm", true)).toContain("junior-blink");
    expect(beastSprite("junior", "happy", false)).toContain("junior-happy");
    expect(beastSprite("junior", "sad", false)).toContain("junior-sad");
    expect(beastSprite("junior", "sleep", false)).toContain("junior-sleep");
  });

  it("teen มีครบทุกท่า", () => {
    expect(beastSprite("teen", "calm", false)).toContain("teen-idle");
    expect(beastSprite("teen", "calm", true)).toContain("teen-blink");
    expect(beastSprite("teen", "happy", false)).toContain("teen-happy");
    expect(beastSprite("teen", "sad", false)).toContain("teen-sad");
    expect(beastSprite("teen", "sleep", false)).toContain("teen-sleep");
  });

  it("grown/adult มีครบทุกท่า (ศิลป์ครบ 10 ร่างแล้ว)", () => {
    expect(beastSprite("grown", "calm", false)).toContain("grown-idle");
    expect(beastSprite("grown", "happy", false)).toContain("grown-happy");
    expect(beastSprite("grown", "sleep", false)).toContain("grown-sleep");
    expect(beastSprite("adult", "calm", true)).toContain("adult-blink");
    expect(beastSprite("adult", "sad", false)).toContain("adult-sad");
    expect(beastSprite("adult", "thrilled", false)).toContain("adult-happy");
  });

  // กัน AVAILABLE พิมพ์ชื่อผิด/ไฟล์หาย: ทุกร่าง×ทุกอารมณ์ ต้อง resolve ไปไฟล์ .webp ที่มีจริงบนดิสก์
  // (เทสเดิมเช็คแค่ string — ชื่อผิดเทสผ่านแต่รูปแตกใน production · จาก Codex review)
  it("ทุกร่าง×ทุกอารมณ์ ชี้ไฟล์ .webp ที่มีจริงบนดิสก์", () => {
    const stages: Stage[] = ["egg", "cracking", "peeking", "newborn", "baby", "child", "junior", "teen", "grown", "adult"];
    const moods: Mood[] = ["thrilled", "happy", "calm", "lonely", "sad", "sleep"];
    const assetsDir = join(__dirname, "../../../public/assets/beast-easy");
    for (const stage of stages) {
      for (const mood of moods) {
        for (const blinking of [false, true]) {
          const url = beastSprite(stage, mood, blinking);
          const file = url.split("/").pop()!;
          expect(existsSync(join(assetsDir, file)), `${stage}/${mood}${blinking ? "/blink" : ""} → ${file}`).toBe(true);
        }
      }
    }
  });

  it("peeking มีครบทุกท่า", () => {
    expect(beastSprite("peeking", "calm", false)).toContain("peeking-idle");
    expect(beastSprite("peeking", "calm", true)).toContain("peeking-blink");
    expect(beastSprite("peeking", "happy", false)).toContain("peeking-happy");
    expect(beastSprite("peeking", "sad", false)).toContain("peeking-sad");
    expect(beastSprite("peeking", "sleep", false)).toContain("peeking-sleep");
  });

});
