// เทสวงจรรอบเกม (เฟส 4A): startedCycle · carryOver ข้ามเดือน · finishCycle · หอเกียรติยศ

import { describe, expect, it } from "vitest";
import type { SaleEvent } from "../domain/types";
import {
  feedSale,
  feedSaleSynced,
  finishCycle,
  initialState,
  isComplete,
  monthKey,
  resetGame,
  sanitizeGameState,
  setBeastName,
  syncCarryOver,
  type GameState,
} from "./gameState";

const JUL_10 = new Date("2026-07-10T10:00:00").getTime();
const AUG_03 = new Date("2026-08-03T10:00:00").getTime();

function sale(amount: number, at: number, id = `s-${at}-${amount}`): SaleEvent {
  return { id, amount, at };
}

/** ป้อนจน adult (calm ×1.0 — แต้ม = บาทตรงๆ) */
function fullyGrown(): GameState {
  let s = initialState("easy");
  s = feedSale(s, sale(s.goalPoints, JUL_10), "calm");
  return s;
}

describe("วงจรรอบเกม", () => {
  it("ยอดแรกตั้ง startedCycle เป็นเดือนของยอดนั้น — ยอดถัดไปไม่ทับ", () => {
    let s = initialState("easy");
    expect(s.startedCycle).toBeNull();
    s = feedSale(s, sale(1000, JUL_10), "calm");
    expect(s.startedCycle).toBe("2026-07");
    s = feedSale(s, sale(1000, AUG_03, "s2"), "calm");
    expect(s.startedCycle).toBe("2026-07"); // ยังตัวเดิม ไม่รีเซ็ต
  });

  it("syncCarryOver: ข้ามเดือน + ยังไม่เต็มวัย → true · เดือนเดิม → false · idempotent", () => {
    let s = feedSale(initialState("easy"), sale(1000, JUL_10), "calm");
    expect(syncCarryOver(s, JUL_10).carryOver).toBe(false);
    s = syncCarryOver(s, AUG_03);
    expect(s.carryOver).toBe(true);
    expect(syncCarryOver(s, AUG_03)).toBe(s); // ไม่มีอะไรเปลี่ยน → object เดิม (กัน re-render ฟรี)
  });

  it("syncCarryOver: โตเต็มวัยแล้ว ไม่นับ carryOver (รอฉลอง ไม่ใช่โตช้า)", () => {
    const s = fullyGrown();
    expect(isComplete(s)).toBe(true);
    expect(syncCarryOver(s, AUG_03).carryOver).toBe(false);
  });

  it("carryOver มีผลจริง: แต้มยอดเดือนถัดไปโดนคูณ 0.75", () => {
    let s = feedSale(initialState("easy"), sale(1000, JUL_10), "calm");
    s = syncCarryOver(s, AUG_03);
    s = feedSale(s, sale(1000, AUG_03, "s2"), "calm");
    expect(s.points).toBe(1000 + 750);
  });

  it("finishCycle: บันทึกหอเกียรติยศ + เริ่ม tier ถัดไป (easy→medium) แต้ม/ชื่อรีเซ็ต", () => {
    let s = setBeastName(fullyGrown(), "ปุยฝ้าย");
    s = finishCycle(s, AUG_03);
    expect(s.history).toEqual([{ tier: "easy", name: "ปุยฝ้าย", finishedAt: AUG_03 }]);
    expect(s.tier).toBe("medium");
    expect(s.points).toBe(0);
    expect(s.beastName).toBeNull();
    expect(s.startedCycle).toBeNull();
    expect(s.goalPoints).toBe(2_400_000);
  });

  it("finishCycle: ยังไม่เต็มวัย → ไม่ทำอะไร (กันกดพลาด)", () => {
    const s = feedSale(initialState("easy"), sale(1000, JUL_10), "calm");
    expect(finishCycle(s, JUL_10)).toBe(s);
  });

  it("finishCycle: hard จบ → วนกลับ easy (ตามที่ auto-approve ไว้)", () => {
    let s: GameState = { ...fullyGrown(), tier: "hard" };
    s = finishCycle(s, AUG_03);
    expect(s.tier).toBe("easy");
  });

  it("resetGame ไม่ล้างหอเกียรติยศ", () => {
    let s = finishCycle(setBeastName(fullyGrown(), "ปุยฝ้าย"), AUG_03);
    s = resetGame(s);
    expect(s.history).toHaveLength(1);
  });

  it("sanitize: startedCycle/history รอด round-trip · ค่าเพี้ยนถูกทิ้ง", () => {
    const good = finishCycle(setBeastName(fullyGrown(), "ปุยฝ้าย"), AUG_03);
    const revived = sanitizeGameState(JSON.parse(JSON.stringify(good)));
    expect(revived.history).toEqual(good.history);
    const bad = sanitizeGameState({
      startedCycle: "13/2026",
      history: [{ tier: "boss", name: 5 }, { tier: "easy", name: "โอเค", finishedAt: 1 }, "ขยะ"],
    });
    expect(bad.startedCycle).toBeNull();
    expect(bad.history).toEqual([{ tier: "easy", name: "โอเค", finishedAt: 1 }]);
  });

  it("monthKey format ถูก", () => {
    expect(monthKey(JUL_10)).toBe("2026-07");
  });

  // จาก review #2 (HIGH): ยอดแรกหลังข้ามเดือนต้องโดน ×0.75 ทันที ไม่รอ timer 30 วิของ store
  it("feedSaleSynced: ยอดเดือนใหม่ sync ธงจากเวลาของยอดเองก่อนคิดแต้ม → โดน 0.75 ทันที", () => {
    let s = feedSale(initialState("easy"), sale(1000, JUL_10), "calm");
    expect(s.carryOver).toBe(false); // ยังไม่มีใคร sync — จำลองยอดเข้าก่อน timer tick
    s = feedSaleSynced(s, sale(1000, AUG_03, "s2"), "calm");
    expect(s.carryOver).toBe(true);
    expect(s.points).toBe(1000 + 750);
  });

  // จาก review #2 (HIGH): นาฬิกาเครื่องย้อนกลับเดือนเดิม ห้ามพลิกธงกลับ (กติกา "ข้ามเดือนแล้วโตช้า" คงอยู่จนจบรอบ)
  it("syncCarryOver: monotonic — เปิดแล้วนาฬิกาย้อนกลับก็ไม่ปิด", () => {
    let s = feedSale(initialState("easy"), sale(1000, JUL_10), "calm");
    s = syncCarryOver(s, AUG_03);
    expect(s.carryOver).toBe(true);
    expect(syncCarryOver(s, JUL_10).carryOver).toBe(true);
    // ยอดที่ timestamp เก่ากว่า (แก้ยอดย้อนหลัง) ก็ยังโดน 0.75 — ธงไม่เด้งกลับ
    const after = feedSaleSynced(s, sale(1000, JUL_10, "s3"), "calm");
    expect(after.points).toBe(1000 + 750);
  });

  // จาก review #2 (MEDIUM): startedCycle shape ถูกแต่เดือนเป็นไปไม่ได้ ต้องถูกทิ้ง
  it("sanitize: เดือนนอกช่วง 01-12 ถูกทิ้ง · เดือนจริงรอด", () => {
    expect(sanitizeGameState({ startedCycle: "2026-00" }).startedCycle).toBeNull();
    expect(sanitizeGameState({ startedCycle: "2026-13" }).startedCycle).toBeNull();
    expect(sanitizeGameState({ startedCycle: "2026-99" }).startedCycle).toBeNull();
    expect(sanitizeGameState({ startedCycle: "2026-12" }).startedCycle).toBe("2026-12");
    expect(sanitizeGameState({ startedCycle: "2026-01" }).startedCycle).toBe("2026-01");
  });
});
