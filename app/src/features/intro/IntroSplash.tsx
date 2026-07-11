// Intro splash — เปิดเว็บมา logo ใหญ่กลางจอ (ป็อปมีประกาย) ค้าง 3 วิ
// แล้วบินย่อไปมุมซ้ายบนสมูธ พร้อมเปิดหน้าเกมหลักเข้ามาระหว่างย้าย

import { useEffect, useState, type ReactNode } from "react";
import "./intro.css";

type Phase = "enter" | "move" | "done";

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function IntroSplash({ children }: { children: ReactNode }) {
  // ผู้ใช้ที่ปิดแอนิเมชัน → ข้าม intro ไปหน้าเกมเลย
  const [phase, setPhase] = useState<Phase>(() => (prefersReducedMotion() ? "done" : "enter"));

  useEffect(() => {
    if (phase === "done") return;
    // โผล่ (~0.95s) + ค้าง 3 วิ → เริ่มย้ายเข้ามุม
    const toMove = window.setTimeout(() => setPhase("move"), 3300);
    // ย้าย+ย่อ (~1.1s) → จบ intro
    const toDone = window.setTimeout(() => setPhase("done"), 4550);
    return () => {
      window.clearTimeout(toMove);
      window.clearTimeout(toDone);
    };
    // ตั้ง timer ครั้งเดียวตอน mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={`app-stage app-stage--${phase}`}>{children}</div>
      {phase !== "done" && (
        <div className={`intro intro--${phase}`} aria-hidden>
          {/* ฉากหน้าแรกเฉพาะ intro (ไม่ซ้ำฉากในเกม) ค่อยๆ ซูม ไม่ใช่พื้นสีนิ่ง */}
          <img className="intro__bg" src={`${import.meta.env.BASE_URL}assets/bg-intro.webp`} alt="" />
          <div className="intro__scrim" />
          <div className="intro__sparkles">
            <span>✦</span><span>✧</span><span>⭐</span><span>✨</span><span>✦</span><span>✧</span>
          </div>
          <img
            className="intro__logo"
            src={`${import.meta.env.BASE_URL}assets/logo-full.webp`}
            alt="Fantastic Beasts"
            draggable={false}
          />
        </div>
      )}
    </>
  );
}
