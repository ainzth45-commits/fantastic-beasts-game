// config รอบเกม — รางวัล + ลำดับตัวถัดไป (เฟส 4A)
// 🔶DECIDE: ข้อความรางวัลจริง 3 ระดับรอเจ้านายกำหนด — ตอนนี้ใช้ placeholder ไปก่อน (auto-approve, log ใน TASK.md)

import type { BeastTier } from "../domain/types";

/** ข้อความรางวัลเมื่อเลี้ยงจนโตเต็มวัย (โชว์ในฉากฉลอง) */
export const REWARDS: Record<BeastTier, string> = {
  easy: "รางวัลพิเศษจากหัวหน้า 🎁",
  medium: "รางวัลพิเศษจากหัวหน้า 🎁🎁",
  hard: "รางวัลใหญ่สุดจากหัวหน้า 🏆",
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
