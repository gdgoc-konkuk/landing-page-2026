import type { RecruitConfig } from '../config/recruit.config.ts';

export type RecruitState = 'open' | 'closing' | 'closed';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 모집 상태를 판정한다. `now`를 인자로 받는 이유는 테스트 가능성과,
 * 서버 렌더 시점을 명시적으로 넘기기 위함이다.
 * 마감일이 파싱되지 않으면 예외 대신 'closed'로 수렴한다 —
 * 랜딩 페이지가 설정 오류로 500을 내는 것보다 CTA가 안 보이는 편이 낫다.
 */
export function resolveRecruitState(
  config: RecruitConfig,
  now: Date
): RecruitState {
  const closes = new Date(config.closesAt).getTime();
  const t = now.getTime();

  if (!Number.isFinite(closes)) return 'closed';
  if (!Number.isFinite(t)) return 'closed';
  if (t > closes) return 'closed';

  const closingStart = closes - config.closingWindowDays * DAY_MS;
  return config.closingWindowDays > 0 && t >= closingStart
    ? 'closing'
    : 'open';
}

/**
 * 마감까지 남은 일수(올림). 모집 중이 아니면 null.
 * 올림이므로 "1일 남음"은 마지막 24시간을 뜻한다.
 */
export function daysLeft(config: RecruitConfig, now: Date): number | null {
  const state = resolveRecruitState(config, now);
  if (state !== 'open' && state !== 'closing') return null;
  const remaining = new Date(config.closesAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(remaining / DAY_MS));
}

/** 모집 CTA를 보여줄 상태인지. */
export function isRecruiting(state: RecruitState): boolean {
  return state === 'open' || state === 'closing';
}

/** 마감 안내 문구. 0일은 "오늘 마감"으로 표현한다 — "0일 남음"은 틀린 말처럼 읽힌다. */
export function formatDeadline(days: number | null): string | null {
  if (days === null) return null;
  return days === 0 ? '오늘 모집 마감' : `모집 마감까지 ${days}일`;
}
