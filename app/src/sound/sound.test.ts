// @vitest-environment jsdom
// เทสระบบเสียง — jsdom ไม่มี AudioContext: ทุกอย่างต้อง "เงียบแต่ไม่พัง"

import { describe, expect, it } from "vitest";
import { isMuted, playSfx, setMuted, unlockAudio } from "./sound";

describe("sound — ปลอดภัยเสมอแม้ไม่มี AudioContext", () => {
  it("unlockAudio/playSfx ไม่ throw ในสภาพแวดล้อมไร้ AudioContext (จอไม่พัง)", () => {
    expect(() => unlockAudio()).not.toThrow();
    expect(() => playSfx("ding")).not.toThrow();
    expect(() => playSfx("fanfare")).not.toThrow();
  });

  it("setMuted/isMuted สลับสถานะถูก และไม่ throw แม้ storage ใช้ไม่ได้", () => {
    setMuted(true);
    expect(isMuted()).toBe(true);
    setMuted(false);
    expect(isMuted()).toBe(false);
    // playSfx ระหว่าง mute ต้องเงียบและไม่พัง
    setMuted(true);
    expect(() => playSfx("pop")).not.toThrow();
    setMuted(false);
  });
});
