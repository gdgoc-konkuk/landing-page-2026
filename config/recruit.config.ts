export interface RecruitConfig {
  /** 모집 마감. ISO 8601, KST 오프셋 명시. 시작일은 없다 — lib/recruit.ts 참고 */
  closesAt: string;
  /** 마감 며칠 전부터 'closing'으로 볼지 */
  closingWindowDays: number;
  /** 지원서 URL */
  applyUrl: string;
  /** 기수 표기 */
  cohort: string;
}

/**
 * 마감일의 단일 출처.
 * 여기만 고치면 배너·CTA·푸터가 함께 따라간다.
 */
export const RECRUIT: RecruitConfig = {
  closesAt: '2026-09-04T23:59:59+09:00',
  closingWindowDays: 7,
  applyUrl: 'https://forms.gle/Hf1em1z8pZkzdgTT6',
  cohort: '26-27기',
};
