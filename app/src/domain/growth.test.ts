import { describe, expect, it } from "vitest";
import { nextStageInfo, pointsFor, progressRatio, stageFor } from "./growth";

const GOAL = 1_800_000;

describe("stageFor — 10 ร่างตาม % ของเป้า", () => {
  // ตาราง (stage, atRatio) — เช็กก่อนถึง (ยังร่างก่อน) + ถึงพอดี (เลื่อนร่าง)
  const cases: Array<[number, string]> = [
    [0, "egg"],
    [0.0499, "egg"],
    [0.05, "cracking"],
    [0.1199, "cracking"],
    [0.12, "peeking"],
    [0.1999, "peeking"],
    [0.2, "newborn"],
    [0.2999, "newborn"],
    [0.3, "baby"],
    [0.4199, "baby"],
    [0.42, "child"],
    [0.5499, "child"],
    [0.55, "junior"],
    [0.6799, "junior"],
    [0.68, "teen"],
    [0.8299, "teen"],
    [0.83, "grown"],
    [0.9999, "grown"],
    [1.0, "adult"],
  ];
  it.each(cases)("ratio %f → %s", (ratio, stage) => {
    expect(stageFor(GOAL * ratio, GOAL)).toBe(stage);
  });
  it("เกินเป้ายังเต็มวัย", () => {
    expect(stageFor(GOAL * 2, GOAL)).toBe("adult");
  });
  it("กันข้อมูลพัง: แต้มติดลบ = ไข่ · เป้า 0/ติดลบ = เต็มวัยทันที (กันหารศูนย์)", () => {
    expect(stageFor(-500, GOAL)).toBe("egg");
    expect(stageFor(0, 0)).toBe("adult");
  });
});

describe("nextStageInfo — ร่างถัดไป + แต้มที่ขาด", () => {
  it("ที่ไข่ (0) → ร่างถัดไป cracking ที่ 5%", () => {
    const n = nextStageInfo(0, GOAL);
    expect(n?.stage).toBe("cracking");
    expect(n?.pointsNeeded).toBe(Math.ceil(GOAL * 0.05));
  });
  it("ระหว่าง teen → ถัดไป grown", () => {
    expect(nextStageInfo(GOAL * 0.7, GOAL)?.stage).toBe("grown");
  });
  it("เต็มวัยแล้ว = null", () => {
    expect(nextStageInfo(GOAL, GOAL)).toBeNull();
  });
});

describe("pointsFor — แต้มโตจากยอดขาย", () => {
  it("อารมณ์ปกติ = ยอดตรงๆ", () => {
    expect(pointsFor(2000, "calm", false)).toBe(2000);
  });
  it("ดีใจสุดๆ ×1.5 · ร่าเริง ×1.2", () => {
    expect(pointsFor(2000, "thrilled", false)).toBe(3000);
    expect(pointsFor(2000, "happy", false)).toBe(2400);
  });
  it("เหงา ×0.8 · เศร้า ×0.7", () => {
    expect(pointsFor(2000, "lonely", false)).toBe(1600);
    expect(pointsFor(2000, "sad", false)).toBe(1400);
  });
  it("ข้ามเดือน ×0.75 ซ้อนกับอารมณ์", () => {
    expect(pointsFor(2000, "calm", true)).toBe(1500);
    expect(pointsFor(2000, "thrilled", true)).toBe(2250);
  });
  it("กันข้อมูลพัง: ยอดติดลบ/ศูนย์ = 0 แต้ม", () => {
    expect(pointsFor(-999, "calm", false)).toBe(0);
    expect(pointsFor(0, "happy", false)).toBe(0);
  });
});

describe("progressRatio — สัดส่วนหลอดโต", () => {
  it("ครึ่งทาง = 0.5, เกินเป้า capped ที่ 1", () => {
    expect(progressRatio(GOAL / 2, GOAL)).toBe(0.5);
    expect(progressRatio(GOAL * 3, GOAL)).toBe(1);
  });
  it("กันพัง: เป้า 0 = 1 (เต็ม)", () => {
    expect(progressRatio(100, 0)).toBe(1);
  });
});
