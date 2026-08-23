import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SHAPE,
  STATE_LAYER,
  ELEVATION,
  SPRING,
  spring,
  BUTTON,
  ICON_BUTTON,
  TYPESCALE,
  MULTI_BROWSE_CAROUSEL,
  multiBrowseWeight,
} from './m3.ts';

/**
 * 이 테스트는 "값이 스펙 그대로인지"를 지킨다. 여기가 흔들리면 컴포넌트가
 * Material처럼 보이지 않는다 — 이전 구현의 실패가 정확히 그것이었다.
 */

test('shape scale은 M3 corner 값 그대로다', () => {
  assert.deepEqual(SHAPE, {
    none: 0,
    extraSmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    largeIncreased: 20,
    extraLarge: 28,
    extraLargeIncreased: 32,
    extraExtraLarge: 48,
    full: 9999,
  });
});

test('state layer 불투명도는 M3 값 그대로다', () => {
  assert.equal(STATE_LAYER.hover, 0.08);
  assert.equal(STATE_LAYER.focus, 0.1);
  assert.equal(STATE_LAYER.pressed, 0.1);
});

test('elevation level0..5', () => {
  assert.deepEqual([...ELEVATION], [0, 1, 3, 6, 8, 12]);
});

test('spring은 감쇠비를 감쇠계수로 바꾼다 — 그대로 넘기면 끝없이 출렁인다', () => {
  // 임계 감쇠(ζ=1)면 c = 2√k. k=3800 → c = 2·√3800 ≈ 123.288
  const critical = spring(3800, 1);
  assert.equal(critical.stiffness, 3800);
  assert.ok(Math.abs(critical.damping - 2 * Math.sqrt(3800)) < 1e-9);

  // ζ=0.9면 임계값의 0.9배 — 약간 통통 튄다
  const spatial = spring(1400, 0.9);
  assert.ok(Math.abs(spatial.damping / (2 * Math.sqrt(1400)) - 0.9) < 1e-9);

  // 변환을 빼먹으면 감쇠비가 그대로 계수가 되어 1 미만이 된다.
  assert.ok(spatial.damping > 10, '감쇠계수가 감쇠비로 잘못 넘어갔다');
});

test('spatial은 ζ=0.9, effects는 ζ=1 (임계 감쇠)', () => {
  const ratio = (s: { stiffness: number; damping: number }) =>
    s.damping / (2 * Math.sqrt(s.stiffness));
  for (const key of ['fastSpatial', 'defaultSpatial', 'slowSpatial'] as const) {
    assert.ok(Math.abs(ratio(SPRING[key]) - 0.9) < 1e-9, key);
  }
  for (const key of ['fastEffects', 'defaultEffects', 'slowEffects'] as const) {
    assert.ok(Math.abs(ratio(SPRING[key]) - 1) < 1e-9, key);
  }
});

test('globals.css의 --radius-* 가 shape scale과 일치한다', () => {
  const css = readFileSync(
    new URL('../app/globals.css', import.meta.url),
    'utf8',
  );
  const expected: Record<string, number> = {
    none: SHAPE.none,
    xs: SHAPE.extraSmall,
    sm: SHAPE.small,
    md: SHAPE.medium,
    lg: SHAPE.large,
    'lg-increased': SHAPE.largeIncreased,
    xl: SHAPE.extraLarge,
    'xl-increased': SHAPE.extraLargeIncreased,
    xxl: SHAPE.extraExtraLarge,
    full: SHAPE.full,
  };

  for (const [name, px] of Object.entries(expected)) {
    const m = css.match(new RegExp(`--radius-${name}:\\s*(\\d+)px;`));
    assert.ok(m, `globals.css에 --radius-${name} 이 없다`);
    assert.equal(Number(m[1]), px, `--radius-${name}`);
  }

  // 스펙에 없는 값이 섞여 들어오는 것을 막는다 (예전에 36px이 있었다).
  const allowed = new Set(Object.values(SHAPE).map(String));
  for (const m of css.matchAll(/--radius-[a-z-]+:\s*(\d+)px;/g)) {
    assert.ok(allowed.has(m[1]), `M3 shape scale에 없는 값: ${m[1]}px`);
  }
});

