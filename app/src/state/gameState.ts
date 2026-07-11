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
  /**
   * ยอดที่นับแต้มไปแล้ว (saleId → {amount, points}) — สำหรับยอดจริงจาก Supabase:
   * กันนับซ้ำตอน reconnect + รองรับยอดถูกแก้/ลบใน CRM (ปรับ/หักแต้มตามจริง)
   */
  counted: Record<string, { amount: number; points: number }>;
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
    counted: {},
  };
}

/** ยอดขายเข้า — คิดแต้มตามอารมณ์ขณะนั้น บันทึก event + สะสมยอดรายวัน + จำว่านับแล้ว */
export function feedSale(state: GameState, sale: SaleEvent, moodAtSale: Mood): GameState {
  if (sale.amount <= 0) return state; // ยอดสกปรก ไม่รับ
  if (state.counted[sale.id]) return state; // นับไปแล้ว (reconnect/event ซ้ำ) — เมิน
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
  const counted = { ...state.counted, [sale.id]: { amount: sale.amount, points: gained } };
  return { ...state, points: state.points + gained, events, dailyTotals, counted };
}

/**
 * ยอดใน CRM ถูก "แก้จำนวนเงิน" หลังนับแต้มไปแล้ว → ปรับแต้มตามสัดส่วน
 * (คงตัวคูณอารมณ์เดิม ณ ตอนขาย: newPoints = oldPoints × newAmount/oldAmount)
 */
export function applySaleUpdate(state: GameState, saleId: string, newAmount: number, at: number): GameState {
  const rec = state.counted[saleId];
  if (!rec) return state; // ไม่เคยนับ (เข้าตอนปิดเลี้ยง) — ไม่เกี่ยวกับเรา
  if (newAmount <= 0) return applySaleDelete(state, saleId, at); // แก้เหลือ 0 = เท่ากับลบ
  if (newAmount === rec.amount) return state;
  const newPoints = rec.points * (newAmount / rec.amount);
  const dayKey = dateKey(at);
  const dailyTotals = {
    ...state.dailyTotals,
    [dayKey]: Math.max(0, (state.dailyTotals[dayKey] ?? 0) + (newAmount - rec.amount)),
  };
  return {
    ...state,
    points: Math.max(0, state.points - rec.points + newPoints),
    dailyTotals,
    counted: { ...state.counted, [saleId]: { amount: newAmount, points: newPoints } },
  };
}

/** ยอดใน CRM ถูก "ลบ" หลังนับแต้มไปแล้ว → หักแต้มคืนเท่าที่เคยให้ */
export function applySaleDelete(state: GameState, saleId: string, at: number): GameState {
  const rec = state.counted[saleId];
  if (!rec) return state;
  const dayKey = dateKey(at);
  const counted = { ...state.counted };
  delete counted[saleId];
  return {
    ...state,
    points: Math.max(0, state.points - rec.points),
    dailyTotals: {
      ...state.dailyTotals,
      [dayKey]: Math.max(0, (state.dailyTotals[dayKey] ?? 0) - rec.amount),
    },
    counted,
    events: state.events.filter((e) => e.id !== saleId),
  };
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
  const counted: Record<string, { amount: number; points: number }> = {};
  if (r.counted && typeof r.counted === "object") {
    for (const [k, v] of Object.entries(r.counted as Record<string, unknown>)) {
      if (v && typeof v === "object") {
        const c = v as Record<string, unknown>;
        if (typeof c.amount === "number" && Number.isFinite(c.amount) && typeof c.points === "number" && Number.isFinite(c.points)) {
          counted[k] = { amount: c.amount, points: c.points };
        }
      }
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
    counted,
  };
}
