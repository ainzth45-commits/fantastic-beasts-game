// เทสฉากหลังต่อสายพันธุ์ — ทุก tier×stage ต้อง resolve ไปไฟล์ .webp ที่มีจริงบนดิสก์
// (แพทเทิร์นเดียวกับ sprites map-to-disk — กัน BG_AVAILABLE พิมพ์ชื่อผิด/ไฟล์หาย)

import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Stage } from "../domain/types";
import { stageBgUrl } from "./stageBg";

const STAGES: Stage[] = ["egg", "cracking", "peeking", "newborn", "baby", "child", "junior", "teen", "grown", "adult"];
const ASSETS = join(__dirname, "../../public/assets");

describe("stageBgUrl — ฉากต่อสายพันธุ์ + fallback ฉากกลาง", () => {
  it("ทุกสายพันธุ์×ร่าง ชี้ไฟล์ .webp ที่มีจริงบนดิสก์", () => {
    for (const tier of ["easy", "medium", "hard"] as const) {
      for (const stage of STAGES) {
        const url = stageBgUrl(tier, stage);
        const rel = url.replace(/^.*assets\//, "");
        expect(existsSync(join(ASSETS, rel)), `${tier}/${stage} → ${rel}`).toBe(true);
      }
    }
  });

  it("ร่างกลุ่มเดียวกันใช้ฉากเดียวกัน (egg=cracking · teen=grown)", () => {
    expect(stageBgUrl("easy", "egg")).toBe(stageBgUrl("easy", "cracking"));
    expect(stageBgUrl("hard", "teen")).toBe(stageBgUrl("hard", "grown"));
  });
});
