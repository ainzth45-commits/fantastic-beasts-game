// store กลาง — React context บางๆ ครอบ pure state + persist localStorage

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_MOOD_CONFIG, moodFor, type MoodConfig } from "../domain/mood";
import type { Mood, SaleEvent } from "../domain/types";
import { feedSale, resetGame, sanitizeGameState, setBeastName, todayTotal as todayTotalOf, type GameState } from "./gameState";
import { loadJson, saveJson } from "./persist";

const STORAGE_KEY = "fantastic-beasts/game-v1";

interface StoreValue {
  state: GameState;
  mood: Mood;
  moodConfig: MoodConfig;
  /** เปิดรับยอดอยู่ไหม — จอเปิดใหม่เริ่มที่ "พัก" เสมอ ต้องกดเริ่มเลี้ยง/เลี้ยงต่อ */
  feeding: boolean;
  startFeeding: () => void;
  pauseFeeding: () => void;
  /** ยอดเข้า (mock ตอน POC / Supabase เฟส 2) — ถูกเมินถ้าไม่ได้เปิดเลี้ยง */
  feed: (sale: SaleEvent) => void;
  nameBeast: (name: string) => void;
  reset: () => void;
  /** POC: บังคับอารมณ์จาก DevPanel (null = คำนวณจริง) */
  forcedMood: Mood | null;
  setForcedMood: (m: Mood | null) => void;
  /** ยอดวันนี้ (aggregate — อัปเดตตามนาฬิกา ข้ามเที่ยงคืนรีเซ็ตเอง) */
  todayTotal: number;
  /** นาฬิกากลาง (ms) — เดินทุก 30 วิ ให้ UI ที่อิงเวลา re-render */
  nowMs: number;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadInitial(): GameState {
  // sanitize เสมอ — storage เก่า/เพี้ยนต้องไม่ทำจอพัง (schema เปลี่ยนข้ามเวอร์ชันด้วย)
  return sanitizeGameState(loadJson<unknown>(STORAGE_KEY, null));
}

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadInitial);
  const [forcedMood, setForcedMood] = useState<Mood | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  // เปิดจอใหม่ = พักเสมอ (ทีวีไม่ได้เปิดตลอด ต้องกดเริ่มเลี้ยง/เลี้ยงต่อก่อนถึงนับยอด)
  const [feeding, setFeeding] = useState(false);
  const moodConfig = DEFAULT_MOOD_CONFIG;

  // นาฬิกาเดินทุก 30 วิ — อารมณ์เปลี่ยนตามเวลาได้เอง (เหงา/หลับ) โดยไม่ต้องมี event ใหม่
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    saveJson(STORAGE_KEY, state);
  }, [state]);

  // ยอดวันนี้จาก aggregate — ผูกกับ nowTick ให้ข้ามเที่ยงคืนแล้วรีเซ็ตเอง (จอเปิดค้างคืน)
  const todayTotal = useMemo(() => todayTotalOf(state, nowTick), [state, nowTick]);

  // พักเลี้ยง = น้องหลับ · เปิดเลี้ยง = ตื่นเสมอ (วันหยุดคนมาทำงานก็เลี้ยงได้)
  const computedMood = useMemo(
    () =>
      feeding
        ? moodFor(state.events, new Date(nowTick), moodConfig, { ignoreSleep: true, todayTotal })
        : "sleep",
    [feeding, state.events, nowTick, moodConfig, todayTotal],
  );
  const mood = forcedMood ?? computedMood;

  const feed = useCallback(
    (sale: SaleEvent) => {
      if (!feeding) return; // ไม่ได้เปิดเลี้ยง = ไม่นับยอด (กติกาเจ้านาย)
      setState((current) => {
        const moodAtSale =
          forcedMood ??
          moodFor(current.events, new Date(), moodConfig, {
            ignoreSleep: true,
            todayTotal: todayTotalOf(current, Date.now()),
          });
        return feedSale(current, sale, moodAtSale);
      });
      setNowTick(Date.now());
    },
    [feeding, forcedMood, moodConfig],
  );

  const startFeeding = useCallback(() => setFeeding(true), []);
  const pauseFeeding = useCallback(() => setFeeding(false), []);

  const nameBeast = useCallback((name: string) => setState((c) => setBeastName(c, name)), []);
  const reset = useCallback(() => setState((c) => resetGame(c)), []);

  const value = useMemo(
    () => ({ state, mood, moodConfig, feeding, startFeeding, pauseFeeding, feed, nameBeast, reset, forcedMood, setForcedMood, todayTotal, nowMs: nowTick }),
    [state, mood, moodConfig, feeding, startFeeding, pauseFeeding, feed, nameBeast, reset, forcedMood, todayTotal, nowTick],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useGameStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useGameStore ต้องอยู่ใน GameStoreProvider");
  return ctx;
}
