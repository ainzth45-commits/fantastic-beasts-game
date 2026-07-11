// สถานะเกม + pure actions (แพทเทิร์นเดียวกับเกมที่1: reducer เทสได้ ไม่มี side effect)

import { pointsFor, stageFor } from "../domain/growth";
import type { BeastTier, Mood, SaleEvent, Stage } from "../domain/types";
import { DEFAULT_GOALS, STAGE_THRESHOLDS } from "../domain/types";

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
  /**
   * ยอดรวมรายวัน (key = YYYY-MM-DD) — แหล่งความจริงของ "ยอดวันนี้"
   * แยกจาก events เพราะ events ถูกตัดเหลือ MAX_EVENTS (วันยอดเยอะจะ undercount)
   */
  dailyTotals: Record<string, number>;
}

/** เก็บยอดรายวันย้อนหลังกี่วัน (กัน localStorage บวม) */
export const DAILY_KEEP_DAYS = 40;

export function dateKey(ms: number): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
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
    dailyTotals: {},
  };
}

/** ยอดขายเข้า — คิดแต้มตามอารมณ์ขณะนั้น บันทึก event + สะสมยอดรายวัน */
export function feedSale(state: GameState, sale: SaleEvent, moodAtSale: Mood): GameState {
  if (sale.amount <= 0) return state; // ยอดสกปรก ไม่รับ
  const gained = pointsFor(sale.amount, moodAtSale, state.carryOver);
  const events = [...state.events, sale].slice(-MAX_EVENTS);
  const key = dateKey(sale.at);
  const dailyTotals: Record<string, number> = {
    ...state.dailyTotals,
    [key]: (state.dailyTotals[key] ?? 0) + sale.amount,
  };
  // ตัดวันเก่าทิ้ง กัน storage โตไม่หยุด
  const keys = Object.keys(dailyTotals).sort();
  for (const old of keys.slice(0, Math.max(0, keys.length - DAILY_KEEP_DAYS))) {
    delete dailyTotals[old];
  }
  return { ...state, points: state.points + gained, events, dailyTotals };
}

/** ยอดวันนี้ (จาก aggregate ไม่ใช่ event log ที่ถูก cap) */
export function todayTotal(state: GameState, nowMs: number): number {
  return state.dailyTotals[dateKey(nowMs)] ?? 0;
}

export function setBeastName(state: GameState, name: string): GameState {
  const trimmed = name.trim().slice(0, 20); // กันชื่อยาวทะลุจอ
  if (trimmed === "") return state;
  return { ...state, beastName: trimmed };
}

export function currentStage(state: GameState): Stage {
  return stageFor(state.points, state.goalPoints);
}

// ลำดับร่างตามการโต (จาก STAGE_THRESHOLDS)
const STAGE_ORDER = STAGE_THRESHOLDS.map((t) => t.stage);

/**
 * ฟักพอให้ตั้งชื่อแล้วหรือยัง — ใช้เปิด overlay ตั้งชื่อ
 * เกณฑ์เจ้านาย: เริ่มตั้งชื่อได้ตอน "โผล่พ้นไข่" (peeking) ครึ่งท่อนบนโผล่มา
 */
export function isHatched(state: GameState): boolean {
  return STAGE_ORDER.indexOf(currentStage(state)) >= STAGE_ORDER.indexOf("peeking");
}

export function resetGame(state: GameState): GameState {
  return initialState(state.tier);
}

/**
 * ซ่อมข้อมูลจาก localStorage — storage เก่า/เพี้ยน/โดนมือแก้ ต้องไม่ทำจอพัง
 * ฟิลด์ไหนผิด shape → ใช้ค่า default ของ initialState แทน
 */
export function sanitizeGameState(raw: unknown): GameState {
  const base = initialState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;

  const tier: BeastTier = r.tier === "easy" || r.tier === "medium" || r.tier === "hard" ? r.tier : base.tier;
  const events: SaleEvent[] = Array.isArray(r.events)
    ? (r.events as unknown[])
        .filter((e): e is SaleEvent => {
          if (!e || typeof e !== "object") return false;
          const s = e as Record<string, unknown>;
          return typeof s.id === "string" && typeof s.amount === "number" && typeof s.at === "number";
        })
        .slice(-MAX_EVENTS)
    : [];
  const dailyTotals: Record<string, number> = {};
  if (r.dailyTotals && typeof r.dailyTotals === "object") {
    for (const [k, v] of Object.entries(r.dailyTotals as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v) && v >= 0) dailyTotals[k] = v;
    }
  }

  return {
    tier,
    beastName: typeof r.beastName === "string" && r.beastName.trim() !== "" ? r.beastName.slice(0, 20) : null,
    points: typeof r.points === "number" && Number.isFinite(r.points) && r.points >= 0 ? r.points : 0,
    goalPoints:
      typeof r.goalPoints === "number" && Number.isFinite(r.goalPoints) && r.goalPoints > 0
        ? r.goalPoints
        : DEFAULT_GOALS[tier],
    carryOver: r.carryOver === true,
    events,
    dailyTotals,
  };
}
