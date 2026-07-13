import { describe, expect, it } from "vitest";
import type { SaleEvent } from "../domain/types";
import {
  MAX_EVENTS,
  applySaleDelete,
  applySaleUpdate,
  currentStage,
  dateKey,
  feedSale,
  initialState,
  isHatched,
  resetGame,
  sanitizeGameState,
  setBeastName,
  todayTotal,
} from "./gameState";

function sale(amount: number, at = 1_000_000): SaleEvent {
  return { id: `s${Math.abs(amount)}-${at}`, amount, at };
}

describe("gameState actions", () => {
  it("เริ่มต้น: ไข่ easy เป้า 1.5 ล้าน ยังไม่ตั้งชื่อ", () => {
    const s = initialState();
    expect(s.goalPoints).toBe(1_500_000);
    expect(currentStage(s)).toBe("egg");
    expect(isHatched(s)).toBe(false);
    expect(s.beastName).toBeNull();
  });

  it("feedSale คิดแต้มตามอารมณ์ + เก็บ event", () => {
    let s = initialState();
    s = feedSale(s, sale(2000), "happy");
    expect(s.points).toBe(2400);
    expect(s.events).toHaveLength(1);
  });

  it("ยอดสกปรก (≤0) ไม่รับ ไม่แตะ state", () => {
    const s0 = initialState();
    expect(feedSale(s0, sale(0), "calm")).toBe(s0);
    expect(feedSale(s0, sale(-100), "calm")).toBe(s0);
  });

  it("ตั้งชื่อได้ตอนโผล่พ้นไข่ (peeking 12%) ไม่ใช่ก่อนหน้า", () => {
    let s = initialState();
    // 5% = ไข่เริ่มแตก (cracking) — ยังตั้งชื่อไม่ได้
    s = feedSale(s, sale(1_500_000 * 0.06), "calm");
    expect(currentStage(s)).toBe("cracking");
    expect(isHatched(s)).toBe(false);
    // 12% = โผล่พ้นไข่ (peeking) — ตั้งชื่อได้
    s = feedSale(s, sale(1_500_000 * 0.07), "calm");
    expect(currentStage(s)).toBe("peeking");
    expect(isHatched(s)).toBe(true);
  });

  it("event เกิน MAX_EVENTS ถูกตัดหัวทิ้ง (จอเปิดทั้งวัน กันเมมบวม)", () => {
    let s = initialState();
    for (let i = 0; i < MAX_EVENTS + 50; i += 1) {
      s = feedSale(s, { id: `e${i}`, amount: 100, at: i }, "calm");
    }
    expect(s.events).toHaveLength(MAX_EVENTS);
    expect(s.events[0].id).toBe("e50");
  });

  it("ตั้งชื่อ: trim + จำกัด 20 ตัว + ห้ามค่าว่าง", () => {
    let s = initialState();
    s = setBeastName(s, "  น้องมูมู่  ");
    expect(s.beastName).toBe("น้องมูมู่");
    expect(setBeastName(s, "   ").beastName).toBe("น้องมูมู่"); // ค่าว่างไม่ทับ
    expect(setBeastName(s, "ก".repeat(50)).beastName).toHaveLength(20);
  });

  it("carryOver ลดแต้ม ×0.75", () => {
    let s = { ...initialState(), carryOver: true };
    s = feedSale(s, sale(2000), "calm");
    expect(s.points).toBe(1500);
  });

  it("dailyTotals สะสมยอดต่อวัน — ไม่โดน MAX_EVENTS cap (Codex finding #3)", () => {
    let s = initialState();
    const day = new Date(2026, 6, 14, 10).getTime();
    for (let i = 0; i < MAX_EVENTS + 100; i += 1) {
      s = feedSale(s, { id: `e${i}`, amount: 100, at: day + i }, "calm");
    }
    // event log โดน cap แต่ยอดวันครบทุกบาท
    expect(s.events).toHaveLength(MAX_EVENTS);
    expect(todayTotal(s, day)).toBe((MAX_EVENTS + 100) * 100);
  });

  it("todayTotal คนละวัน = 0 (ข้ามเที่ยงคืนรีเซ็ตเอง — Codex finding #2)", () => {
    let s = initialState();
    const monday = new Date(2026, 6, 13, 15).getTime();
    s = feedSale(s, { id: "m1", amount: 5000, at: monday }, "calm");
    const tuesday = new Date(2026, 6, 14, 9).getTime();
    expect(todayTotal(s, monday)).toBe(5000);
    expect(todayTotal(s, tuesday)).toBe(0);
    expect(dateKey(monday)).not.toBe(dateKey(tuesday));
  });

  it("resetGame ล้างกลับไข่ tier เดิม", () => {
    let s = initialState("medium");
    s = feedSale(s, sale(500_000), "calm");
    s = setBeastName(s, "มังกรจ๋า");
    const r = resetGame(s);
    expect(r.points).toBe(0);
    expect(r.tier).toBe("medium");
    expect(r.beastName).toBeNull();
  });
});

