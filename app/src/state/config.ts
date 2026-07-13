// config รอบเกม — รางวัล + ลำดับตัวถัดไป (เฟส 4A)
// เจ้านายเคาะ 2026-07-13: รางวัลเป็นความลับ ไม่บอกในจอ — หัวหน้าเฉลยปากเปล่าตอนฉลอง

import type { BeastTier } from "../domain/types";

/** ข้อความรางวัลเมื่อเลี้ยงจนโตเต็มวัย (โชว์ในฉากฉลอง) — จงใจไม่เฉลยของจริง ให้ทีมลุ้น */
export const REWARDS: Record<BeastTier, string> = {
  easy: "มีรางวัลลับจากหัวหน้า 🎁 รอเฉลย!",
  medium: "รางวัลลับใหญ่กว่าเดิม 🎁🎁 รอเฉลย!",
  hard: "รางวัลลับระดับตำนาน 🏆✨ รอเฉลย!",
};

/**
 * ลำดับตัวถัดไป — ล็อกตามกติกา "เลี้ยงทีละตัวเริ่มจากง่าย": easy→medium→hard
 * ครบ 3 ตัวแล้ววนกลับ easy (🔶DECIDE จบซีซัน/วนใหม่ — default วนใหม่ เปลี่ยนทีหลังได้)
 */
export const NEXT_TIER: Record<BeastTier, BeastTier> = {
  easy: "medium",
  medium: "hard",
  hard: "easy",
};

/** ชื่อสายพันธุ์ต่อระดับ — ใช้ในฉากฉลอง/แนะนำตัวถัดไป */
export const TIER_LABEL: Record<BeastTier, { species: string; emoji: string }> = {
  easy: { species: "แกะยูนิคอร์น", emoji: "🐑" },
  medium: { species: "จิ้งจอกเมฆ", emoji: "🦊" },
  hard: { species: "มังกรชมพู", emoji: "🐉" },
};
