'use client';

import { useEffect, useState } from 'react';
import { formatDeadline } from './recruit';

/**
 * 초 단위로 갱신되는 마감 문구.
 *
 * 첫 렌더는 서버가 계산한 initialMs를 그대로 쓴다 — 하이드레이션 시점에
 * 클라이언트 시계로 다시 재면 마크업이 어긋난다. 마운트 뒤부터 실시간으로 넘어가므로
 * 페이지가 ISR로 캐시돼 있어도 화면에 남는 건 한 프레임뿐이다.
 *
 * closesAt이 null(모집 아님)이면 타이머를 걸지 않는다.
 */
export function useCountdown(
  closesAt: string,
  initialMs: number | null
): string | null {
  const [ms, setMs] = useState(initialMs);

  useEffect(() => {
    if (initialMs === null) return;
    const target = new Date(closesAt).getTime();
    if (!Number.isFinite(target)) return;

    const tick = () => setMs(Math.max(0, target - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [closesAt, initialMs]);

  return formatDeadline(ms);
}
