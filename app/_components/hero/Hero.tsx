import HeroTicker from './HeroTicker';
import { RECRUIT } from '@/config/recruit.config';
import { isRecruiting, type RecruitState } from '@/lib/recruit';

/**
 * 히어로. 사진 없음 — 학교 상징색 필드 위에 브래킷 마크와 슬로건만.
 */
const LEDE = 'Google Developer Groups on Campus Konkuk';

interface HeroProps {
  state: RecruitState;
  msLeft: number | null;
}

export default function Hero({ state, msLeft }: HeroProps) {
  return (
    <HeroTicker
      lede={LEDE}
      closesAt={RECRUIT.closesAt}
      msLeft={msLeft}
      ctaLabel={isRecruiting(state) ? '지원하기' : null}
      ctaHref={RECRUIT.applyUrl}
      state={state}
    />
  );
}
