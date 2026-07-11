// Beast — หัวใจของจอ: สัตว์วิเศษที่ "มีชีวิต"
// ชั้น motion ซ้อนกัน (ไม่ทื่อ): หายใจตลอด + กะพริบตาสุ่มจังหวะ + กระดิก/เอียงตัวสุ่มเป็นครั้งคราว
// + ท่าตามอารมณ์ (เด้งร่าเริง, ห่อตัวเศร้า, โยกเหงา, หลับ zzz, กระโดดพลุตอน thrilled)
// + เด้งรับอาหารตอนยอดเข้า (ทริกเกอร์จาก key)

import { useEffect, useRef, useState } from "react";
import type { Mood, Stage } from "../../domain/types";
import { beastSprite } from "./sprites";
import "./beast.css";

interface BeastProps {
  stage: Stage;
  mood: Mood;
  /** เปลี่ยนค่าทุกครั้งที่ยอดเข้า → เล่นท่ารับอาหาร 1 ครั้ง */
  feedPulse: number;
}

/** สุ่มช่วงเวลา (ms) แบบมนุษย์ๆ — ไม่ให้จังหวะตายตัวจนดูเป็นหุ่นยนต์ */
function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function Beast({ stage, mood, feedPulse }: BeastProps) {
  const [blinking, setBlinking] = useState(false);
  const [quirk, setQuirk] = useState<"none" | "wiggle" | "tilt" | "hop">("none");
  const [eating, setEating] = useState(false);
  const lastPulse = useRef(feedPulse);

  // กะพริบตา: สุ่มทุก 2.5-6 วิ กะพริบสั้น 160ms (บางครั้งกะพริบสองติด)
  // เก็บ timeout id ทุกตัวไว้เคลียร์ตอน cleanup — จอเปิดทั้งวัน ห้ามมี timer หลงเหลือ
  useEffect(() => {
    if (mood === "sleep") return; // หลับอยู่ ตาปิดถาวร
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };
    function scheduleBlink() {
      later(() => {
        setBlinking(true);
        later(() => {
          setBlinking(false);
          // 25% กะพริบสองติด — นิสัยเล็กๆ ให้ดูจริง
          if (Math.random() < 0.25) {
            later(() => setBlinking(true), 140);
            later(() => setBlinking(false), 300);
          }
        }, 160);
        scheduleBlink();
      }, randomBetween(2500, 6000));
    }
    scheduleBlink();
    return () => {
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
    };
  }, [mood]);

  // ท่ากระดิกสุ่ม: ทุก 7-16 วิ สุ่มเลือก wiggle/tilt/hop (เฉพาะอารมณ์ที่ยังร่าเริงพอ)
  useEffect(() => {
    if (mood === "sleep" || mood === "sad") return;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };
    function scheduleQuirk() {
      later(() => {
        const moves: Array<"wiggle" | "tilt" | "hop"> = mood === "lonely" ? ["tilt"] : ["wiggle", "tilt", "hop"];
        setQuirk(moves[Math.floor(Math.random() * moves.length)]);
        later(() => setQuirk("none"), 900);
        scheduleQuirk();
      }, randomBetween(7000, 16000));
    }
    scheduleQuirk();
    return () => {
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
      setQuirk("none"); // เผื่อ unmount กลาง quirk ค้างท่า
    };
  }, [mood]);

  // เด้งรับอาหารเมื่อ feedPulse เปลี่ยน
  useEffect(() => {
    if (feedPulse === lastPulse.current) return;
    lastPulse.current = feedPulse;
    setEating(true);
    const t = window.setTimeout(() => setEating(false), 1100);
    return () => window.clearTimeout(t);
  }, [feedPulse]);

  const sprite = beastSprite(stage, mood, blinking);
  const classes = [
    "beast",
    `beast--${mood}`,
    `beast--stage-${stage}`,
    quirk !== "none" ? `beast--quirk-${quirk}` : "",
    eating ? "beast--eating" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="beast__aura" aria-hidden />
      <img className="beast__sprite" src={sprite} alt="สัตว์วิเศษของทีม" draggable={false} />
      {mood === "sleep" && <div className="beast__zzz" aria-hidden>💤</div>}
      {mood === "lonely" && <div className="beast__bubble" aria-hidden>💭</div>}
      {mood === "thrilled" && (
        <div className="beast__sparkles" aria-hidden>
          <span>✨</span><span>🎉</span><span>✨</span><span>⭐</span><span>🎊</span><span>✨</span>
        </div>
      )}
      {eating && <div className="beast__yum" aria-hidden>😋</div>}
    </div>
  );
}
