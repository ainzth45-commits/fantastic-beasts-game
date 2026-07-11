import { describe, expect, it } from "vitest";
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

  it("ไข่: ท่าที่ไม่มี (เศร้า/หลับ) fallback ไป idle ของไข่", () => {
    expect(beastSprite("egg", "calm", false)).toContain("egg-idle");
    expect(beastSprite("egg", "happy", false)).toContain("egg-happy");
    expect(beastSprite("egg", "sad", false)).toContain("egg-idle");
    expect(beastSprite("egg", "sleep", false)).toContain("egg-idle");
  });

  it("teen/adult ยังไม่มีภาพ → ถอยไปใช้ child (จอไม่พัง)", () => {
    expect(beastSprite("teen", "calm", false)).toContain("child-idle");
    expect(beastSprite("adult", "happy", false)).toContain("child-happy");
  });

  it("hatching มีแค่ idle — ทุกท่าใช้ idle", () => {
    expect(beastSprite("hatching", "happy", false)).toContain("hatching-idle");
  });
});
