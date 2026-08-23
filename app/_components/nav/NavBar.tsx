import Image from 'next/image';

/**
 * 로고 단독 nav. 히어로 앞의 header가 높이를 확보하고 nav는 항상 fixed다.
 *
 * header와 nav 내부 높이를 같은 80px로 맞춰 히어로를 덮지 않는다.
 *
 * 축약 로고를 쓴다 — 전체 로고는 2줄 구조라 nav 높이(24px)로 줄이면
 * 아래 줄이 읽히지 않는다.
 *
 * 하단 헤어라인은 장식이 아니다. nav 배경(paper)이 그 아래 섹션 배경과 같은
 * 색이라 선이 없으면 바가 아니라 떠 있는 로고로 보이고, 밑을 지나가는 본문과
 * 경계가 사라진다.
 */
export default function NavBar() {
  return (
    <header className="h-20">
      <nav
        aria-label="주요"
        className="site-nav bg-paper border-rule-2 fixed inset-x-0 top-0 z-50 border-b"
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center px-[clamp(1rem,4vw,1.5rem)]">
          <a
            href="#hero-heading"
            className="inline-flex min-h-[44px] items-center active:opacity-70"
            aria-label="GDGoC Konkuk 홈"
          >
            <Image
              src="/logo/gdg-konkuk-color.svg"
              alt="GDGoC Konkuk"
              width={292}
              height={34}
              className="h-6 w-auto"
            />
          </a>
        </div>
      </nav>
    </header>
  );
}
