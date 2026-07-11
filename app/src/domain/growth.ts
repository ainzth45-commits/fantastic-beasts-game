// growth engine — pure functions ล้วน เทสได้ deterministic

import type { Mood, Stage } from "./types";
import { MOOD_MULTIPLIER, STAGE_THRESHOLDS } from "./types";

/** ตัวคูณเมื่อเลี้ยงข้ามเดือน (โตช้าลงตามกติกา) */
export const CARRY_OVER_MULTIPLIER = 0.75;

/** ขั้นโตปัจจุบันจากแต้มสะสมเทียบเป้า — กันหารศูนย์/ข้อมูลติดลบ */
export function stageFor(points: number, goalPoints: number): Stage {
  if (goalPoints <= 0) return "adult"; // เป้าพัง = ถือว่าจบเลย ไม่ให้จอค้างที่ไข่
  const ratio = Math.max(0, points) / goalPoints;
  let current: Stage = "egg";
  for (const { stage, atRatio } of STAGE_THRESHOLDS) {
    if (ratio >= atRatio) current = stage;
  }
  return current;
}

/** แต้มโตจากยอดขาย 1 รายการ — ยอดผิดปกติ (≤0) ไม่ให้แต้ม */
export function pointsFor(amount: number, mood: Mood, carryOver: boolean): number {
  if (amount <= 0) return 0;
  const moodMul = MOOD_MULTIPLIER[mood];
  const carryMul = carryOver ? CARRY_OVER_MULTIPLIER : 1;
  return amount * moodMul * carryMul;
}

/** สัดส่วนหลอดโต 0..1 (เกินเป้า cap ที่ 1) */
export function progressRatio(points: number, goalPoints: number): number {
  if (goalPoints <= 0) return 1;
  return Math.min(1, Math.max(0, points) / goalPoints);
}

/** ขั้นถัดไป + แต้มที่ยังขาด — ไว้โชว์ "อีก x บาทถึงขั้น y" (null = เต็มวัยแล้ว) */
export function nextStageInfo(points: number, goalPoints: number): { stage: Stage; pointsNeeded: number } | null {
  if (goalPoints <= 0) return null;
  const ratio = Math.max(0, points) / goalPoints;
  for (const { stage, atRatio } of STAGE_THRESHOLDS) {
    if (atRatio > 0 && ratio < atRatio) {
      return { stage, pointsNeeded: Math.ceil(atRatio * goalPoints - Math.max(0, points)) };
    }
  }
  return null;
}
