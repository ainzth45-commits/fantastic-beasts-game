// Logo — wordmark "FANTASTIC BEASTS" สไตล์เวทมนตร์
// typography จริง (ไม่ใช่ภาพ gen — คมทุกขนาด แก้ง่าย) + ประกายดาวขยับ

import "./logo.css";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`fb-logo${compact ? " fb-logo--compact" : ""}`}>
      <span className="fb-logo__spark fb-logo__spark--1" aria-hidden>✦</span>
      <span className="fb-logo__spark fb-logo__spark--2" aria-hidden>✧</span>
      <span className="fb-logo__spark fb-logo__spark--3" aria-hidden>✦</span>
      <div className="fb-logo__text">
        <span className="fb-logo__fantastic">Fantastic</span>
        <span className="fb-logo__beasts">BEASTS</span>
      </div>
      {!compact && <span className="fb-logo__sub">สัตว์วิเศษของทีม</span>}
    </div>
  );
}
