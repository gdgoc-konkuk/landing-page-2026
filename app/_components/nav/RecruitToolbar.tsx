'use client';

import { useEffect, useState } from 'react';
import Chip from '../ui/Chip';
import { useHeroPassed } from '@/lib/useHeroPassed';
import { RECRUIT } from '@/config/recruit.config';
import { isRecruiting, type RecruitState } from '@/lib/recruit';

/**
 * 따라다니는 모집 툴바. 마감 정보는 중립 pill, 행동은 M3 medium square
 * button(Extended FAB 형태)으로 분리한다. 둘의 높이는 56px로 같고 간격은 8px다.
 *
 * 히어로에서는 숨는다. 같은 CTA를 이미 크게 갖고 있어서
 * 툴바까지 띄우면 한 화면에 지원 버튼이 두 개가 된다.
 *
 */
export default function RecruitToolbar({
  state,
  deadline,
}: {
  state: RecruitState;
  deadline: string | null;
}) {
  const passed = useHeroPassed();

  if (!isRecruiting(state)) return null;

  const shown = passed;
  const deadlineLabel = deadline ?? '지원 접수 중';

  return (
    <div
      className={`site-toolbar pointer-events-none fixed inset-x-0 z-40 flex items-center justify-center transition-[opacity,visibility] ${
        shown ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
      style={{
        bottom: 'max(var(--space-lg), env(safe-area-inset-bottom))',
        paddingInline: 'var(--space-xs)',
        gap: 'var(--space-xs)',
        transitionDuration: 'var(--dur-short)',
        transitionTimingFunction: 'var(--ease-standard)',
      }}
    >
      <div
        className="recruit-toolbar-pill bg-secondary-container text-accent pointer-events-auto flex h-14 min-w-0 items-center px-5"
        style={{ borderRadius: 'var(--radius-full)' }}
      >
        <span className="m3-body-medium text-on-surface-variant truncate whitespace-nowrap">
          {deadlineLabel}
        </span>
      </div>

      <div className="recruit-toolbar-fab pointer-events-auto shrink-0">
        <Chip href={RECRUIT.applyUrl} state={state}>
          지원하기
        </Chip>
      </div>
    </div>
  );
}
