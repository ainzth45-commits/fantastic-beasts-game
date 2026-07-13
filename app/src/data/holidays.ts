// วันหยุดบริษัทจาก table `holidays` (RLS เปิดให้ anon อ่าน) — ใช้ตัดสิน "น้องหลับ" นอกวันทำงาน
// โหลดครั้งเดียวตอนเปิดจอ · โหลดไม่ได้ = ใช้ [] (เกมเดินต่อ แค่ไม่รู้วันหยุด — ห้ามจอพัง)

import { getClient } from "./salesFeed";

/** แปลง rows จาก Supabase → YYYY-MM-DD ที่ valid จริง (เดือน 01-12, วัน 01-31) เรียง+dedupe */
export function rowsToHolidays(rows: unknown): string[] {
  if (!Array.isArray(rows)) return [];
  const out = new Set<string>();
  for (const r of rows) {
    if (!r || typeof r !== "object") continue;
    const d = (r as Record<string, unknown>).d;
    if (typeof d === "string" && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(d)) out.add(d);
  }
  return [...out].sort();
}

/** ดึงวันหยุดทั้งหมด — พังเมื่อไหร่คืน [] เงียบๆ (log ไว้ดูใน console พอ) */
export async function fetchHolidays(): Promise<string[]> {
  try {
    const { data, error } = await getClient().from("holidays").select("d");
    if (error) throw error;
    return rowsToHolidays(data);
  } catch (e) {
    console.warn("โหลดวันหยุดไม่ได้ — ใช้ลิสต์ว่างไปก่อน", e);
    return [];
  }
}
