// เลือกไฟล์ฉากหลังตาม "สายพันธุ์ + กลุ่มร่าง" (feedback เจ้านาย 2026-07-13: แต่ละสายพันธุ์ต้องมีฉากของตัวเอง)
// ฉากต่อสายพันธุ์ทยอยมาจาก Codex — ยังไม่มีไฟล์ให้ fallback ฉากกลางชุดเดิม (bg-{scene}.webp) จอไม่พัง

import type { BeastTier, Stage } from "../domain/types";

/** กลุ่มฉากตามช่วงวัย — ร่างในกลุ่มเดียวกันใช้ฉากเดียวกัน (5 กลุ่ม) */
export type BgScene = "egg" | "nursery" | "child" | "valley" | "adult";

export const STAGE_SCENE: Record<Stage, BgScene> = {
  egg: "egg",
  cracking: "egg",
  peeking: "nursery",
  newborn: "nursery",
  baby: "nursery",
  child: "child",
  junior: "child",
  teen: "valley",
  grown: "valley",
  adult: "adult",
};

/**
 * ฉากต่อสายพันธุ์ที่ "มีไฟล์จริงบนดิสก์แล้ว" (bg-{tier}-{scene}.webp) — เติมทีละรอบเมื่อ Codex gen มา
 * แพทเทิร์นเดียวกับ AVAILABLE ของ sprite (เทส map-to-disk คุมไม่ให้พิมพ์ชื่อมั่ว)
 */
export const BG_AVAILABLE: Record<BeastTier, ReadonlySet<BgScene>> = {
  easy: new Set(["egg", "nursery", "child", "valley", "adult"]),
  medium: new Set([]),
  hard: new Set([]),
};

/** path ฉากหลัง (ตัดสินจากไฟล์ที่มีจริง) — ยังไม่มีของสายพันธุ์นั้นใช้ฉากกลางชุดเดิม */
export function stageBgUrl(tier: BeastTier, stage: Stage): string {
  const scene = STAGE_SCENE[stage];
  const name = BG_AVAILABLE[tier].has(scene) ? `bg-${tier}-${scene}` : `bg-${scene}`;
  return `${import.meta.env.BASE_URL}assets/${name}.webp`;
}
