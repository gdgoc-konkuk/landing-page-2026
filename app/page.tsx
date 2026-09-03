import NavBar from './_components/nav/NavBar';
import RecruitToolbar from './_components/nav/RecruitToolbar';
import Hero from './_components/hero/Hero';
import IntroSection from './_components/intro/IntroSection';
import Stage from './_components/stage/Stage';
import { ShapeDefs } from './_components/stage/Shape';
import Footer from './_components/footer/Footer';
import { RECRUIT } from '@/config/recruit.config';
import { STAGES } from '@/config/stages.config';
import { resolveRecruitState, msLeft } from '@/lib/recruit';

// 상태 판정이 빌드 시점에 굳지 않도록 주기적으로 재생성한다.
// 카운트다운 자체는 클라이언트가 매초 다시 재므로 캐시가 흔들려도 되지만,
// open/closing/closed 판정은 서버 렌더 값이라 1시간마다 갱신한다.
export const revalidate = 3600;

export default function Home() {
  const now = new Date();
  const state = resolveRecruitState(RECRUIT, now);
  const left = msLeft(RECRUIT, now);

  return (
    <>
      {/* clipPath 정의는 페이지에 한 번만 */}
      <ShapeDefs shapes={STAGES.map((s) => s.shape)} />
      <NavBar />
      <main>
        <Hero state={state} msLeft={left} />
        <IntroSection />
        {STAGES.map((stage, i) => (
          <Stage key={stage.slug} data={stage} index={i} />
        ))}
      </main>
      <Footer />
      <RecruitToolbar state={state} msLeft={left} />
    </>
  );
}
