// ฟีดยอดขายจริงจาก Supabase (เฟส 3)
// - เชื่อมเฉพาะช่วง "เปิดเลี้ยง" (กติกาเจ้านาย: ยอดตอนปิดเลี้ยงไม่นับ ไม่มี catch-up)
// - โหลดพนักงานทีมที่กำหนดครั้งเดียวตอน connect → ใช้กรอง event + ใส่ชื่อ/รูปบนป้าย
// - INSERT → นับยอด · UPDATE/DELETE → ปรับ/หักแต้ม (เฉพาะยอดที่เคยนับ — ledger อยู่ใน gameState)
// - publishable key ฝังได้ (ออกแบบมาให้ public · pattern เดียวกับ dashboard ทีมที่ใช้อยู่)

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import type { SaleEvent } from "../domain/types";

const SUPABASE_URL = "https://swbxecjguiohpwllvues.supabase.co";
const SUPABASE_KEY = "sb_publishable_oim8cwqX7j-8PTLLtRqftg_EORk-EYE";

/** ทีมที่เกมนับยอด — หนามแดง-BETA-01 (เปลี่ยนทีมได้ที่นี่จุดเดียว) */
export const GAME_TEAM_ID = 1;

interface Employee {
  name: string;
  photoUrl: string | null;
}

interface SaleRow {
  id: number | string;
  employee_id?: string | null;
  amount?: number | string | null;
  created_at?: string | null;
}

export interface FeedCallbacks {
  onSale: (sale: SaleEvent) => void;
  onSaleUpdated: (saleId: string, newAmount: number, at: number) => void;
  onSaleDeleted: (saleId: string, at: number) => void;
  /** สถานะการเชื่อมต่อ — ไว้โชว์ badge บนจอ */
  onStatus: (connected: boolean) => void;
}

let client: SupabaseClient | null = null;
/** client เดียวใช้ร่วมทุก data module (salesFeed + holidays) */
export function getClient(): SupabaseClient {
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}

/** แปลง row จาก realtime → SaleEvent (กันข้อมูลสกปรกทุก field) */
export function rowToSale(row: SaleRow, team: Map<string, Employee>): SaleEvent | null {
  const empId = typeof row.employee_id === "string" ? row.employee_id : null;
  if (!empId || !team.has(empId)) return null; // ไม่ใช่ทีมเรา — เมิน
  const amount = Number(row.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const at = row.created_at ? Date.parse(row.created_at) : NaN;
  const emp = team.get(empId)!;
  return {
    id: `crm-${row.id}`,
    amount,
    at: Number.isFinite(at) ? at : Date.now(),
    employeeName: emp.name,
    employeePhotoUrl: emp.photoUrl ?? undefined,
  };
}

export interface SalesFeed {
  stop: () => void;
}

/** เริ่มฟีด: โหลดทีม → subscribe INSERT/UPDATE/DELETE ของ sales · คืน handle สำหรับหยุด */
export async function startSalesFeed(cb: FeedCallbacks): Promise<SalesFeed> {
  const sb = getClient();

  // 1) โหลดสมาชิกทีม (ครั้งเดียวต่อการเปิดเลี้ยง — คนใหม่เข้าทีมกลางวัน กด "พัก→เลี้ยงต่อ" ก็รีเฟรช)
  const { data: emps, error } = await sb
    .from("employees")
    .select("employee_id,name,photo_url,active")
    .eq("team_id", GAME_TEAM_ID);
  if (error) throw new Error(`โหลดรายชื่อทีมไม่ได้: ${error.message}`);
  const team = new Map<string, Employee>();
  for (const e of emps ?? []) {
    if (e.active !== false && typeof e.employee_id === "string") {
      team.set(e.employee_id, { name: String(e.name ?? "ทีม"), photoUrl: e.photo_url ?? null });
    }
  }

  // 2) subscribe การเปลี่ยนแปลงของ sales
  const channel: RealtimeChannel = sb
    .channel("fb-sales-feed")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "sales" }, (payload) => {
      const sale = rowToSale(payload.new as SaleRow, team);
      if (sale) cb.onSale(sale);
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sales" }, (payload) => {
      const row = payload.new as SaleRow;
      const amount = Number(row.amount);
      if (row.id != null && Number.isFinite(amount)) {
        cb.onSaleUpdated(`crm-${row.id}`, amount, Date.now());
      }
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "sales" }, (payload) => {
      const row = payload.old as SaleRow;
      if (row?.id != null) cb.onSaleDeleted(`crm-${row.id}`, Date.now());
    })
    .subscribe((status) => {
      // SUBSCRIBED = ต่อได้ · CHANNEL_ERROR/TIMED_OUT = หลุด (supabase-js จะ retry เอง)
      cb.onStatus(status === "SUBSCRIBED");
    });

  return {
    stop: () => {
      void sb.removeChannel(channel);
      cb.onStatus(false);
    },
  };
}
