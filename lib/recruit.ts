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
 * 마감까지 남은 밀리초. 모집 중이 아니면 null.
 * 초 단위 카운트다운의 단일 소스다 — 서버 첫 페인트와 클라이언트 틱이 같은 식을 쓴다.
 */
export function msLeft(config: RecruitConfig, now: Date): number | null {
  const state = resolveRecruitState(config, now);
  if (!isRecruiting(state)) return null;
  return Math.max(0, new Date(config.closesAt).getTime() - now.getTime());
}

/** 모집 CTA를 보여줄 상태인지. */
export function isRecruiting(state: RecruitState): boolean {
  return state === 'open' || state === 'closing';
}

/**
 * 마감 안내 문구. 하루 이상 남았으면 "N일 hh:mm:ss", 하루 밑으로 내려가면 "hh:mm:ss"다.
 * 일수가 빠지는 순간 hh는 23 이하이므로 시가 24를 넘는 표기는 생기지 않는다.
 * 0이 되는 순간은 '모집 마감'으로 갈음한다.
 */
export function formatDeadline(ms: number | null): string | null {
  if (ms === null) return null;
  if (ms <= 0) return '모집 마감';
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const pad = (n: number) => String(n).padStart(2, '0');
  const clock = `${pad(Math.floor(total / 3600) % 24)}:${pad(
    Math.floor(total / 60) % 60
  )}:${pad(total % 60)}`;
  return `모집 마감까지 ${days > 0 ? `${days}일 ` : ''}${clock}`;
}
