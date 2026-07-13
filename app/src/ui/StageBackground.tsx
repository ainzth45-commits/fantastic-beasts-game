// StageBackground — ฉากหลังเปลี่ยนตามขั้นการเติบโตของน้อง + crossfade ตอนเปลี่ยนขั้น
// ภาพขั้นก่อนหน้าค้างไว้ ภาพใหม่ fade ทับด้านบน → เปลี่ยนฉากแบบนุ่ม ไม่วูบ

import { useEffect, useRef, useState } from "react";
import type { BeastTier, Stage } from "../domain/types";
import { stageBgUrl } from "./stageBg";
import "./stage-bg.css";

// ฉากผูกกับ "สายพันธุ์ + กลุ่มร่าง" — ตัดสินไฟล์ใน stageBg.ts (มี fallback ฉากกลางระหว่างศิลป์ทยอยมา)

export function StageBackground({ tier, stage }: { tier: BeastTier; stage: Stage }) {
  // ชั้นภาพที่กำลังแสดง — ตัวท้ายสุด (z สูงสุด) fade-in ทับตัวก่อนหน้า
  const [layers, setLayers] = useState<string[]>(() => [stageBgUrl(tier, stage)]);
  const prevUrl = useRef(stageBgUrl(tier, stage));

  useEffect(() => {
    const url = stageBgUrl(tier, stage);
    if (url === prevUrl.current) return; // เปลี่ยนขั้นแต่ฉากเดิม (egg→hatching) ไม่ต้อง fade
    prevUrl.current = url;
    setLayers((cur) => [...cur.slice(-1), url]); // เก็บภาพก่อนหน้า + ภาพใหม่
    const t = window.setTimeout(() => setLayers([url]), 1500); // เก็บกวาดชั้นเก่าหลัง fade จบ
    return () => window.clearTimeout(t);
  }, [tier, stage]);

  return (
    <div className="stage-bg" aria-hidden>
      {layers.map((url, i) => (
        <img key={url} className="stage-bg__img" src={url} alt="" style={{ zIndex: i }} />
      ))}
      <div className="stage-bg__scrim" />
    </div>
  );
}
