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

  it("ร่างที่ยังไม่มีภาพ ถอยลงหาร่างที่มี (จอไม่พังระหว่างศิลป์ทยอยมา)", () => {
    // junior ยังไม่มี → ถอยไป child
    expect(beastSprite("junior", "calm", false)).toContain("child-idle");
    // teen/grown/adult → ถอยลงมาจน child
    expect(beastSprite("teen", "happy", false)).toContain("child-happy");
    expect(beastSprite("adult", "sad", false)).toContain("child-sad");
    // newborn/baby ยังไม่มี → ถอยไปตระกูล peeking
    expect(beastSprite("newborn", "happy", false)).toContain("peeking-happy");
    expect(beastSprite("baby", "calm", false)).toContain("peeking-idle");
  });

  it("peeking มีครบทุกท่า", () => {
    expect(beastSprite("peeking", "calm", false)).toContain("peeking-idle");
    expect(beastSprite("peeking", "calm", true)).toContain("peeking-blink");
    expect(beastSprite("peeking", "happy", false)).toContain("peeking-happy");
    expect(beastSprite("peeking", "sad", false)).toContain("peeking-sad");
    expect(beastSprite("peeking", "sleep", false)).toContain("peeking-sleep");
  });

});
