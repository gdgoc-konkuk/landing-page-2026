import { INTRO } from '@/config/intro.config';

/**
 * "GDG on Campus란"
 *
 * 이전 버전은 이 섹션이 없어서 페이지가 독자를 이미 아는 사람으로 가정하고
 * 곧바로 활동으로 들어갔다.
 *
 * 아이브로우 없음. 조용한 섹션이고, 히어로(초록 필드)와 활동(고채도 도형) 사이에서
 * 숨을 쉬는 자리다. 여기에 색을 더하면 앞뒤가 다 죽는다.
 */
export default function IntroSection() {
  return (
    <section
      aria-labelledby="intro-heading"
      className="bg-surface py-[clamp(4rem,10vw,8rem)]"
    >
      <div className="mx-auto max-w-6xl px-[clamp(1rem,4vw,1.5rem)]">
        <div className="grid grid-cols-1 gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
          <h2 id="intro-heading" className="m3-section-title text-on-surface">
            {INTRO.heading}
          </h2>

          <div className="max-w-[54ch]">
            {INTRO.body.map((para) => (
              /* whitespace-pre-line: 마지막 문단에 의도된 줄바꿈이 하나 있다.
                 문단을 쪼개면 그 두 줄 사이에 문단 간격이 들어가서 한 호흡으로
                 읽히지 않는다. */
              <p
                key={para.slice(0, 24)}
                className="m3-body-large text-on-surface-variant mt-0 mb-6 whitespace-pre-line last:mb-0"
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
