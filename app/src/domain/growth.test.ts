import { describe, expect, it } from "vitest";
import { pointsFor, progressRatio, stageFor } from "./growth";

const GOAL = 1_800_000;

describe("stageFor — ขั้นโตตาม % ของเป้า", () => {
  it("เริ่มที่ไข่", () => {
    expect(stageFor(0, GOAL)).toBe("egg");
    expect(stageFor(GOAL * 0.0999, GOAL)).toBe("egg");
  });
  it("10% → ฟัก", () => {
    expect(stageFor(GOAL * 0.1, GOAL)).toBe("hatching");
    expect(stageFor(GOAL * 0.2999, GOAL)).toBe("hatching");
  });
  it("30% → เด็ก", () => {
    expect(stageFor(GOAL * 0.3, GOAL)).toBe("child");
    expect(stageFor(GOAL * 0.5999, GOAL)).toBe("child");
  });
  it("60% → วัยรุ่น", () => {
    expect(stageFor(GOAL * 0.6, GOAL)).toBe("teen");
    expect(stageFor(GOAL * 0.9999, GOAL)).toBe("teen");
  });
  it("100% → เต็มวัย (เกินเป้าก็ยังเต็มวัย)", () => {
    expect(stageFor(GOAL, GOAL)).toBe("adult");
    expect(stageFor(GOAL * 2, GOAL)).toBe("adult");
  });
  it("กันข้อมูลพัง: แต้มติดลบ = ไข่ · เป้า 0/ติดลบ = เต็มวัยทันที (กันหารศูนย์)", () => {
    expect(stageFor(-500, GOAL)).toBe("egg");
    expect(stageFor(0, 0)).toBe("adult");
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
