// DevPanel — แผงเดโม POC: ยิงยอดปลอม / บังคับอารมณ์ / รีเซ็ต
// เปิด-ปิดด้วยปุ่ม 🔧 มุมจอ (ของจริงเฟส 2 จะซ่อนหลัง query param)

import { useState } from "react";
import type { Mood, SaleEvent } from "../../domain/types";
import { useGameStore } from "../../state/useGameStore";
import "./dev.css";

const MOCK_NAMES = ["เรน", "มายด์", "แพรว", "ฟ้า", "บีม", "มิว", "เจน", "นุ่น", "พลอย", "ออม", "กิ๊ฟ"];

let mockSeq = 0;
function mockSale(amount: number): SaleEvent {
  mockSeq += 1;
  return {
    id: `mock-${Date.now()}-${mockSeq}`,
    amount,
    at: Date.now(),
    employeeName: MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
  };
}

const MOODS: Array<{ value: Mood; label: string }> = [
  { value: "thrilled", label: "🤩" },
  { value: "happy", label: "😊" },
  { value: "calm", label: "🙂" },
  { value: "lonely", label: "🥺" },
  { value: "sad", label: "😢" },
  { value: "sleep", label: "😴" },
];

export function DevPanel({ onMockSale }: { onMockSale: (sale: SaleEvent) => void }) {
  const { forcedMood, setForcedMood, reset } = useGameStore();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="dev__fab" onClick={() => setOpen(true)} title="แผงเดโม">
        🔧
      </button>
    );
  }

  return (
    <div className="dev">
      <div className="dev__head">
        <strong>แผงเดโม (POC)</strong>
        <button type="button" className="dev__close" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="dev__group">
        <span>ยิงยอดปลอม</span>
        <div className="dev__row">
          <button type="button" onClick={() => onMockSale(mockSale(500 + Math.floor(Math.random() * 2000)))}>ยอดเล็ก</button>
          <button type="button" onClick={() => onMockSale(mockSale(5000 + Math.floor(Math.random() * 5000)))}>ยอดใหญ่ 💥</button>
          <button type="button" onClick={() => onMockSale(mockSale(60_000))}>+60k (เร่งโต)</button>
          <button type="button" onClick={() => onMockSale(mockSale(180_000))}>+180k (ข้ามขั้น)</button>
        </div>
      </div>
      <div className="dev__group">
        <span>บังคับอารมณ์ (ทับการคำนวณ)</span>
        <div className="dev__row">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              className={forcedMood === m.value ? "dev__active" : ""}
              onClick={() => setForcedMood(forcedMood === m.value ? null : m.value)}
            >
              {m.label}
            </button>
          ))}
          <button type="button" className={forcedMood === null ? "dev__active" : ""} onClick={() => setForcedMood(null)}>
            อัตโนมัติ
          </button>
        </div>
      </div>
      <div className="dev__group">
        <div className="dev__row">
          <button type="button" className="dev__danger" onClick={() => { if (window.confirm("รีเซ็ตกลับไข่?")) reset(); }}>
            ♻️ รีเซ็ตเกม
          </button>
        </div>
      </div>
    </div>
  );
}
