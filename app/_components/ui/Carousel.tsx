'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import StateLayer from './StateLayer';
import Icon from './Icon';
import { chevronLeft, chevronRight } from '@/lib/icons';
import { ICON_BUTTON, multiBrowseWeight, SPRING, STATE_LAYER } from '@/lib/m3';
import type { StageProject } from '@/config/stages.config';

/**
 * Material 3 Carousel · Multi-browse.
 *
 * Figma의 높이, 여백, shape는 유지한다. focal item은 화면 피드백에 맞춰
 * 조금 줄이고, 나머지 폭은 거리 가중치 4:2:1로 나눠 채운다.
 *
 * Item order is stable. The selected item gets the large width, then items become
 * medium and small as their distance from the focal item grows. Motion performs the
 * redistribution with layout transforms. The strip stays manual: arrow buttons,
 * direct selection, or swipe.
 *
 * The Figma building block hides carousel text. A 56px small item cannot carry the
 * old title/description stack without breaking the component, so only the selected
 * item's metadata is shown in a stable region below the strip.
 */
export default function Carousel({
  items,
  label,
}: {
  items: StageProject[];
  label: string;
}) {
  const [active, setActive] = useState(0);

  const step = useCallback(
    (dir: -1 | 1) => {
      if (items.length < 2) return;
      setActive((current) =>
        Math.min(items.length - 1, Math.max(0, current + dir)),
      );
    },
    [items.length],
  );

  const safeActive = items.length === 0 ? 0 : active % items.length;
  const selected = items[safeActive];

  if (items.length === 0) return null;

  return (
    <div role="group" aria-label={label}>
      <div className="m3-multibrowse-viewport overflow-x-auto">
        <motion.ul
          data-count={items.length}
          className="m3-multibrowse-track flex"
          drag={items.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40) step(1);
            if (info.offset.x > 40) step(-1);
          }}
        >
          {items.map((item, index) => {
            const distance = Math.min(3, Math.abs(index - safeActive));
            return (
              <motion.li
                key={item.title}
                data-distance={distance}
                className="m3-multibrowse-item"
                style={{ flexGrow: multiBrowseWeight(distance) }}
                layout
                transition={{ layout: SPRING.fastSpatial }}
              >
                <button
                  type="button"
                  aria-label={`${item.title} 보기`}
                  aria-pressed={index === safeActive}
                  onClick={() => setActive(index)}
                  className="text-on-surface group relative block h-full w-full overflow-hidden"
                  style={{ borderRadius: 'var(--radius-xl)' }}
                >
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="176px"
                    className="object-cover"
                  />
                  <StateLayer />
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div aria-live="polite" className="min-w-0">
          <p className="m3-title-medium text-on-surface">
            {selected.href ? (
              <a
                href={selected.href}
                target="_blank"
                rel="noopener noreferrer"
                className="decoration-outline hover:decoration-primary active:decoration-primary inline-flex min-h-[44px] items-center whitespace-nowrap underline underline-offset-4"
              >
                {selected.title}
              </a>
            ) : (
              <span className="inline-flex min-h-[44px] items-center">
                {selected.title}
              </span>
            )}
          </p>
          <p className="m3-body-medium text-on-surface-variant max-w-[46ch]">
            {selected.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavButton
            dir="prev"
            disabled={safeActive === 0}
            onClick={() => step(-1)}
            label={`${label} 이전`}
          />
          <NavButton
            dir="next"
            disabled={safeActive === items.length - 1}
            onClick={() => step(1)}
            label={`${label} 다음`}
          />
        </div>
      </div>
    </div>
  );
}

/** M3 tonal icon button, medium square variant. */
function NavButton({
  dir,
  disabled,
  onClick,
  label,
}: {
  dir: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`${disabled ? 'text-on-surface' : 'text-on-secondary-container'} group relative grid place-items-center overflow-hidden disabled:pointer-events-none`}
      style={{
        width: ICON_BUTTON.medium.height,
        height: ICON_BUTTON.medium.height,
      }}
      initial={false}
      animate={{ borderRadius: ICON_BUTTON.medium.shapeSquare }}
      whileTap={{ borderRadius: ICON_BUTTON.medium.pressedShape }}
      transition={{ borderRadius: SPRING.fastSpatial }}
    >
      <span
        aria-hidden="true"
        className={`${disabled ? 'bg-surface-container' : 'bg-secondary-container'} absolute inset-0`}
        style={{ opacity: disabled ? STATE_LAYER.pressed : 1 }}
      />
      <StateLayer />
      <span
        className="relative flex"
        style={{ opacity: disabled ? STATE_LAYER.disabled : 1 }}
      >
        <Icon
          data={dir === 'prev' ? chevronLeft : chevronRight}
          size={ICON_BUTTON.medium.iconSize}
        />
      </span>
    </motion.button>
  );
}
