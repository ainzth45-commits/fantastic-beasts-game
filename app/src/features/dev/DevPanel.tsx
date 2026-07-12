// DevPanel — แผงเดโม: ยิงยอดปลอม / บังคับอารมณ์ / สำรองแต้ม / รีเซ็ต
// จอทีวีจริงต้องไม่มีปุ่มนี้ให้ทีมกดเล่น — โชว์เฉพาะ ?dev=1 (แอดมิน) หรือ ?mock=1 (เดโม)

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

/** จอ production ซ่อนแผงทั้งแผง — เปิดด้วย ?dev=1 หรือ ?mock=1 เท่านั้น */
function isDevVisible(): boolean {
  try {
    const q = new URLSearchParams(window.location.search);
    return q.get("dev") === "1" || q.get("mock") === "1";
  } catch {
    return false;
  }
}

export function DevPanel({ onMockSale }: { onMockSale: (sale: SaleEvent) => void }) {
  const { forcedMood, setForcedMood, reset, exportState, importState } = useGameStore();
  const [open, setOpen] = useState(false);

  if (!isDevVisible()) return null;

  // สำรองแต้มเป็นไฟล์ JSON (กันหายถ้าล้าง cache/เปลี่ยนเครื่อง)
  function doExport() {
    const blob = new Blob([exportState()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fantastic-beasts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function doImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const ok = importState(String(reader.result ?? ""));
        window.alert(ok ? "กู้คืนแต้มสำเร็จ ✅" : "ไฟล์ไม่ถูกต้อง กู้คืนไม่ได้ ❌");
      };
      reader.readAsText(file);
    };
    input.click();
  }

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
        <span>สำรอง/กู้คืนแต้ม</span>
        <div className="dev__row">
          <button type="button" onClick={doExport}>📤 สำรองแต้ม</button>
          <button type="button" onClick={doImport}>📥 กู้คืนแต้ม</button>
          <button type="button" className="dev__danger" onClick={() => { if (window.confirm("รีเซ็ตกลับไข่?")) reset(); }}>
            ♻️ รีเซ็ตเกม
          </button>
        </div>
      </div>
    </div>
  );
}
