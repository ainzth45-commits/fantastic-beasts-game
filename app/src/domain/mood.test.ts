import { describe, expect, it } from "vitest";
import type { SaleEvent } from "./types";
import { DEFAULT_MOOD_CONFIG, moodFor } from "./mood";

// เวลาอ้างอิง: อังคาร 2026-07-14 เวลาต่างๆ (โซนเวลาเครื่อง)
function at(hour: number, minute = 0): Date {
  return new Date(2026, 6, 14, hour, minute, 0, 0); // เดือน 6 = กรกฎาคม
}

let seq = 0;
function sale(amount: number, when: Date): SaleEvent {
  seq += 1;
  return { id: `s${seq}`, amount, at: when.getTime() };
}

const cfg = DEFAULT_MOOD_CONFIG;

describe("moodFor — sleep (นอกเวลางาน/วันหยุด)", () => {
  it("ก่อนเวลางาน/หลังเวลางาน = หลับ", () => {
    expect(moodFor([], at(6), cfg)).toBe("sleep");
    expect(moodFor([], at(21), cfg)).toBe("sleep");
  });
  it("วันหยุด (จาก config.holidays) = หลับ ทั้งวัน", () => {
    const holidayCfg = { ...cfg, holidays: ["2026-07-14"] };
    expect(moodFor([], at(10), holidayCfg)).toBe("sleep");
  });
  it("sleep ชนะทุกอารมณ์ แม้เพิ่งมีดีลใหญ่", () => {
    const events = [sale(9000, at(20, 50))];
    expect(moodFor(events, at(21), cfg)).toBe("sleep");
  });

  it("ignoreSleep (เปิดเลี้ยงอยู่): น้องตื่นแม้นอกเวลางาน/วันหยุด — วันหยุดคนมาทำงานเลี้ยงได้", () => {
    const events = [sale(9000, at(20, 50))];
    expect(moodFor(events, at(21), cfg, { ignoreSleep: true })).toBe("thrilled");
    const holidayCfg = { ...cfg, holidays: ["2026-07-14"] };
    expect(moodFor([], at(10), holidayCfg, { ignoreSleep: true })).toBe("calm");
  });
});

describe("moodFor — thrilled (ดีลใหญ่)", () => {
  it("ดีลเดียว ≥ threshold ภายใน 15 นาที = ดีใจสุดๆ", () => {
    const events = [sale(5000, at(10, 0))];
    expect(moodFor(events, at(10, 10), cfg)).toBe("thrilled");
  });
  it("พ้น 15 นาทีแล้ว ไม่ thrilled อีก", () => {
    const events = [sale(5000, at(10, 0))];
    expect(moodFor(events, at(10, 16), cfg)).not.toBe("thrilled");
  });
  it("ดีลต่ำกว่า threshold ไม่ thrilled", () => {
    const events = [sale(4999, at(10, 0))];
    expect(moodFor(events, at(10, 5), cfg)).not.toBe("thrilled");
  });
});

describe("moodFor — happy (ยอดถี่)", () => {
  it("≥3 รายการใน 60 นาที = ร่าเริง", () => {
    const events = [sale(500, at(10, 0)), sale(700, at(10, 20)), sale(900, at(10, 40))];
    expect(moodFor(events, at(10, 50), cfg)).toBe("happy");
  });
  it("2 รายการ ไม่พอ", () => {
    const events = [sale(500, at(10, 0)), sale(700, at(10, 40))];
    expect(moodFor(events, at(10, 50), cfg)).toBe("calm");
  });
  it("thrilled ชนะ happy", () => {
    const events = [sale(500, at(10, 0)), sale(700, at(10, 20)), sale(6000, at(10, 40))];
    expect(moodFor(events, at(10, 45), cfg)).toBe("thrilled");
  });
});

describe("moodFor — lonely (เงียบเหงานาน)", () => {
  it("ไม่มียอดเกิน 2 ชม. ในเวลางาน = เหงา", () => {
    const events = [sale(1000, at(9, 0))];
    expect(moodFor(events, at(11, 30), cfg)).toBe("lonely");
  });
  it("ยังไม่ถึง 2 ชม. = ปกติ", () => {
    const events = [sale(1000, at(9, 30))];
    expect(moodFor(events, at(11, 0), cfg)).toBe("calm");
  });
  it("เปิดวันมายังไม่มียอดเลย นับจากเวลาเริ่มงาน", () => {
    // เริ่มงาน 09:00 · 11:30 ผ่านมา 2.5 ชม. ไม่มียอด = เหงา
    expect(moodFor([], at(11, 30), cfg)).toBe("lonely");
    // 10:00 เพิ่งผ่าน 1 ชม. = ยังปกติ
    expect(moodFor([], at(10, 0), cfg)).toBe("calm");
  });
});

describe("moodFor — sad (ยอดวันแย่)", () => {
  it("หลังเวลาเช็ก (14:00) ยอดวันนี้ < 50% ของเฉลี่ยรายวัน = เศร้า", () => {
    const events = [sale(10_000, at(13, 0))]; // เฉลี่ยรายวัน default 100k → 10k = 10%
    expect(moodFor(events, at(14, 30), cfg)).toBe("sad");
  });
  it("ก่อน 14:00 ยังไม่ตัดสิน = ไม่เศร้า", () => {
    const events = [sale(10_000, at(9, 0))];
    const mood = moodFor(events, at(13, 0), cfg);
    expect(mood).not.toBe("sad");
  });
  it("ยอดวันถึงครึ่งของเฉลี่ย = ไม่เศร้า", () => {
    const events = [sale(60_000, at(13, 0))];
    expect(moodFor(events, at(14, 30), cfg)).toBe("calm");
  });
  it("sad ชนะ lonely (เศร้าเรื่องใหญ่กว่าเหงา)", () => {
    const events = [sale(1000, at(11, 0))]; // ยอดน้อย + เงียบนาน
    expect(moodFor(events, at(15, 0), cfg)).toBe("sad");
  });
});

describe("moodFor — กันข้อมูลสกปรก", () => {
  it("event ในอนาคต/ยอดติดลบ ถูกมองข้าม", () => {
    const events = [sale(-500, at(10, 0)), sale(9999, at(18, 0))]; // อนาคต (now=10:30)
    expect(moodFor(events, at(10, 30), cfg)).toBe("calm");
  });
});
