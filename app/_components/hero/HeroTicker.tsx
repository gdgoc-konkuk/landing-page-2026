'use client';

import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  type Transition,
  type Variants,
} from 'motion/react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Chip from '../ui/Chip';
import { BRACKET_LEFT, BRACKET_RIGHT, BRACKET_VIEWBOX } from '@/lib/bracket';
import { lerpPoints, resampleByAngle, toPath, type Pt } from '@/lib/morph';
import { shapePath, type ShapeName } from '@/lib/shapes';
import type { RecruitState } from '@/lib/recruit';

const STEPS = [
  { word: 'GDGoC', shape: 'bun' },
  { word: 'Share', shape: 'verySunny' },
  { word: 'Challenge', shape: 'pill' },
  { word: 'Together', shape: 'clover4' },
] satisfies { word: string; shape: ShapeName }[];

const VERTICES = 128;
const SAMPLES = 720;
const DWELL_MS = 2600;
const ENTER_STAGGER = 0.045;
const EXIT_STAGGER = 0.03;
const ENTER_DURATION = 0.32;
const EXIT_DURATION = 0.24;
const VERTICAL_WORD_MASK =
  'linear-gradient(to bottom, transparent 0, currentColor 0.12em, currentColor calc(100% - 0.12em), transparent 100%)';
const HORIZONTAL_WORD_MASK =
  'linear-gradient(to right, currentColor 0%, currentColor 75%, transparent 100%)';

const WORD_VARIANTS: Variants = {
  enter: {},
  center: (enterDelay = 0) => ({
    maskPosition: '0 0, 0% 0',
    transition: { delayChildren: enterDelay, staggerChildren: ENTER_STAGGER },
  }),
  exit: {
    maskPosition: '0 0, 100% 0',
    transition: {
      maskPosition: { duration: EXIT_DURATION, ease: [0.3, 0, 1, 1] },
      staggerChildren: EXIT_STAGGER,
    },
  },
};

const LETTER_VARIANTS: Variants = {
  enter: { opacity: 0, y: '70%' },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: ENTER_DURATION, ease: [0.2, 0, 0, 1] },
  },
  exit: {
    opacity: 0,
    y: '-70%',
    transition: { duration: EXIT_DURATION, ease: [0.3, 0, 1, 1] },
  },
};

interface HeroTickerProps {
  lede: string;
  deadline: string | null;
  ctaLabel: string | null;
  ctaHref: string;
  state: RecruitState;
}

/**
 * 시간 기반 Hero 대안. 기존 HeroBracket은 롤백용으로 그대로 둔다.
 * 시각 루프는 접근성 트리에서 숨기고 슬로건 전문을 한 번만 읽게 한다.
 */
