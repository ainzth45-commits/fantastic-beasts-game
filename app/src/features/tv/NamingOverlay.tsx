// overlay ตั้งชื่อน้อง — เด้งตอนฟักออกจากไข่ (พนักงานช่วยกันตั้ง) + เปิดแก้ทีหลังได้

import { useState } from "react";
import { useGameStore } from "../../state/useGameStore";

export function NamingOverlay({ onClose }: { onClose: () => void }) {
  const { state, nameBeast } = useGameStore();
  const [draft, setDraft] = useState(state.beastName ?? "");
  const canSave = draft.trim().length > 0;

  function save() {
    if (!canSave) return;
    nameBeast(draft);
    onClose();
  }

  return (
    <div className="naming">
      <div className="naming__card">
        <div className="naming__egg" aria-hidden>🐣</div>
        <h2 className="naming__title">น้องฟักออกมาแล้ว!</h2>
        <p className="naming__lead">ช่วยกันตั้งชื่อให้น้องหน่อยนะ (ทีมช่วยกันคิดได้เลย)</p>
        <input
          className="naming__input"
          type="text"
          maxLength={20}
          placeholder="พิมพ์ชื่อน้องที่นี่…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); }}
          autoFocus
        />
        <div className="naming__row">
          {state.beastName !== null && (
            <button type="button" className="naming__btn naming__btn--ghost" onClick={onClose}>
              ยกเลิก
            </button>
          )}
          <button type="button" className="naming__btn" disabled={!canSave} onClick={save}>
            ตั้งชื่อ 💖
          </button>
        </div>
      </div>
    </div>
  );
}
