// StageBackground — ฉากหลังเปลี่ยนตามขั้นการเติบโตของน้อง + crossfade ตอนเปลี่ยนขั้น
// ภาพขั้นก่อนหน้าค้างไว้ ภาพใหม่ fade ทับด้านบน → เปลี่ยนฉากแบบนุ่ม ไม่วูบ

import { useEffect, useRef, useState } from "react";
import type { Stage } from "../domain/types";
import "./stage-bg.css";

// ฉาก 3 ระดับ (Codex): ไข่/ฟัก→bg-egg · เด็ก/วัยรุ่น→bg-child · เต็มวัย→bg-adult
const STAGE_BG: Record<Stage, string> = {
  egg: "bg-egg",
  hatching: "bg-egg",
  child: "bg-child",
  teen: "bg-child",
  adult: "bg-adult",
};

function bgUrl(stage: Stage): string {
  return `${import.meta.env.BASE_URL}assets/${STAGE_BG[stage]}.webp`;
}

export function StageBackground({ stage }: { stage: Stage }) {
  // ชั้นภาพที่กำลังแสดง — ตัวท้ายสุด (z สูงสุด) fade-in ทับตัวก่อนหน้า
  const [layers, setLayers] = useState<string[]>(() => [bgUrl(stage)]);
  const prevUrl = useRef(bgUrl(stage));

  useEffect(() => {
    const url = bgUrl(stage);
    if (url === prevUrl.current) return; // เปลี่ยนขั้นแต่ฉากเดิม (egg→hatching) ไม่ต้อง fade
    prevUrl.current = url;
    setLayers((cur) => [...cur.slice(-1), url]); // เก็บภาพก่อนหน้า + ภาพใหม่
    const t = window.setTimeout(() => setLayers([url]), 1500); // เก็บกวาดชั้นเก่าหลัง fade จบ
    return () => window.clearTimeout(t);
  }, [stage]);

  return (
    <div className="stage-bg" aria-hidden>
      {layers.map((url, i) => (
        <img key={url} className="stage-bg__img" src={url} alt="" style={{ zIndex: i }} />
      ))}
      <div className="stage-bg__scrim" />
    </div>
  );
}
