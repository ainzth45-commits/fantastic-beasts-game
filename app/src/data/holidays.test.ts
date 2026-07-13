// เทสแปลง rows วันหยุดจาก Supabase → string[] YYYY-MM-DD (กันข้อมูลสกปรกทุก shape)

import { describe, expect, it } from "vitest";
import { rowsToHolidays } from "./holidays";

describe("rowsToHolidays — แปลง+กรองวันหยุดจาก table holidays", () => {
  it("รับ rows ปกติ → คืนเฉพาะ d ที่ format ถูก เรียงวันที่", () => {
    const rows = [
      { d: "2026-12-05", name: "วันพ่อ" },
      { d: "2026-08-12", name: "วันแม่" },
    ];
    expect(rowsToHolidays(rows)).toEqual(["2026-08-12", "2026-12-05"]);
  });

  it("ข้อมูลสกปรกถูกทิ้ง: d หาย/format ผิด/เดือน-วันปลอม/ชนิดผิด", () => {
    const rows = [
      { d: "2026-08-12" },
      { d: "12/08/2026" }, // format ผิด
      { d: "2026-13-01" }, // เดือนปลอม
      { d: "2026-08-32" }, // วันปลอม
      { d: 20260812 }, // ชนิดผิด
      { name: "ไม่มี d" },
      null,
      "ขยะ",
    ];
    expect(rowsToHolidays(rows)).toEqual(["2026-08-12"]);
  });

  it("วันซ้ำถูก dedupe · input ไม่ใช่ array → []", () => {
    expect(rowsToHolidays([{ d: "2026-08-12" }, { d: "2026-08-12" }])).toEqual(["2026-08-12"]);
    expect(rowsToHolidays(null)).toEqual([]);
    expect(rowsToHolidays({ d: "2026-08-12" })).toEqual([]);
  });
});
