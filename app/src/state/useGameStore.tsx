// store กลาง — React context บางๆ ครอบ pure state + persist localStorage

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { startSalesFeed, type SalesFeed } from "../data/salesFeed";
import { DEFAULT_MOOD_CONFIG, moodFor, type MoodConfig } from "../domain/mood";
import type { Mood, SaleEvent } from "../domain/types";
import {
  applySaleDelete,
  applySaleUpdate,
  feedSale,
  finishCycle,
  isComplete,
  resetGame,
  sanitizeGameState,
  setBeastName,
  syncCarryOver,
  todayTotal as todayTotalOf,
  type GameState,
} from "./gameState";
import { loadJson, saveJson } from "./persist";

/** โหมด mock (แผงเดโมยิงยอดเอง ไม่ต่อ Supabase) — เปิดด้วย ?mock=1 */
function isMockMode(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("mock") === "1";
  } catch {
    return false;
  }
}

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
  /** โตเต็มวัยครบเป้าแล้ว — เปิดฉากฉลอง */
  complete: boolean;
  /** ปิดรอบ: บันทึกหอเกียรติยศ + เริ่มตัวถัดไป (ปุ่มแอดมินในฉากฉลอง) */
  completeCycle: () => void;
  /** สำรอง/กู้คืนแต้มทั้งหมด (JSON) — กันแต้มหายถ้าเครื่อง/เบราว์เซอร์มีปัญหา */
  exportState: () => string;
  importState: (json: string) => boolean;
  /** POC: บังคับอารมณ์จาก DevPanel (null = คำนวณจริง) */
  forcedMood: Mood | null;
  setForcedMood: (m: Mood | null) => void;
  /** ยอดวันนี้ (aggregate — อัปเดตตามนาฬิกา ข้ามเที่ยงคืนรีเซ็ตเอง) */
  todayTotal: number;
  /** นาฬิกากลาง (ms) — เดินทุก 30 วิ ให้ UI ที่อิงเวลา re-render */
  nowMs: number;
  /** สถานะฟีดยอดจริง: "mock" | "connected" | "connecting" | "error" */
  feedStatus: "mock" | "connected" | "connecting" | "error";
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

  // ธงข้ามเดือน (โตช้า ×0.75) sync ตามนาฬิกา — ครอบคลุมทั้งเปิดจอใหม่และจอเปิดค้างข้ามเดือน
  useEffect(() => {
    setState((c) => syncCarryOver(c, nowTick));
  }, [nowTick]);

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

  // ฟีดยอดจริง Supabase — เชื่อมเฉพาะช่วงเปิดเลี้ยง (ยอดตอนพักไม่นับ ตามกติกา)
  const [feedStatus, setFeedStatus] = useState<StoreValue["feedStatus"]>(isMockMode() ? "mock" : "connecting");
  const feedRef = useRef<SalesFeed | null>(null);
  const feedingRef = useRef(feeding);
  feedingRef.current = feeding;

  useEffect(() => {
    if (!feeding || isMockMode()) return;
    let cancelled = false;
    setFeedStatus("connecting");
    startSalesFeed({
      onSale: (sale) => {
        if (!feedingRef.current) return;
        setState((current) => {
          const moodAtSale = moodFor(current.events, new Date(), moodConfig, {
            ignoreSleep: true,
            todayTotal: todayTotalOf(current, Date.now()),
          });
          return feedSale(current, sale, moodAtSale);
        });
        setNowTick(Date.now());
      },
      onSaleUpdated: (id, amount, at) => setState((c) => applySaleUpdate(c, id, amount, at)),
      onSaleDeleted: (id, at) => setState((c) => applySaleDelete(c, id, at)),
      onStatus: (ok) => !cancelled && setFeedStatus(ok ? "connected" : "connecting"),
    })
      .then((feed) => {
        if (cancelled) feed.stop();
        else feedRef.current = feed;
      })
      .catch(() => !cancelled && setFeedStatus("error"));
    return () => {
      cancelled = true;
      feedRef.current?.stop();
      feedRef.current = null;
    };
  }, [feeding, moodConfig]);

  const startFeeding = useCallback(() => setFeeding(true), []);
  const pauseFeeding = useCallback(() => setFeeding(false), []);

  const nameBeast = useCallback((name: string) => setState((c) => setBeastName(c, name)), []);
  const reset = useCallback(() => setState((c) => resetGame(c)), []);
  const complete = isComplete(state);
  const completeCycle = useCallback(() => setState((c) => finishCycle(c, Date.now())), []);

  const exportState = useCallback(() => JSON.stringify(state, null, 2), [state]);
  const importState = useCallback((json: string): boolean => {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!parsed || typeof parsed !== "object") return false;
      setState(sanitizeGameState(parsed)); // sanitize เสมอ — ไฟล์เพี้ยนต้องไม่ทำเกมพัง
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({ state, mood, moodConfig, feeding, startFeeding, pauseFeeding, feed, nameBeast, reset, complete, completeCycle, forcedMood, setForcedMood, todayTotal, nowMs: nowTick, feedStatus, exportState, importState }),
    [state, mood, moodConfig, feeding, startFeeding, pauseFeeding, feed, nameBeast, reset, complete, completeCycle, forcedMood, todayTotal, nowTick, feedStatus, exportState, importState],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useGameStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useGameStore ต้องอยู่ใน GameStoreProvider");
  return ctx;
}
