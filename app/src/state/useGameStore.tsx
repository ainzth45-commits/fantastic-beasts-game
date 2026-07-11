// store กลาง — React context บางๆ ครอบ pure state + persist localStorage

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_MOOD_CONFIG, moodFor, type MoodConfig } from "../domain/mood";
import type { Mood, SaleEvent } from "../domain/types";
import { feedSale, initialState, resetGame, setBeastName, type GameState } from "./gameState";
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
}

const StoreContext = createContext<StoreValue | null>(null);

function loadInitial(): GameState {
  return loadJson<GameState>(STORAGE_KEY, initialState());
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

  // พักเลี้ยง = น้องหลับ · เปิดเลี้ยง = ตื่นเสมอ (วันหยุดคนมาทำงานก็เลี้ยงได้)
  const computedMood = useMemo(
    () => (feeding ? moodFor(state.events, new Date(nowTick), moodConfig, { ignoreSleep: true }) : "sleep"),
    [feeding, state.events, nowTick, moodConfig],
  );
  const mood = forcedMood ?? computedMood;

  const feed = useCallback(
    (sale: SaleEvent) => {
      if (!feeding) return; // ไม่ได้เปิดเลี้ยง = ไม่นับยอด (กติกาเจ้านาย)
      setState((current) => {
        const moodAtSale =
          forcedMood ?? moodFor(current.events, new Date(), moodConfig, { ignoreSleep: true });
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
    () => ({ state, mood, moodConfig, feeding, startFeeding, pauseFeeding, feed, nameBeast, reset, forcedMood, setForcedMood }),
    [state, mood, moodConfig, feeding, startFeeding, pauseFeeding, feed, nameBeast, reset, forcedMood],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useGameStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useGameStore ต้องอยู่ใน GameStoreProvider");
  return ctx;
}
