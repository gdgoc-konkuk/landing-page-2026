'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import StateLayer from './StateLayer';
import Icon from './Icon';
import { arrowForward } from '@/lib/icons';
import { BUTTON, SHAPE, SPRING, TYPESCALE } from '@/lib/m3';
import type { RecruitState } from '@/lib/recruit';

/**
 * CTA. M3 medium 버튼 스펙을 그대로 쓴다 —
 * 컨테이너 높이 56, 좌우 여백 24, 아이콘 24, 아이콘-라벨 간격 8
 * (md.comp.button.medium).
 *
 * 눌리면 코너가 full → corner-medium(12px)으로 조여든다. 이건 내가 고른 연출이
 * 아니라 스펙에 있는 동작이다: md.comp.button.medium.pressed-container-shape =
 * corner-medium, 전환은 spring.fast-spatial. 이전 구현은 코너 값도 스프링도
 * 임의로 정했고 hover에 스펙에 없는 scale(1.03)을 얹었다.
 *
 * hover에서 elevation level1(1px)이 붙는다 — M3 filled와 filled tonal
 * 버튼의 hover-container-elevation이 모두 level1이다.
 *
 * 형태는 round(pill)가 아니라 **square 변형**을 쓴다. M3 Expressive는
 * container-shape-round / container-shape-square 두 갈래를 정식으로 주고,
 * medium의 square는 corner-large(16px)다. 완전한 pill만이 Material인 게 아니다.
 *
 * 모집 상태로 코너를 한 단계 조이는 것은 스펙 위에 얹은 이 페이지의 확장이다.
 * 마감이 다가오면 corner-small(8)로 각을 세워 형태만으로 상태가 읽히게 한다.
 * 값은 shape scale 안에서만 고른다.
 *
 * 라벨 크기는 title-medium(1rem, weight 500) — md.comp.button.medium.label-text가
 * 가리키는 값이다. 이전에는 var(--text-lede)(최대 1.375rem)를 넣어서 버튼 안
 * 글자가 본문보다 컸다.
 */
const SHAPE_BY_STATE: Record<RecruitState, number> = {
  open: BUTTON.medium.shapeSquare,
  closing: SHAPE.small,
  closed: BUTTON.medium.shapeSquare,
};

interface ChipProps {
  href: string;
  state: RecruitState;
  /**
   * 'on-accent' — 학교색 필드 위 (히어로·푸터). paper 컨테이너 + accent 글자.
   * 'on-paper'  — 밝은 배경 위. accent 컨테이너 + paper 글자.
   * 'secondary' — accent 배경 위에서 분리되는 filled tonal 컨테이너.
   * 초록 위에 초록 버튼을 놓으면 보이지 않으므로 반전이 필요하다.
   */
  tone?: 'on-accent' | 'on-paper' | 'secondary';
  children: ReactNode;
}

export default function Chip({
  href,
  state,
  tone = 'on-paper',
  children,
}: ChipProps) {
  const palette = {
    'on-accent': 'bg-on-primary text-primary',
    'on-paper': 'bg-primary text-on-primary',
    secondary: 'bg-secondary-container text-on-secondary-container',
  }[tone];

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`m3-button group relative inline-flex items-center overflow-hidden whitespace-nowrap ${palette}`}
      style={{
        height: BUTTON.medium.height,
        paddingLeft: BUTTON.medium.space,
        paddingRight: BUTTON.medium.space,
        gap: BUTTON.medium.iconLabelSpace,
        fontSize: TYPESCALE.titleMedium.size,
        lineHeight: TYPESCALE.titleMedium.lineHeight,
        fontWeight: TYPESCALE.titleMedium.weight,
      }}
      initial={false}
      animate={{ borderRadius: SHAPE_BY_STATE[state] }}
      whileTap={{ borderRadius: BUTTON.medium.pressedShape }}
      transition={{
        borderRadius: SPRING.fastSpatial,
      }}
    >
      <StateLayer />
      <span className="relative">{children}</span>
      <span className="relative flex">
        <Icon data={arrowForward} size={BUTTON.medium.iconSize} />
      </span>
    </motion.a>
  );
}