describe("ยอดจริงจาก CRM — dedupe/แก้/ลบ (เฟส 3)", () => {
  const at = new Date(2026, 6, 14, 10).getTime();

  it("event id ซ้ำ (reconnect) ไม่นับซ้ำ", () => {
    let s = initialState();
    s = feedSale(s, { id: "s1", amount: 2000, at }, "calm");
    const after = feedSale(s, { id: "s1", amount: 2000, at }, "calm");
    expect(after).toBe(s); // ไม่เปลี่ยน state เลย
    expect(after.points).toBe(2000);
  });

  it("ยอดถูกแก้จำนวน → ปรับแต้มตามสัดส่วน (คงตัวคูณอารมณ์เดิม)", () => {
    let s = initialState();
    s = feedSale(s, { id: "s1", amount: 2000, at }, "happy"); // 2400 แต้ม
    s = applySaleUpdate(s, "s1", 1000, at); // ครึ่งนึง → 1200 แต้ม
    expect(s.points).toBe(1200);
    expect(todayTotal(s, at)).toBe(1000);
    expect(s.counted["s1"]).toEqual({ amount: 1000, points: 1200 });
  });

  it("ยอดถูกลบ → หักแต้มคืน + ลบจาก ticker + ยอดวันลด", () => {
    let s = initialState();
    s = feedSale(s, { id: "s1", amount: 2000, at }, "calm");
    s = feedSale(s, { id: "s2", amount: 3000, at }, "calm");
    s = applySaleDelete(s, "s1", at);
    expect(s.points).toBe(3000);
    expect(todayTotal(s, at)).toBe(3000);
    expect(s.counted["s1"]).toBeUndefined();
    expect(s.events.map((e) => e.id)).toEqual(["s2"]);
  });

  it("แก้/ลบยอดที่ไม่เคยนับ (เข้าตอนปิดเลี้ยง) → ไม่กระทบ", () => {
    let s = initialState();
    s = feedSale(s, { id: "s1", amount: 2000, at }, "calm");
    expect(applySaleUpdate(s, "unknown", 500, at)).toBe(s);
    expect(applySaleDelete(s, "unknown", at)).toBe(s);
  });

  it("แก้เหลือ 0 = ลบ", () => {
    let s = initialState();
    s = feedSale(s, { id: "s1", amount: 2000, at }, "calm");
    s = applySaleUpdate(s, "s1", 0, at);
    expect(s.points).toBe(0);
    expect(s.counted["s1"]).toBeUndefined();
  });
});

describe("sanitizeGameState — ซ่อม localStorage เพี้ยน (Codex finding #5)", () => {
  it("ข้อมูลขยะ/null/string → state เริ่มต้น ไม่พัง", () => {
    expect(sanitizeGameState(null)).toEqual(initialState());
    expect(sanitizeGameState("garbage")).toEqual(initialState());
    expect(sanitizeGameState(42)).toEqual(initialState());
  });

  it("events ไม่ใช่ array / มี item เพี้ยน → กรองทิ้ง", () => {
    const s = sanitizeGameState({ tier: "easy", points: 100, events: "oops" });
    expect(s.events).toEqual([]);
    const s2 = sanitizeGameState({
      events: [{ id: "ok", amount: 500, at: 123 }, { id: 1, amount: "x" }, null],
    });
    expect(s2.events).toHaveLength(1);
    expect(s2.events[0].id).toBe("ok");
  });

  it("ค่าตัวเลขเพี้ยน (ติดลบ/NaN/goal 0) → default", () => {
    const s = sanitizeGameState({ points: -50, goalPoints: 0, tier: "hard" });
    expect(s.points).toBe(0);
    expect(s.goalPoints).toBeGreaterThan(0);
    expect(s.tier).toBe("hard");
  });

  it("state ดีอยู่แล้ว → คงค่าเดิม (รวม dailyTotals)", () => {
    let s = initialState("medium");
    s = feedSale(s, { id: "a", amount: 999, at: Date.now() }, "calm");
    s = setBeastName(s, "น้องฟู");
    const restored = sanitizeGameState(JSON.parse(JSON.stringify(s)));
    expect(restored).toEqual(s);
  });

  it("dailyTotals ค่าเพี้ยน (ติดลบ/ไม่ใช่ number) → ตัดทิ้ง", () => {
    const s = sanitizeGameState({ dailyTotals: { "2026-07-11": 500, "2026-07-10": -9, "2026-07-09": "x" } });
    expect(s.dailyTotals).toEqual({ "2026-07-11": 500 });
  });
});
