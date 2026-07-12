// ระบบเสียงเกม (เฟส 5) — สังเคราะห์ด้วย WebAudio ล้วน ไม่มีไฟล์เสียง (auto-approve: ทาง ข
// เปลี่ยนเป็นไฟล์ CC0 ทีหลังได้โดยคง API เดิม) · SFX on / BGM ไม่มี (ตาม default ใน roadmap)
//
// กติกา autoplay: สร้าง/resume AudioContext หลัง user gesture แรกเท่านั้น —
// ปุ่ม "เริ่มเลี้ยง" คือ gesture แรกพอดี · จอเปิดทั้งวัน: ทุกเสียงมี envelope จบในตัว ไม่มี node ค้าง

export type SfxName =
  | "pop" // ปุ่มกด
  | "ding" // ยอดเข้า
  | "bigding" // ยอดใหญ่
  | "sparkle" // เลื่อนร่าง/ฟักไข่
  | "fanfare" // โตเต็มวัย
  | "aww"; // อารมณ์ตกเป็นเศร้า/เหงา

const MUTE_KEY = "fantastic-beasts/muted-v1";

let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem(MUTE_KEY) === "1";
} catch {
  /* storage พัง = ใช้ default ไม่ mute */
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(m: boolean): void {
  muted = m;
  try {
    localStorage.setItem(MUTE_KEY, m ? "1" : "0");
  } catch {
    /* เก็บไม่ได้ก็แค่ไม่จำข้ามรีเฟรช */
  }
}

/** เรียกจาก user gesture (ปุ่มเริ่มเลี้ยง/คลิกแรก) — ปลดล็อก AudioContext */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return; // เบราว์เซอร์ไม่รองรับ = เกมเงียบแต่ไม่พัง
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
}

/** โน้ตเดียว: sine/triangle + envelope สั้น จบแล้วปล่อย GC เอง */
function tone(at: number, freq: number, dur: number, gainPeak: number, type: OscillatorType = "sine"): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gainPeak, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/** เล่นเอฟเฟกต์ — เงียบเฉยๆ ถ้า mute/ยังไม่ปลดล็อก/ไม่รองรับ (ห้าม throw เด็ดขาด) */
export function playSfx(name: SfxName): void {
  if (muted || !ctx || ctx.state !== "running") return;
  try {
    const t = ctx.currentTime + 0.01;
    switch (name) {
      case "pop":
        tone(t, 520, 0.09, 0.12, "triangle");
        break;
      case "ding":
        tone(t, 880, 0.22, 0.14);
        tone(t + 0.07, 1318, 0.3, 0.1);
        break;
      case "bigding":
        tone(t, 660, 0.2, 0.16);
        tone(t + 0.09, 880, 0.22, 0.15);
        tone(t + 0.18, 1318, 0.42, 0.13);
        break;
      case "sparkle":
        [1046, 1318, 1568, 2093].forEach((f, i) => tone(t + i * 0.08, f, 0.28, 0.1, "triangle"));
        break;
      case "fanfare":
        [523, 659, 784, 1046].forEach((f, i) => tone(t + i * 0.14, f, 0.4, 0.16, "triangle"));
        tone(t + 0.62, 1318, 0.8, 0.14);
        break;
      case "aww":
        tone(t, 392, 0.3, 0.08);
        tone(t + 0.16, 330, 0.42, 0.07);
        break;
    }
  } catch {
    /* เสียงพลาด = ปล่อยผ่าน เกมต้องเดินต่อ */
  }
}
