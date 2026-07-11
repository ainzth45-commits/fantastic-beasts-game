// สถานะเกม + pure actions (แพทเทิร์นเดียวกับเกมที่1: reducer เทสได้ ไม่มี side effect)

import { pointsFor, stageFor } from "../domain/growth";
import type { BeastTier, Mood, SaleEvent, Stage } from "../domain/types";
import { DEFAULT_GOALS } from "../domain/types";

export interface GameState {
  tier: BeastTier;
  /** ชื่อน้อง — null = ยังไม่ตั้ง (ตั้งได้ตอนฟักออกจากไข่) */
  beastName: string | null;
  /** แต้มโตสะสม */
  points: number;
  /** เป้าแต้มของตัวปัจจุบัน */
  goalPoints: number;
  /** เลี้ยงข้ามเดือนอยู่ไหม (โตช้าลง ×0.75) */
  carryOver: boolean;
  /** event ยอดขายล่าสุด (จำกัดจำนวน กันเมมบวม — จอเปิดทั้งวัน) */
  events: SaleEvent[];
}

/** เก็บ event ล่าสุดพอสำหรับ mood window (2 ชม.) + ticker — เกินตัดทิ้ง */
export const MAX_EVENTS = 200;

export function initialState(tier: BeastTier = "easy"): GameState {
  return {
    tier,
    beastName: null,
    points: 0,
    goalPoints: DEFAULT_GOALS[tier],
    carryOver: false,
    events: [],
  };
}

/** ยอดขายเข้า — คิดแต้มตามอารมณ์ขณะนั้น แล้วบันทึก event */
export function feedSale(state: GameState, sale: SaleEvent, moodAtSale: Mood): GameState {
  if (sale.amount <= 0) return state; // ยอดสกปรก ไม่รับ
  const gained = pointsFor(sale.amount, moodAtSale, state.carryOver);
  const events = [...state.events, sale].slice(-MAX_EVENTS);
  return { ...state, points: state.points + gained, events };
}

export function setBeastName(state: GameState, name: string): GameState {
  const trimmed = name.trim().slice(0, 20); // กันชื่อยาวทะลุจอ
  if (trimmed === "") return state;
  return { ...state, beastName: trimmed };
}

export function currentStage(state: GameState): Stage {
  return stageFor(state.points, state.goalPoints);
}

/** ฟักแล้วหรือยัง — ใช้เปิด overlay ตั้งชื่อ */
export function isHatched(state: GameState): boolean {
  return currentStage(state) !== "egg";
}

export function resetGame(state: GameState): GameState {
  return initialState(state.tier);
}