test('round / square 컨테이너 형태가 스펙 값이다', () => {
  // md.comp.button.medium: round=full, square=corner-large, pressed=corner-medium
  assert.equal(BUTTON.medium.shapeRound, SHAPE.full);
  assert.equal(BUTTON.medium.shapeSquare, SHAPE.large);
  assert.equal(BUTTON.medium.pressedShape, SHAPE.medium);

  // md.comp.icon-button.medium은 버튼과 같은 값, large는 square가 corner-extra-large
  assert.equal(ICON_BUTTON.medium.shapeSquare, SHAPE.large);
  assert.equal(ICON_BUTTON.large.shapeSquare, SHAPE.extraLarge);
  assert.equal(ICON_BUTTON.large.height, 96);
  assert.equal(ICON_BUTTON.large.iconSize, 32);
});

test('M3 Expressive 타입 role을 보간하지 않고 그대로 쓴다', () => {
  assert.deepEqual(TYPESCALE.displayMedium, {
    size: '2.8125rem',
    lineHeight: '3.25rem',
    weight: 400,
    emphasizedWeight: 500,
  });
  assert.deepEqual(TYPESCALE.headlineMedium, {
    size: '1.75rem',
    lineHeight: '2.25rem',
    weight: 400,
    emphasizedWeight: 500,
  });
});

test('Multi-browse는 Figma 외곽 치수와 조정한 focal 폭을 쓴다', () => {
  assert.equal(MULTI_BROWSE_CAROUSEL.leadingSpace, 16);
  assert.equal(MULTI_BROWSE_CAROUSEL.betweenSpace, 8);
  assert.equal(MULTI_BROWSE_CAROUSEL.itemShape, SHAPE.extraLarge);
  assert.equal(MULTI_BROWSE_CAROUSEL.minimumItemWidth, 44);
  assert.deepEqual(MULTI_BROWSE_CAROUSEL.compact, {
    viewportWidth: 412,
    height: 221,
    itemHeight: 205,
    largeWidth: 176,
  });
  assert.deepEqual(MULTI_BROWSE_CAROUSEL.medium, {
    viewportWidth: 600,
    height: 220,
    itemHeight: 204,
    largeWidth: 268,
  });
});

test('비선택 항목은 선택 항목에서 멀수록 남은 폭을 적게 가져간다', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(multiBrowseWeight), [0, 4, 2, 1, 1]);
});

test('tokens.css의 Multi-browse 치수가 시스템 상수와 일치한다', () => {
  const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
  const expected = {
    'leading-space': MULTI_BROWSE_CAROUSEL.leadingSpace,
    'between-space': MULTI_BROWSE_CAROUSEL.betweenSpace,
    'compact-height': MULTI_BROWSE_CAROUSEL.compact.height,
    'compact-item-height': MULTI_BROWSE_CAROUSEL.compact.itemHeight,
    'minimum-item-width': MULTI_BROWSE_CAROUSEL.minimumItemWidth,
    'medium-viewport': MULTI_BROWSE_CAROUSEL.medium.viewportWidth,
    'medium-height': MULTI_BROWSE_CAROUSEL.medium.height,
    'medium-item-height': MULTI_BROWSE_CAROUSEL.medium.itemHeight,
    'compact-large-width': MULTI_BROWSE_CAROUSEL.compact.largeWidth,
    'medium-large-width': MULTI_BROWSE_CAROUSEL.medium.largeWidth,
  };

  for (const [name, px] of Object.entries(expected)) {
    assert.match(css, new RegExp(`--carousel-${name}:\\s*${px}px;`));
  }
});
