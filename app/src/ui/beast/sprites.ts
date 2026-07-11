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
 * ไฟล์ sprite ที่ "มีจริงบนดิสก์ ณ ตอนนี้" — เติมทีละร่างเมื่อ Codex gen มา
 * ชื่อไฟล์ = {stage}-{pose}.webp · ยังไม่มีไฟล์ → fallback ถอยร่างลง จอไม่พังระหว่างศิลป์ทยอยมา
 * (ครบแล้ว: egg บางท่า, peeking-idle, child ครบ — ที่เหลือ Codex เฟส 2)
 */
const AVAILABLE: Partial<Record<Stage, Partial<Record<Pose, string>>>> = {
  egg: { idle: "egg-idle", happy: "egg-happy", sleep: "egg-sleep" },
  cracking: { idle: "cracking-idle", happy: "cracking-happy", sleep: "cracking-sleep" },
  peeking: { idle: "peeking-idle", blink: "peeking-blink", happy: "peeking-happy", sad: "peeking-sad", sleep: "peeking-sleep" },
  newborn: { idle: "newborn-idle", blink: "newborn-blink", happy: "newborn-happy", sad: "newborn-sad", sleep: "newborn-sleep" },
  child: { idle: "child-idle", blink: "child-blink", happy: "child-happy", sad: "child-sad", sleep: "child-sleep" },
};

/** ถอยร่างลงทีละขั้นเมื่อร่างปัจจุบันยังไม่มีภาพ (egg = ก้นสุด) */
const STAGE_FALLBACK: Record<Stage, Stage> = {
  egg: "egg",
  cracking: "egg",
  peeking: "cracking",
  newborn: "peeking",
  baby: "newborn",
  child: "baby",
  junior: "child",
  teen: "junior",
  grown: "teen",
  adult: "grown",
};

export function beastSprite(stage: Stage, mood: Mood, blinking: boolean): string {
  const pose = poseFor(mood, blinking);
  let s: Stage = stage;
  // ไล่หา sprite ที่มีจริง: ท่าที่ขอ → idle ของร่างนั้น → ถอยร่างลง (สูงสุด 10 ก้าว ครบทุกร่าง)
  for (let hop = 0; hop < 10; hop += 1) {
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