export default function HeroTicker({
  lede,
  deadline,
  ctaLabel,
  ctaHref,
  state,
}: HeroTickerProps) {
  const [{ active, previous }, setStep] = useState({ active: 0, previous: 0 });
  const [pageHidden, setPageHidden] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (pageHidden || reducedMotion || interactionPaused) return;
    const timer = window.setInterval(
      () =>
        setStep(({ active: current }) => ({
          previous: current,
          active: (current + 1) % STEPS.length,
        })),
      DWELL_MS,
    );
    return () => window.clearInterval(timer);
  }, [interactionPaused, pageHidden, reducedMotion]);

  const from = previous;
  const enterDelay = reducedMotion ? 0 : wordExitDuration(from);
  const layoutTransition: Transition = reducedMotion
    ? { duration: 0 }
    : {
        layout: {
          duration: wordTransitionDuration(from, active),
          ease: [0.2, 0, 0, 1],
        },
      };

  return (
    <section className="hero-track bg-accent text-accent-ink relative flex min-h-[clamp(34rem,78svh,46rem)] items-center justify-center overflow-hidden px-[clamp(1rem,4vw,1.5rem)] pt-16 pb-24 sm:pt-20 sm:pb-28">
      <MorphBackdrop active={active} reducedMotion={reducedMotion} />

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center">
        <p
          className="mb-[clamp(0.5rem,3vw,1.5rem)] text-center"
          style={{ fontSize: 'var(--text-lede)' }}
        >
          {lede}
        </p>
        <h1
          id="hero-heading"
          className="w-full text-center"
          onMouseEnter={() => setInteractionPaused(true)}
          onMouseLeave={() => setInteractionPaused(false)}
        >
          <span className="sr-only">GDGoC: Share and Challenge, Together!</span>
          <LayoutGroup id="hero-ticker-word">
            <motion.span
              aria-hidden="true"
              layout
              transition={layoutTransition}
              className="inline-flex max-w-full items-center justify-center gap-[clamp(0.5rem,2vw,1.5rem)] whitespace-nowrap text-[clamp(2.5rem,10vw,7.5rem)] leading-[1.05] font-semibold"
            >
              <Bracket side="left" transition={layoutTransition} />

              <motion.span
                layout="size"
                transition={layoutTransition}
                className="relative inline-flex min-h-[1.37em] min-w-0 items-center overflow-visible"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={STEPS[active].word}
                    layout
                    custom={enterDelay}
                    variants={WORD_VARIANTS}
                    initial={reducedMotion ? false : 'enter'}
                    animate="center"
                    exit="exit"
                    className="inline-flex py-[0.16em]"
                    style={{
                      maskImage: `${VERTICAL_WORD_MASK}, ${HORIZONTAL_WORD_MASK}`,
                      maskPosition: '0 0, 0% 0',
                      maskRepeat: 'no-repeat',
                      maskSize: '100% 100%, 200% 100%',
                      maskComposite: 'intersect',
                      WebkitMaskImage: `${VERTICAL_WORD_MASK}, ${HORIZONTAL_WORD_MASK}`,
                      WebkitMaskPosition: '0 0, 0% 0',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskSize: '100% 100%, 200% 100%',
                      WebkitMaskComposite: 'source-in',
                    }}
                  >
                    {Array.from(STEPS[active].word).map((letter, index) => (
                      <motion.span
                        key={`${letter}-${index}`}
                        variants={LETTER_VARIANTS}
                        className="inline-block"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </motion.span>

              <Bracket side="right" transition={layoutTransition} />
            </motion.span>
          </LayoutGroup>
        </h1>

        {(ctaLabel || deadline) && (
          <div className="mt-[clamp(1.5rem,3vw,2rem)] flex flex-wrap items-center justify-center gap-2">
            {deadline && (
              <div
                className="hero-recruit-pill bg-surface-container-high text-on-surface flex h-14 min-w-0 items-center px-5"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <span className="m3-body-medium text-on-surface-variant truncate whitespace-nowrap">
                  {deadline}
                </span>
              </div>
            )}
            {ctaLabel && (
              <div className="hero-recruit-fab shrink-0">
                <Chip href={ctaHref} state={state} tone="secondary">
                  {ctaLabel}
                </Chip>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Bracket({
  side,
  transition,
}: {
  side: 'left' | 'right';
  transition: Transition;
}) {
  const paths = side === 'left' ? BRACKET_LEFT : BRACKET_RIGHT;
  const half = BRACKET_VIEWBOX.width / 2;

  return (
    <motion.span
      layout="position"
      transition={transition}
      className="inline-flex h-[0.72em] shrink-0"
    >
      <svg
        aria-hidden="true"
        viewBox={`${side === 'left' ? 0 : half} 0 ${half} ${BRACKET_VIEWBOX.height}`}
        className="fill-accent-ink h-full w-auto"
      >
        {paths.map((path) => (
          <path key={path.slice(0, 24)} d={path} />
        ))}
      </svg>
    </motion.span>
  );
}

function MorphBackdrop({
  active,
  reducedMotion,
}: {
  active: number;
  reducedMotion: boolean;
}) {
  const path = useRef<SVGPathElement>(null);
  const frames = useRef<Pt[][] | null>(null);
  const pair = useRef({ from: 0, to: 0 });
  const previous = useRef(0);
  const progress = useMotionValue(1);

  const apply = useCallback((value: number) => {
    if (!frames.current || !path.current) return;
    const { from, to } = pair.current;
    path.current.setAttribute(
      'd',
      toPath(lerpPoints(frames.current[from], frames.current[to], value)),
    );
  }, []);

  useEffect(() => {
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    const probe = document.createElementNS(namespace, 'path');
    svg.style.position = 'absolute';
    svg.style.visibility = 'hidden';
    svg.appendChild(probe);
    document.body.appendChild(svg);

    frames.current = STEPS.map(({ shape }) => {
      probe.setAttribute('d', shapePath(shape));
      const total = probe.getTotalLength();
      const points: Pt[] = [];
      for (let index = 0; index < SAMPLES; index++) {
        const point = probe.getPointAtLength((index / SAMPLES) * total);
        points.push({ x: point.x, y: point.y });
      }
      return resampleByAngle(points, VERTICES);
    });

    document.body.removeChild(svg);
    apply(1);
  }, [apply]);

  useEffect(() => {
    const from = previous.current;
    pair.current = { from, to: active };
    previous.current = active;
    progress.set(reducedMotion ? 1 : 0);
    if (reducedMotion) {
      apply(1);
      return;
    }

    const controls = animate(progress, 1, {
      duration: wordTransitionDuration(from, active),
      ease: [0.2, 0, 0, 1],
    });
    return () => controls.stop();
  }, [active, apply, progress, reducedMotion]);

  useMotionValueEvent(progress, 'change', apply);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="hero-ticker-morph" clipPathUnits="objectBoundingBox">
            <path ref={path} d={shapePath(STEPS[0].shape)} />
          </clipPath>
        </defs>
      </svg>
      <div
        className="bg-paper absolute top-1/2 left-1/2 aspect-square w-[clamp(18rem,58vmin,42rem)] -translate-x-1/2 -translate-y-1/2 opacity-12"
        style={{ clipPath: 'url(#hero-ticker-morph)' }}
      />
    </div>
  );
}

function wordTransitionDuration(from: number, to: number): number {
  const exit = wordExitDuration(from);
  const enter = ENTER_DURATION + (STEPS[to].word.length - 1) * ENTER_STAGGER;
  return exit + enter;
}

function wordExitDuration(step: number): number {
  return EXIT_DURATION + (STEPS[step].word.length - 1) * EXIT_STAGGER;
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}
