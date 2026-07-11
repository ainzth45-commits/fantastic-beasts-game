import { useCallback, useState } from "react";
import { IntroSplash } from "./features/intro/IntroSplash";
import { TvScreen } from "./features/tv/TvScreen";
import { GameStoreProvider, useGameStore } from "./state/useGameStore";

/**
 * Shell — คุมการสลับ หน้าแรก (splash) ↔ หน้าเกม
 * เปิดเว็บครั้งแรก: splash โหมด auto (ค้าง 3 วิแล้วเข้าเกมเอง — ผ่าน gate เริ่มเลี้ยงปกติ)
 * กด logo มุมซ้ายบน: พักเลี้ยงอัตโนมัติ + กลับหน้าแรกแบบค้าง → กด logo ใหญ่เพื่อกลับเกม + เริ่มเลี้ยงอัตโนมัติ
 */
function Shell() {
  const { startFeeding, pauseFeeding } = useGameStore();
  // splash: "auto" (เปิดเว็บ) | "manual" (กด logo กลับหน้าแรก) | null (อยู่ในเกม)
  const [splash, setSplash] = useState<"auto" | "manual" | null>("auto");

  const goHome = useCallback(() => {
    pauseFeeding(); // กลับหน้าแรก = พักเลี้ยงอัตโนมัติ (ยอดช่วงนี้ไม่นับ)
    setSplash("manual");
  }, [pauseFeeding]);

  const onSplashDone = useCallback(() => {
    const wasManual = splash === "manual";
    setSplash(null);
    if (wasManual) startFeeding(); // กลับจากหน้าแรกด้วยมือ = เริ่มเลี้ยงต่ออัตโนมัติ
  }, [splash, startFeeding]);

  const screen = <TvScreen onLogoClick={goHome} />;
  if (splash === null) return screen;
  return (
    <IntroSplash key={splash} manual={splash === "manual"} onDone={onSplashDone}>
      {screen}
    </IntroSplash>
  );
}

export default function App() {
  return (
    <GameStoreProvider>
      <Shell />
    </GameStoreProvider>
  );
}
