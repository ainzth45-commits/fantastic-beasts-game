// Intro splash — 2 โหมด:
//   auto  : เปิดเว็บครั้งแรก — logo ป็อปกลางจอ ค้าง 3 วิ แล้วบินเข้ามุมเอง (พฤติกรรมเดิม)
//   manual: กด logo มุมซ้ายบนกลับมา "หน้าแรก" — logo ใหญ่ค้างไว้ (พักเลี้ยงอยู่)
//           จนกว่าจะ "กดที่ logo" อีกครั้ง → บินเข้ามุม + กลับเข้าเกม (เริ่มเลี้ยงอัตโนมัติ)

import { useEffect, useState, type ReactNode } from "react";
import "./intro.css";

type Phase = "enter" | "hold" | "move" | "done";

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface IntroSplashProps {
  children: ReactNode;
  /** true = หน้าแรกแบบค้าง รอกด logo ถึงจะเข้าเกม */
  manual?: boolean;
  /** เรียกเมื่อ splash จบ (เข้าเกมแล้ว) */
  onDone?: () => void;
}

export function IntroSplash({ children, manual = false, onDone }: IntroSplashProps) {
  // ผู้ใช้ที่ปิดแอนิเมชัน → ข้าม splash (โหมด manual ก็เข้าเกมทันที)
  const [phase, setPhase] = useState<Phase>(() => (prefersReducedMotion() ? "done" : "enter"));

  // แจ้ง onDone ครั้งเดียวเมื่อถึง done
  useEffect(() => {
    if (phase === "done") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // เดินเฟสตามโหมด
  useEffect(() => {
    if (phase === "enter") {
      const t = window.setTimeout(() => setPhase("hold"), 950);
      return () => window.clearTimeout(t);
    }
    if (phase === "hold" && !manual) {
      // auto: ค้างโชว์ ~2.35 วิ (รวม enter ≈ 3.3 วิ) แล้วบินเข้ามุมเอง
      const t = window.setTimeout(() => setPhase("move"), 2350);
      return () => window.clearTimeout(t);
    }
    if (phase === "move") {
      const t = window.setTimeout(() => setPhase("done"), 1150);
      return () => window.clearTimeout(t);
    }
    // hold + manual: ค้างรอผู้ใช้กด logo
  }, [phase, manual]);

  const interactive = manual && (phase === "enter" || phase === "hold");

  return (
    <>
      <div className={`app-stage app-stage--${phase === "done" ? "done" : phase === "move" ? "move" : "enter"}`}>
        {children}
      </div>
      {phase !== "done" && (
        <div className={`intro intro--${phase === "move" ? "move" : "enter"}${interactive ? " intro--manual" : ""}`} aria-hidden={!interactive}>
          {/* ฉากหน้าแรกเฉพาะ intro (ไม่ซ้ำฉากในเกม) ค่อยๆ ซูม ไม่ใช่พื้นสีนิ่ง */}
          <img className="intro__bg" src={`${import.meta.env.BASE_URL}assets/bg-intro.webp`} alt="" />
          <div className="intro__scrim" />
          <div className="intro__sparkles">
            <span>✦</span><span>✧</span><span>⭐</span><span>✨</span><span>✦</span><span>✧</span>
          </div>
          <img
            className="intro__logo"
            src={`${import.meta.env.BASE_URL}assets/logo-full.webp`}
            alt="Fantastic Beasts — แตะเพื่อเข้าเกม"
            draggable={false}
            onClick={() => interactive && setPhase("move")}
          />
          {interactive && <p className="intro__hint">👆 แตะโลโก้เพื่อกลับเข้าเกม (เริ่มเลี้ยงต่อทันที)</p>}
        </div>
      )}
    </>
  );
}
