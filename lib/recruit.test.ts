import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveRecruitState,
  msLeft,
  formatDeadline,
} from './recruit.ts';
import type { RecruitConfig } from '../config/recruit.config.ts';

const CFG: RecruitConfig = {
  closesAt: '2026-09-14T23:59:59+09:00',
  closingWindowDays: 7,
  applyUrl: 'https://example.com/apply',
  cohort: '26-27기',
};

const at = (iso: string) => new Date(iso);

test('마감 전이면 언제든 open — 시작 게이팅은 없다', () => {
  assert.equal(resolveRecruitState(CFG, at('2026-08-31T23:59:58+09:00')), 'open');
  assert.equal(resolveRecruitState(CFG, at('2020-01-01T00:00:00+09:00')), 'open');
});

test('여유 있는 기간은 open', () => {
  assert.equal(resolveRecruitState(CFG, at('2026-09-03T12:00:00+09:00')), 'open');
});

test('closing 창 진입 경계', () => {
  // closesAt - 7일 = 2026-09-07T23:59:59+09:00
  assert.equal(resolveRecruitState(CFG, at('2026-09-07T23:59:58+09:00')), 'open');
  assert.equal(resolveRecruitState(CFG, at('2026-09-07T23:59:59+09:00')), 'closing');
  assert.equal(resolveRecruitState(CFG, at('2026-09-10T00:00:00+09:00')), 'closing');
});

test('마감 순간까지는 closing, 지나면 closed', () => {
  assert.equal(resolveRecruitState(CFG, at('2026-09-14T23:59:59+09:00')), 'closing');
  assert.equal(resolveRecruitState(CFG, at('2026-09-15T00:00:00+09:00')), 'closed');
});

test('마감 한참 뒤도 closed — 죽은 경로가 생기지 않는다', () => {
  assert.equal(resolveRecruitState(CFG, at('2027-03-01T00:00:00+09:00')), 'closed');
});

test('msLeft는 모집 중에만 값을 준다', () => {
  assert.equal(msLeft(CFG, at('2026-09-14T23:59:49+09:00')), 10_000);
  assert.equal(msLeft(CFG, at('2026-09-14T00:00:00+09:00')), 86_399_000);
  assert.equal(msLeft(CFG, at('2026-09-15T00:00:00+09:00')), null);
  // 시작 게이팅이 없으므로 마감 전이면 항상 값이 있다
  assert.equal(msLeft(CFG, at('2026-08-01T00:00:00+09:00')) !== null, true);
});

test('closingWindowDays가 0이면 closing 상태가 없다', () => {
  const cfg = { ...CFG, closingWindowDays: 0 };
  assert.equal(resolveRecruitState(cfg, at('2026-09-14T23:59:59+09:00')), 'open');
  assert.equal(resolveRecruitState(cfg, at('2026-09-15T00:00:00+09:00')), 'closed');
});

test('마감일이 파싱 안 되면 예외를 던지지 않고 closed로 수렴한다', () => {
  const cfg = { ...CFG, closesAt: '언젠가' };
  assert.equal(resolveRecruitState(cfg, at('2026-09-05T00:00:00+09:00')), 'closed');
});

test('now가 잘못된 문자열로 만든 Invalid Date이면 closed', () => {
  assert.equal(resolveRecruitState(CFG, new Date('garbage')), 'closed');
});

test('now가 NaN으로 만든 Invalid Date이면 closed', () => {
  assert.equal(resolveRecruitState(CFG, new Date(NaN)), 'closed');
});

test('msLeft는 now가 Invalid Date이면 null을 반환한다 (NaN이 아니다)', () => {
  assert.equal(msLeft(CFG, new Date('garbage')), null);
});

test('formatDeadline은 하루 밑으로 내려가면 일수를 뗀다', () => {
  assert.equal(formatDeadline(null), null);
  assert.equal(formatDeadline(0), '모집 마감');
  assert.equal(formatDeadline(1_000), '모집 마감까지 00:00:01');
  assert.equal(formatDeadline(61_000), '모집 마감까지 00:01:01');
  assert.equal(formatDeadline(3_723_400), '모집 마감까지 01:02:03');
  // 하루 경계: 24:00:00은 "1일 00:00:00", 1초 뒤엔 일수가 사라진다
  assert.equal(formatDeadline(86_400_000), '모집 마감까지 1일 00:00:00');
  assert.equal(formatDeadline(86_399_000), '모집 마감까지 23:59:59');
  assert.equal(formatDeadline(90_061_000), '모집 마감까지 1일 01:01:01');
});
