import { describe, expect, it } from "vitest";
import type { SaleEvent } from "../domain/types";
import { MAX_EVENTS, currentStage, feedSale, initialState, isHatched, resetGame, setBeastName } from "./gameState";

function sale(amount: number, at = 1_000_000): SaleEvent {
  return { id: `s${Math.abs(amount)}-${at}`, amount, at };
}

describe("gameState actions", () => {
  it("เริ่มต้น: ไข่ easy เป้า 1.8 ล้าน ยังไม่ตั้งชื่อ", () => {
    const s = initialState();
    expect(s.goalPoints).toBe(1_800_000);
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

  it("ป้อนถึง 10% → ฟัก (isHatched)", () => {
    let s = initialState();
    s = feedSale(s, sale(180_000), "calm");
    expect(currentStage(s)).toBe("hatching");
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
