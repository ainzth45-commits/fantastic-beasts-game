// ฉากฉลองโตเต็มวัย (เฟส 4A) — confetti CSS + รางวัล + ปุ่มเริ่มตัวถัดไป (แอดมินกด)

import { NEXT_TIER, REWARDS, TIER_LABEL } from "../../state/config";
import { useGameStore } from "../../state/useGameStore";
import "./celebration.css";

const CONFETTI_COLORS = ["#ffd45e", "#7ec8ff", "#ff9edb", "#a5f0c5", "#cdb9ff", "#ffb37e"];

export function CelebrationOverlay({ onKeepWatching }: { onKeepWatching: () => void }) {
  const { state, completeCycle } = useGameStore();
  const name = state.beastName ?? "???";
  const next = TIER_LABEL[NEXT_TIER[state.tier]];

  return (
    <div className="celebrate" role="dialog" aria-label="ฉลองโตเต็มวัย">
      {/* confetti โปรยจากขอบบน — ชิ้นส่วน CSS ล้วน ไม่ใช้ asset */}
      <div className="celebrate__confetti" aria-hidden>
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 137) % 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 12) * 0.25}s`,
              animationDuration: `${2.6 + (i % 5) * 0.35}s`,
            }}
          />
        ))}
      </div>
      <div className="celebrate__card">
        <div className="celebrate__burst" aria-hidden>🎉</div>
        <h1 className="celebrate__title">น้อง{name} โตเต็มวัยแล้ว!</h1>
        <p className="celebrate__lead">ทีมเลี้ยงจนครบเป้า — เก่งมากทุกคน 👏</p>
        <div className="celebrate__reward">
          <span className="celebrate__reward-label">รางวัลของทีม</span>
          <strong className="celebrate__reward-text">{REWARDS[state.tier]}</strong>
        </div>
        <p className="celebrate__next">
          ตัวถัดไป: {next.emoji} <strong>{next.species}</strong> รอทีมอยู่นะ
        </p>
        <div className="celebrate__actions">
          <button type="button" className="celebrate__btn celebrate__btn--primary" onClick={completeCycle}>
            🎁 รับรางวัล & เริ่มตัวถัดไป
          </button>
          <button type="button" className="celebrate__btn" onClick={onKeepWatching}>
            ✨ ฉลองต่ออีกหน่อย
          </button>
        </div>
        <p className="celebrate__hint">ปุ่มรับรางวัลสำหรับแอดมิน — กดแล้วน้อง{name} จะเข้าหอเกียรติยศ</p>
      </div>
    </div>
  );
}
