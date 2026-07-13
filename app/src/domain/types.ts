// ชนิดข้อมูลแกนกลางของ Fantastic Beasts

/** ระดับความยากของสัตว์ — เลี้ยงครั้งละตัว เริ่มจาก easy */
export type BeastTier = "easy" | "medium" | "hard";

/** ขั้นการโต 10 ร่าง (ไข่ → โตเต็มวัย) */
export type Stage =
  | "egg"
  | "cracking"
  | "peeking"
  | "newborn"
  | "baby"
  | "child"
  | "junior"
  | "teen"
  | "grown"
  | "adult";

/** อารมณ์ — มีผลต่อตัวคูณแต้มโต และท่าทางบนจอ */
export type Mood = "thrilled" | "happy" | "calm" | "lonely" | "sad" | "sleep";

/** เหตุการณ์ยอดขาย 1 รายการ (จาก CRM หรือ mock) */
export interface SaleEvent {
  id: string;
  amount: number; // บาท
  at: number; // epoch ms
  employeeName?: string;
  employeePhotoUrl?: string;
}

/** config การโตของสัตว์ 1 ระดับ */
export interface GrowthConfig {
  /** เป้าแต้มโตรวมถึงเต็มวัย */
  goalPoints: number;
  /** ตัวคูณเมื่อเลี้ยงข้ามเดือน (โตช้าลง) */
  carryOverMultiplier: number;
}

/** ตัวคูณอารมณ์ → แต้มโต */
export const MOOD_MULTIPLIER: Record<Mood, number> = {
  thrilled: 1.5,
  happy: 1.2,
  calm: 1.0,
  lonely: 0.8,
  sad: 0.7,
  sleep: 1.0, // นอกเวลางานปกติไม่มียอดอยู่แล้ว — ถ้ามี (ยอดดึก) ให้เต็มค่า ไม่ลงโทษ
};

/** เกณฑ์ % ของเป้า → ร่าง (10 ร่าง เรียงจากน้อยไปมาก) */
export const STAGE_THRESHOLDS: Array<{ stage: Stage; atRatio: number }> = [
  { stage: "egg", atRatio: 0 },
  { stage: "cracking", atRatio: 0.05 },
  { stage: "peeking", atRatio: 0.12 },
  { stage: "newborn", atRatio: 0.2 },
  { stage: "baby", atRatio: 0.3 },
  { stage: "child", atRatio: 0.42 },
  { stage: "junior", atRatio: 0.55 },
  { stage: "teen", atRatio: 0.68 },
  { stage: "grown", atRatio: 0.83 },
  { stage: "adult", atRatio: 1.0 },
];

/**
 * เป้า default ต่อระดับ (บาทแต้มโต) — เจ้านายเคาะ 2026-07-13:
 * ลดจากชุดแรก (1.8/2.4/3.0) · ยาก = ยอดสูงสุดที่ทีมเคยทำได้ (มิ.ย. 2026 ≈ 2.59M ปัดเป็น 2.6M)
 */
export const DEFAULT_GOALS: Record<BeastTier, number> = {
  easy: 1_500_000,
  medium: 2_000_000,
  hard: 2_600_000,
};
