// จอ TV หลัก — สัตว์กลางจอ + หลอดโต + ticker + ป้ายยอดเข้า + ตั้งชื่อตอนฟัก

import { useEffect, useState } from "react";
import type { SaleEvent } from "../../domain/types";
import { currentStage, isHatched } from "../../state/gameState";
import { useGameStore } from "../../state/useGameStore";
import { Beast } from "../../ui/beast/Beast";
import { Logo } from "../../ui/Logo";
import { StageBackground } from "../../ui/StageBackground";
import { DevPanel } from "../dev/DevPanel";
import { NamingOverlay } from "./NamingOverlay";
import "./tv.css";

const MOOD_LABEL: Record<string, { emoji: string; text: string }> = {
  thrilled: { emoji: "🤩", text: "ดีใจสุดๆ!" },
  happy: { emoji: "😊", text: "ร่าเริง" },
  calm: { emoji: "🙂", text: "อารมณ์ดี" },
  lonely: { emoji: "🥺", text: "เหงาจัง…" },
  sad: { emoji: "😢", text: "เศร้าเลย" },
  sleep: { emoji: "😴", text: "หลับอยู่" },
};

const STAGE_LABEL: Record<string, string> = {
  egg: "ไข่ปริศนา",
  cracking: "ไข่เริ่มแตก",
  peeking: "โผล่พ้นไข่",
  newborn: "แรกเกิด",
  baby: "วัยทารก",
  child: "วัยเด็ก",
  junior: "เด็กโต",
  teen: "วัยรุ่น",
  grown: "วัยหนุ่มสาว",
  adult: "โตเต็มวัย",
};

function baht(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export function TvScreen() {
  const { state, mood, feed, feeding, startFeeding, pauseFeeding, todayTotal, feedStatus } = useGameStore();
  const stage = currentStage(state);
  const hatched = isHatched(state);

  // ป้ายยอดเข้าล่าสุด (โชว์ 6 วิแล้วจาง) — เด้งเฉพาะยอดที่เข้าหลังเปิดจอ
  // กันเคสรีเฟรชแล้ว event เก่าจาก localStorage เด้งซ้ำ
  const [toast, setToast] = useState<SaleEvent | null>(null);
  const [feedPulse, setFeedPulse] = useState(0);
  const [mountedAt] = useState(() => Date.now());
  const latest = state.events.length > 0 ? state.events[state.events.length - 1] : null;
  useEffect(() => {
    if (!latest || latest.at < mountedAt) return;
    setToast(latest);
    setFeedPulse((p) => p + 1);
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [latest, mountedAt]);

  // ตั้งชื่อ: เด้งเองครั้งแรกที่ฟัก + เปิดซ้ำได้จากปุ่ม
  const [namingOpen, setNamingOpen] = useState(false);
  useEffect(() => {
    if (hatched && state.beastName === null) setNamingOpen(true);
  }, [hatched, state.beastName]);

  const displayName = state.beastName ?? "???";
  const moodInfo = MOOD_LABEL[mood];
  // todayTotal มาจาก store (aggregate + ผูกนาฬิกา — ข้ามเที่ยงคืนรีเซ็ตเอง)
  const recent = state.events.slice(-5).reverse();

  return (
    <div className="tv">
      {/* ฉากเปลี่ยนตามขั้นการเติบโต (Codex) + crossfade */}
      <StageBackground stage={stage} />
      <header className="tv__top">
        <Logo compact />
        <div className="tv__name">
          <span className="tv__name-text">{hatched ? `น้อง${displayName}` : "🥚 รอฟักไข่…"}</span>
          {hatched && (
            <button type="button" className="tv__rename" onClick={() => setNamingOpen(true)} title="เปลี่ยนชื่อ">
              ✏️
            </button>
          )}
        </div>
        <div className="tv__right">
          <div className={`tv__mood tv__mood--${mood}`}>
            <span className="tv__mood-emoji">{moodInfo.emoji}</span>
            <span>{moodInfo.text}</span>
          </div>
          {feeding && (
            <button type="button" className="tv__pause" onClick={pauseFeeding} title="พักเลี้ยง — หยุดรับยอด">
              ⏸ พักเลี้ยง
            </button>
          )}
        </div>
      </header>

      {/* ม่านพักเลี้ยง — จอเปิดใหม่/กดพัก: น้องหลับ ยอดไม่นับ จนกว่าจะกดเลี้ยงต่อ */}
      {!feeding && (
        <div className="tv__gate">
          <div className="tv__gate-card">
            <span className="tv__gate-zzz" aria-hidden>😴</span>
            <h2 className="tv__gate-title">{hatched ? `น้อง${displayName} หลับอยู่` : "ไข่กำลังพักผ่อน"}</h2>
            <p className="tv__gate-lead">ตอนนี้ยังไม่รับยอดนะ — กดปุ่มเพื่อปลุกน้องแล้วเริ่มนับยอดขาย</p>
            <button type="button" className="tv__gate-btn" onClick={startFeeding}>
              {state.points > 0 || hatched ? "🍖 เลี้ยงต่อ!" : "🥚 เริ่มเลี้ยง!"}
            </button>
          </div>
        </div>
      )}

      <main className="tv__stage-area">
        <Beast stage={stage} mood={mood} feedPulse={feedPulse} />
        {toast && (
          <div className="tv__toast" key={toast.id}>
            {toast.employeePhotoUrl ? (
              <img
                className="tv__toast-photo"
                src={toast.employeePhotoUrl}
                alt=""
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span className="tv__toast-emoji">🍖</span>
            )}
            <span className="tv__toast-text">
              {toast.employeeName ? `${toast.employeeName} ป้อน` : "มีอาหารมาส่ง"} {baht(toast.amount)} บาท!
            </span>
          </div>
        )}
        {/* badge หลุดการเชื่อมต่อ — โชว์เฉพาะตอนเปิดเลี้ยงแต่ฟีดยอดจริงไม่ติด */}
        {feeding && feedStatus === "connecting" && (
          <div className="tv__feed-badge">📡 กำลังเชื่อมต่อยอดขาย…</div>
        )}
        {feeding && feedStatus === "error" && (
          <div className="tv__feed-badge tv__feed-badge--error">⚠️ เชื่อมต่อยอดขายไม่ได้ — เช็กเน็ตแล้วกดพัก/เลี้ยงต่อใหม่</div>
        )}
      </main>

      <footer className="tv__bottom">
        {/* ไม่โชว์แต้ม/เป้า/หลอดโต — ให้ทีมลุ้นเองว่าน้องจะโตตอนไหน (กติกาเจ้านาย) */}
        <div className="tv__ticker">
          <span className="tv__stage-label">{STAGE_LABEL[stage]}</span>
          <span className="tv__today">วันนี้ {baht(todayTotal)} บาท</span>
          {recent.map((e) => (
            <span key={e.id} className="tv__tick">
              {e.employeeName ?? "ทีม"} +{baht(e.amount)}
            </span>
          ))}
        </div>
      </footer>

      {namingOpen && <NamingOverlay onClose={() => setNamingOpen(false)} />}
      <DevPanel onMockSale={feed} />
    </div>
  );
}
