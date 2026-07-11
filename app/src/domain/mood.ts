// mood engine — pure function ล้วน: อารมณ์สัตว์จากสถานการณ์ยอดขายจริง
// ลำดับความสำคัญ: sleep > thrilled > happy > sad > lonely > calm

import type { Mood, SaleEvent } from "./types";

export interface MoodConfig {
  /** ชั่วโมงเริ่ม/จบเวลางาน (0-23) */
  workStartHour: number;
  workEndHour: number;
  /** วันหยุด (YYYY-MM-DD, โซนเวลาเครื่อง) — เฟส 2 sync จาก table holidays */
  holidays: string[];
  /** วันประจำสัปดาห์ที่หยุด (0=อาทิตย์..6=เสาร์) */
  weekendDays: number[];
  /** ดีลใหญ่ ≥ บาท → thrilled */
  bigDealAmount: number;
  /** thrilled ค้างกี่นาทีหลังดีลใหญ่ */
  thrilledHoldMinutes: number;
  /** ร่าเริงเมื่อ ≥ N รายการใน windowMinutes */
  happyCount: number;
  happyWindowMinutes: number;
  /** เหงาเมื่อเงียบเกินกี่นาที (ในเวลางาน) */
  lonelyAfterMinutes: number;
  /** เช็กเศร้าหลังกี่โมง + เกณฑ์ยอดวัน < ratio ของเฉลี่ยรายวัน */
  sadCheckHour: number;
  sadBelowRatio: number;
  /** ค่าเฉลี่ยยอดรายวันของทีม (บาท) — เฟส 2 คำนวณจากข้อมูลจริง */
  dailyAverageAmount: number;
}

export const DEFAULT_MOOD_CONFIG: MoodConfig = {
  workStartHour: 9,
  workEndHour: 20,
  holidays: [],
  weekendDays: [0], // อาทิตย์
  bigDealAmount: 5000,
  thrilledHoldMinutes: 15,
  happyCount: 3,
  happyWindowMinutes: 60,
  lonelyAfterMinutes: 120,
  sadCheckHour: 14,
  sadBelowRatio: 0.5,
  dailyAverageAmount: 100_000, // ~2.2 ล้าน/เดือน ÷ ~22 วันทำงาน
};

function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function isWorkTime(now: Date, cfg: MoodConfig): boolean {
  if (cfg.weekendDays.includes(now.getDay())) return false;
  if (cfg.holidays.includes(dateKey(now))) return false;
  const h = now.getHours();
  return h >= cfg.workStartHour && h < cfg.workEndHour;
}

/** กรอง event ที่เชื่อถือได้: ยอดบวก + ไม่อยู่ในอนาคต + เป็นวันเดียวกับ now */
function cleanEvents(events: SaleEvent[], nowMs: number): SaleEvent[] {
  return events.filter((e) => e.amount > 0 && e.at <= nowMs);
}

function sameDay(ms: number, now: Date): boolean {
  return dateKey(new Date(ms)) === dateKey(now);
}

export interface MoodOptions {
  /** เปิดเลี้ยงอยู่ = น้องตื่นเสมอ (วันหยุดมีคนมาทำงานกด "เลี้ยงต่อ" ก็เลี้ยงได้) */
  ignoreSleep?: boolean;
  /**
   * ยอดรวมวันนี้จาก aggregate (dailyTotals) — ถ้าไม่ส่งมา จะคำนวณจาก events
   * ซึ่งอาจ undercount เพราะ events ถูก cap ที่ MAX_EVENTS
   */
  todayTotal?: number;
}

export function moodFor(events: SaleEvent[], now: Date, cfg: MoodConfig, opts: MoodOptions = {}): Mood {
  // 1) นอกเวลางาน/วันหยุด = หลับ ชนะทุกอย่าง — เว้นแต่เปิดเลี้ยงอยู่ (ignoreSleep)
  if (!opts.ignoreSleep && !isWorkTime(now, cfg)) return "sleep";

  const nowMs = now.getTime();
  const valid = cleanEvents(events, nowMs);
  const minuteMs = 60_000;

  // 2) thrilled — ดีลใหญ่ภายในช่วงค้างสถานะ
  const thrilledSince = nowMs - cfg.thrilledHoldMinutes * minuteMs;
  if (valid.some((e) => e.amount >= cfg.bigDealAmount && e.at > thrilledSince)) return "thrilled";

  // 3) happy — ยอดถี่ใน window
  const happySince = nowMs - cfg.happyWindowMinutes * minuteMs;
  if (valid.filter((e) => e.at > happySince).length >= cfg.happyCount) return "happy";

  // 4) sad — หลังเวลาเช็ก ยอดวันนี้ต่ำกว่าเกณฑ์ (ใช้ aggregate ถ้ามี — event log ถูก cap)
  if (now.getHours() >= cfg.sadCheckHour) {
    const todayTotal =
      opts.todayTotal ?? valid.filter((e) => sameDay(e.at, now)).reduce((sum, e) => sum + e.amount, 0);
    if (todayTotal < cfg.dailyAverageAmount * cfg.sadBelowRatio) return "sad";
  }

  // 5) lonely — เงียบนานเกินเกณฑ์ (นับจากยอดล่าสุดวันนี้ หรือเวลาเริ่มงานถ้ายังไม่มียอด)
  const workStart = new Date(now);
  workStart.setHours(cfg.workStartHour, 0, 0, 0);
  const todayEvents = valid.filter((e) => sameDay(e.at, now));
  const lastActivity = todayEvents.length > 0 ? Math.max(...todayEvents.map((e) => e.at)) : workStart.getTime();
  if (nowMs - lastActivity > cfg.lonelyAfterMinutes * minuteMs) return "lonely";

  return "calm";
}
