// ชนิดข้อมูลแกนกลางของ Fantastic Beasts

/** ระดับความยากของสัตว์ — เลี้ยงครั้งละตัว เริ่มจาก easy */
export type BeastTier = "easy" | "medium" | "hard";

/** ขั้นการโต 5 ขั้น */
export type Stage = "egg" | "hatching" | "child" | "teen" | "adult";

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

/** เกณฑ์ % ของเป้า → ขั้นโต */
export const STAGE_THRESHOLDS: Array<{ stage: Stage; atRatio: number }> = [
  { stage: "egg", atRatio: 0 },
  { stage: "hatching", atRatio: 0.1 },
  { stage: "child", atRatio: 0.3 },
  { stage: "teen", atRatio: 0.6 },
  { stage: "adult", atRatio: 1.0 },
];

/** เป้า default ต่อระดับ (บาทแต้มโต) — ปรับได้ */
export const DEFAULT_GOALS: Record<BeastTier, number> = {
  easy: 1_800_000,
  medium: 2_400_000,
  hard: 3_000_000,
};
