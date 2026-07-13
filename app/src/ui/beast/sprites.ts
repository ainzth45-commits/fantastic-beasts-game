// ตาราง sprite ของสัตว์ — แยกต่อสายพันธุ์ (tier): easy=แกะยูนิคอร์น · medium=จิ้งจอกเมฆ · hard=มังกรชมพู
// แต่ละขั้น×ท่า ชี้ไฟล์ภาพ · ภาพที่ยังไม่มีให้ fallback ตามลำดับ: ท่าปกติของขั้นนั้น → ภาพขั้นก่อนหน้า
// fallback อยู่ "ในสายพันธุ์เดียวกันเท่านั้น" (คนละตัว ห้ามสลับร่างข้ามสายพันธุ์) —
// ยกเว้นสายพันธุ์ที่ยังไม่มีศิลป์เลย → ใช้ไข่แกะ (easy) เป็น placeholder กันจอพัง (auto-approve, log ใน TASK.md)
// base path ผ่าน import.meta.env.BASE_URL ให้ถูกทั้ง dev (/) และ Pages (/fantastic-beasts-game/)

import type { BeastTier, Mood, Stage } from "../../domain/types";

const TIER_DIR: Record<BeastTier, string> = {
  easy: "beast-easy",
  medium: "beast-medium",
  hard: "beast-hard",
};

/** ท่าที่ sprite รองรับ — map จาก mood */
type Pose = "idle" | "blink" | "happy" | "sad" | "sleep";

function poseFor(mood: Mood, blinking: boolean): Pose {
  if (mood === "sleep") return "sleep";
  if (blinking) return "blink";
  if (mood === "thrilled" || mood === "happy") return "happy";
  if (mood === "sad" || mood === "lonely") return "sad";
  return "idle";
}

type StagePoses = Partial<Record<Stage, Partial<Record<Pose, string>>>>;

/** ครบ 5 ท่ามาตรฐานของ 1 ร่าง — ตัวช่วยลดการพิมพ์ซ้ำ (ชื่อไฟล์ = {stage}-{pose}) */
function fullStage(stage: Stage): Partial<Record<Pose, string>> {
  return {
    idle: `${stage}-idle`,
    blink: `${stage}-blink`,
    happy: `${stage}-happy`,
    sad: `${stage}-sad`,
    sleep: `${stage}-sleep`,
  };
}

/**
 * ไฟล์ sprite ที่ "มีจริงบนดิสก์ ณ ตอนนี้" ต่อสายพันธุ์ — เติมทีละร่างเมื่อ Codex gen มา
 * ยังไม่มีไฟล์ → fallback ถอยร่างลงในสายพันธุ์เดิม จอไม่พังระหว่างศิลป์ทยอยมา
 */
const AVAILABLE: Record<BeastTier, StagePoses> = {
  // แกะยูนิคอร์น — ครบทั้ง 10 ร่าง (เฟส 2 จบ)
  easy: {
    egg: { idle: "egg-idle", happy: "egg-happy", sleep: "egg-sleep" },
    cracking: { idle: "cracking-idle", happy: "cracking-happy", sleep: "cracking-sleep" },
    peeking: fullStage("peeking"),
    newborn: fullStage("newborn"),
    baby: fullStage("baby"),
    child: fullStage("child"),
    junior: fullStage("junior"),
    teen: fullStage("teen"),
    grown: fullStage("grown"),
    adult: fullStage("adult"),
  },
  // จิ้งจอกเมฆ — ครบทั้ง 10 ร่าง (เฟส 4B จบฝั่ง medium)
  medium: {
    egg: { idle: "egg-idle", happy: "egg-happy", sleep: "egg-sleep" },
    cracking: { idle: "cracking-idle", happy: "cracking-happy", sleep: "cracking-sleep" },
    peeking: fullStage("peeking"),
    newborn: fullStage("newborn"),
    baby: fullStage("baby"),
    child: fullStage("child"),
    junior: fullStage("junior"),
    teen: fullStage("teen"),
    grown: fullStage("grown"),
    adult: fullStage("adult"),
  },
  // มังกรชมพู — ครบทั้ง 10 ร่าง (เฟส 4B จบครบ 3 สายพันธุ์)
  hard: {
    egg: { idle: "egg-idle", happy: "egg-happy", sleep: "egg-sleep" },
    cracking: { idle: "cracking-idle", happy: "cracking-happy", sleep: "cracking-sleep" },
    peeking: fullStage("peeking"),
    newborn: fullStage("newborn"),
    baby: fullStage("baby"),
    child: fullStage("child"),
    junior: fullStage("junior"),
    teen: fullStage("teen"),
    grown: fullStage("grown"),
    adult: fullStage("adult"),
  },
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

export function beastSprite(tier: BeastTier, stage: Stage, mood: Mood, blinking: boolean): string {
  const pose = poseFor(mood, blinking);
  const base = `${import.meta.env.BASE_URL}assets/${TIER_DIR[tier]}`;
  const tierMap = AVAILABLE[tier];
  let s: Stage = stage;
  // ไล่หา sprite ที่มีจริงในสายพันธุ์นี้: ท่าที่ขอ → idle ของร่างนั้น → ถอยร่างลง (สูงสุด 10 ก้าว)
  for (let hop = 0; hop < 10; hop += 1) {
    const stagePoses = tierMap[s];
    if (stagePoses) {
      const name = stagePoses[pose] ?? stagePoses.idle;
      if (name) return `${base}/${name}.webp`;
    }
    if (s === STAGE_FALLBACK[s]) break;
    s = STAGE_FALLBACK[s];
  }
  // สายพันธุ์นี้ยังไม่มีศิลป์เลย → ไข่แกะเป็น placeholder สุดท้าย (ห้ามจอพัง)
  return `${import.meta.env.BASE_URL}assets/beast-easy/egg-idle.webp`;
}
