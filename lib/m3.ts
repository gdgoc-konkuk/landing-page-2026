/**
 * Material 3 Expressive 시스템 값.
 *
 * 전부 Material Web의 생성된 토큰 파일에서 그대로 옮겼다 —
 * design system "Google Material 3", version 34.0.21, platform web.
 *   tokens/versions/latest/sass/_md-sys-shape.scss
 *   tokens/versions/latest/sass/_md-sys-state.scss
 *   tokens/versions/latest/sass/_md-sys-elevation.scss
 *   tokens/versions/latest/sass/_md-sys-motion.scss
 *   tokens/versions/latest/sass/_md-comp-button-{small,medium}.scss
 *   tokens/versions/latest/sass/_md-comp-icon-button-{small,medium}.scss
 *   tokens/versions/latest/sass/_md-comp-assist-chip.scss
 *   Material 3 Design Kit: Typography, Carousel, Extended FAB
 *
 * 이 파일의 숫자를 눈대중으로 고치지 말 것.
 */

/** md.sys.shape.corner.* (px) */
export const SHAPE = {
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
} as const;

/** md.sys.state.*.state-layer-opacity */
export const STATE_LAYER = {
  hover: 0.08,
  focus: 0.1,
  pressed: 0.1,
  dragged: 0.16,
  disabled: 0.38,
} as const;

/** md.sys.elevation.level0..5 (px) */
export const ELEVATION = [0, 1, 3, 6, 8, 12] as const;

export interface Spring {
  type: 'spring';
  stiffness: number;
  damping: number;
}

/**
 * M3의 spring damping은 **감쇠비**(ζ, 무차원)이고 motion의 damping은
 * **감쇠계수**(c)다. 그대로 넘기면 0.9가 사실상 감쇠 없음이 되어 한없이 출렁인다.
 *
 * 질량 1에서 c = ζ · 2 · √k 이므로 그 변환을 여기서 한 번만 한다.
 */
export function spring(stiffness: number, dampingRatio: number): Spring {
  return {
    type: 'spring',
    stiffness,
    damping: dampingRatio * 2 * Math.sqrt(stiffness),
  };
}

/**
 * md.sys.motion.spring.*
 * spatial은 위치·크기·형태처럼 공간을 움직이는 값(ζ=0.9, 약간 통통 튄다),
 * effects는 색·불투명도처럼 튀면 안 되는 값(ζ=1, 임계 감쇠)에 쓴다.
 */
export const SPRING = {
  fastSpatial: spring(1400, 0.9),
  defaultSpatial: spring(700, 0.9),
  slowSpatial: spring(300, 0.9),
  fastEffects: spring(3800, 1),
  defaultEffects: spring(1600, 1),
  slowEffects: spring(800, 1),
} as const;

/**
 * md.sys.typescale.* — 이 페이지에서 쓰는 Baseline/Emphasis 역할.
 * md.comp.button.medium.label-text = title-medium,
 * md.comp.assist-chip.label-text  = label-large.
 */
export const TYPESCALE = {
  displayLarge: {
    size: '3.5625rem',
    lineHeight: '4rem',
    weight: 400,
    emphasizedWeight: 500,
  },
  displayMedium: {
    size: '2.8125rem',
    lineHeight: '3.25rem',
    weight: 400,
    emphasizedWeight: 500,
  },
  displaySmall: {
    size: '2.25rem',
    lineHeight: '2.75rem',
    weight: 400,
    emphasizedWeight: 500,
  },
  headlineLarge: {
    size: '2rem',
    lineHeight: '2.5rem',
    weight: 400,
    emphasizedWeight: 500,
  },
  headlineMedium: {
    size: '1.75rem',
    lineHeight: '2.25rem',
    weight: 400,
    emphasizedWeight: 500,
  },
  titleLarge: {
    size: '1.375rem',
    lineHeight: '1.75rem',
    weight: 400,
    emphasizedWeight: 700,
  },
  titleMedium: { size: '1rem', lineHeight: '1.5rem', weight: 500 },
  bodyLarge: {
    size: '1rem',
    lineHeight: '1.5rem',
    weight: 400,
    emphasizedWeight: 500,
  },
  bodyMedium: {
    size: '0.875rem',
    lineHeight: '1.25rem',
    weight: 400,
    emphasizedWeight: 500,
  },
  labelLarge: { size: '0.875rem', lineHeight: '1.25rem', weight: 500 },
} as const;

/**
 * md.comp.button.{small,medium}
 *
 * M3 Expressive는 컨테이너 형태를 round / square 두 갈래로 준다
 * (container-shape-round / container-shape-square). 완전한 pill만 있는 게
 * 아니라 "약간 사각"이 정식 변형이고, 사이즈가 커질수록 square의 코너도 커진다.
 */
export const BUTTON = {
  small: {
    height: 40,
    iconSize: 20,
    /** leading/trailing space */
    space: 16,
    iconLabelSpace: 8,
    shapeRound: SHAPE.full,
    shapeSquare: SHAPE.medium,
    pressedShape: SHAPE.small,
  },
  medium: {
    height: 56,
    iconSize: 24,
    space: 24,
    iconLabelSpace: 8,
    shapeRound: SHAPE.full,
    shapeSquare: SHAPE.large,
    pressedShape: SHAPE.medium,
  },
} as const;

/** md.comp.icon-button.{small,medium,large} */
export const ICON_BUTTON = {
  small: {
    height: 40,
    iconSize: 24,
    space: 8,
    shapeRound: SHAPE.full,
    shapeSquare: SHAPE.medium,
    pressedShape: SHAPE.small,
  },
  medium: {
    height: 56,
    iconSize: 24,
    space: 16,
    shapeRound: SHAPE.full,
    shapeSquare: SHAPE.large,
    pressedShape: SHAPE.medium,
  },
  large: {
    height: 96,
    iconSize: 32,
    space: 32,
    shapeRound: SHAPE.full,
    shapeSquare: SHAPE.extraLarge,
    pressedShape: SHAPE.medium,
  },
} as const;

/** Material 3 Design Kit · Carousel · Layout=Multi-browse. 폭은 랜딩 화면에 맞춘다. */
export const MULTI_BROWSE_CAROUSEL = {
  leadingSpace: 16,
  betweenSpace: 8,
  itemShape: SHAPE.extraLarge,
  minimumItemWidth: 44,
  compact: {
    viewportWidth: 412,
    height: 221,
    itemHeight: 205,
    largeWidth: 176,
  },
  medium: {
    viewportWidth: 600,
    height: 220,
    itemHeight: 204,
    largeWidth: 268,
  },
} as const;

/** 선택 항목을 제외한 남은 폭의 배분 비율: 가까울수록 더 많이 가져간다. */
export function multiBrowseWeight(distance: number): number {
  const safeDistance = Math.min(3, Math.max(0, Math.trunc(Math.abs(distance))));
  return [0, 4, 2, 1][safeDistance];
}
