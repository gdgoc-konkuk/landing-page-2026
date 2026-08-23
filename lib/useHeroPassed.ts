'use client';

import { useEffect, useState } from 'react';

/**
 * 히어로를 지나갔는지. 모집 툴바의 노출 판정에 쓴다.
 *
 * IntersectionObserver 하나로 끝낸다 — 필요한 건 "히어로가 지나갔는가"뿐이고
 * 그건 경계를 넘는 순간에만 알면 되므로 스크롤 리스너를 달 이유가 없다.
 * isIntersecting만 보면 아래쪽으로 벗어난 경우까지 참이 되므로
 * boundingClientRect.bottom도 함께 본다.
 *
 * 관찰 대상은 .hero-track이다. 그 클래스는 globals.css도 이미 쓰고 있어서
 * 새로 만드는 결합이 아니다.
 */
export function useHeroPassed(): boolean {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.hero-track');
    if (!hero) return;

    const io = new IntersectionObserver(([entry]) => {
      setPassed(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return passed;
}
