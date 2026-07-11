// ตาราง sprite ของสัตว์ — POC: ตัวง่าย (easy) ตัวเดียว
// แต่ละขั้น×ท่า ชี้ไฟล์ภาพ · ภาพที่ยังไม่มีให้ fallback ตามลำดับ: ท่าปกติของขั้นนั้น → ภาพขั้นก่อนหน้า
// base path ผ่าน import.meta.env.BASE_URL ให้ถูกทั้ง dev (/) และ Pages (/fantastic-beasts-game/)

import type { Mood, Stage } from "../../domain/types";

const BASE = `${import.meta.env.BASE_URL}assets/beast-easy`;

/** ท่าที่ sprite รองรับ — map จาก mood */
type Pose = "idle" | "blink" | "happy" | "sad" | "sleep";

function poseFor(mood: Mood, blinking: boolean): Pose {
  if (mood === "sleep") return "sleep";
  if (blinking) return "blink";
  if (mood === "thrilled" || mood === "happy") return "happy";
  if (mood === "sad" || mood === "lonely") return "sad";
  return "idle";
}

/**
 * ไฟล์ที่คาดหวังต่อขั้น (Codex จะ gen มาเติม):
 *   egg:      egg-idle, egg-happy (ไข่สั่น/เรืองแสง)
 *   hatching: hatching-idle (ไข่แตกเห็นหน้า)
 *   child+:   {stage}-idle / -blink / -happy / -sad / -sleep
 * ยังไม่มีไฟล์ → ใช้ fallback เพื่อให้จอไม่พังระหว่างศิลป์ทยอยมา
 */
const AVAILABLE: Partial<Record<Stage, Partial<Record<Pose, string>>>> = {
  egg: { idle: "egg-idle", happy: "egg-happy" },
  hatching: { idle: "hatching-idle" },
  child: { idle: "child-idle", blink: "child-blink", happy: "child-happy", sad: "child-sad", sleep: "child-sleep" },
  // teen/adult เฟสถัดไป — fallback ไปใช้ child ก่อน
};

const STAGE_FALLBACK: Record<Stage, Stage> = {
  egg: "egg",
  hatching: "egg",
  child: "hatching",
  teen: "child",
  adult: "child",
};

export function beastSprite(stage: Stage, mood: Mood, blinking: boolean): string {
  const pose = poseFor(mood, blinking);
  let s: Stage = stage;
  // ไล่หา sprite ที่มีจริง: ท่าที่ขอ → idle ของขั้นนั้น → ถอยขั้นลง
  for (let hop = 0; hop < 5; hop += 1) {
    const stagePoses = AVAILABLE[s];
    if (stagePoses) {
      const name = stagePoses[pose] ?? stagePoses.idle;
      if (name) return `${BASE}/${name}.webp`;
    }
    if (s === STAGE_FALLBACK[s]) break;
    s = STAGE_FALLBACK[s];
  }
  return `${BASE}/egg-idle.webp`;
}
