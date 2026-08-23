// 확장자를 포함한 상대 경로 — config/·lib/는 Node 네이티브 테스트 러너가
// 실파일명을 요구하므로 이 규칙을 유지한다. 컴포넌트는 @/ 별칭을 쓴다.
import type { TokenName } from '../lib/tokens.ts';

/** @theme에 실제로 존재하는 브랜드 색 토큰 이름만 허용한다. */
export type BrandColor = Extract<TokenName, `brand-${string}`>;

/**
 * M3 Expressive shape 어휘 — MaterialShapes의 실제 이름과 기하학을 쓴다.
 * 도형은 장식이 아니라 식별자다: 번호가 "순서"를 잘못 주장했던 자리를 대신해
 * "순서 없는 구별되는 넷"을 말한다.
 * 넷의 실루엣이 충분히 달라야 식별자로 기능한다 — cookie9와 cookie12는
 * 서로 너무 닮아서 하나만 쓴다.
 */
export type StageShape = 'clover4' | 'verySunny' | 'pill' | 'bun';

export interface StageProject {
  title: string;
  description: string;
  imageUrl: string;
  href?: string;
}

export interface StageData {
  /** 앵커 id·key로 쓰는 슬러그. 화면에 번호로 노출되지 않는다. */
  slug: string;
  title: string;
  description: string;
  /**
   * 도형 안에 잘려 들어갈 사진. 없으면 브랜드 색 단색으로 렌더된다.
   * 앱 스크린샷·홍보 카드를 넣지 말 것
   */
  image?: string;
  /**
   * 도형 크기.
   */
  scale: 'sm' | 'md' | 'lg' | 'xl';
  /** @theme의 --color-brand-* 이름. 오타는 tsc가 잡는다 */
  color: BrandColor;
  /** 이 활동의 shape 식별자 */
  shape: StageShape;
  projects?: StageProject[];
}

export const STAGES: StageData[] = [
  {
    slug: 'study',
    image: '/images/study/blog.webp',
    scale: 'md',
    title: 'Study',
    description:
      '관심 기술을 함께 학습하며 지식을 나누는 소규모 모임입니다.\n혼자서는 얻을 수 없는 것을 함께 만듭니다.',
    color: 'brand-blue',
    shape: 'clover4',
    projects: [
      {
        title: 'JavaScript Deep Dive',
        description: 'JavaScript Deep Dive를 함께 읽고 토론하며, 웹 개발의 기반이 되는 JavaScript의 동작 원리와 핵심 개념을 깊이 있게 살펴보았습니다.',
        imageUrl: '/images/study/deep-dive.webp',
      },
      {
        title: '만들어요 나만의 블로그',
        description: '나만의 기술 블로그를 직접 기획하고 개발하며, 하나의 웹 서비스를 처음부터 끝까지 만들어보았습니다.',
        imageUrl: '/images/study/blog.webp',
      },
      {
        title: '대규모 시스템 설계',
        description: '대규모 트래픽을 처리하는 시스템의 설계 방식과 기술을 함께 공부하고, 각자의 프로젝트에 적용하며 아키텍처 설계 역량을 키웠습니다.',
        imageUrl: '/images/study/system-design.webp',
      },
      {
        title: '딥러닝 학당',
        description: '딥러닝 논문을 함께 읽고 분석하며, 복잡한 모델과 연구의 구조를 이해하고 논문을 읽는 방법을 익혔습니다.',
        imageUrl: '/images/study/deep-learning.webp',
      },
      {
        title: 'KU버네티스 공식문서 스터디',
        description: '쿠버네티스 공식 문서를 함께 읽고 발표하며, 쿠버네티스의 핵심 개념과 동작 방식을 체계적으로 공부했습니다.',
        imageUrl: '/images/study/k8s.webp',
      },
    ],
  },
  {
    slug: 'techtalk',
    image: '/images/techtalk/session.webp',
    scale: 'lg',
    title: 'Tech Talk\n& Hands-on',
    description:
      '개발자들이 인사이트와 경험을 공유하고 발표하는 기술 세미나,\n그리고 직접 만들어보는 실습 워크숍입니다.',
    color: 'brand-red',
    shape: 'verySunny',
  },
  {
    slug: 'solution',
    image: '/images/solution/challenge.webp',
    scale: 'lg',
    title: 'Solution Challenge',
    description:
      'UN 지속가능발전목표(SDGs)가 제시하는 세계의 문제를,\n우리가 만든 제품으로 해결합니다.',
    color: 'brand-yellow',
    shape: 'pill',
    projects: [
      {
        title: 'Atempo',
        description: '2025년 Most Social Impact Award(TOP 3)에 선정되었습니다.',
        imageUrl: '/images/solution/atempo.webp',
        href: 'https://github.com/gdgoc-konkuk/24-25-proj-Atempo-Client',
      },
      {
        title: 'PathPal',
        description: '2024년 Global TOP 100에 선정되었습니다.',
        imageUrl: '/images/solution/pathpal.webp',
        href: 'https://github.com/GDSC-PathPal',
      },
      {
        title: 'Glow-Alarm',
        description: '2024년 Global TOP 100에 선정되었습니다.',
        imageUrl: '/images/solution/glowalarm.webp',
        href: 'https://github.com/sound-light',
      },
    ],
  },
  {
    slug: 'kprintf',
    image: '/images/kprintf/2026-speaker.webp',
    scale: 'xl',
    title: 'Kprintf',
    description:
      '건국대학교에서 직접 개최하는 테크 컨퍼런스입니다.\n200여명의 학생 개발자가 모여 기술 세션을 듣고, 연사와 커피챗을 나눕니다.',
    color: 'brand-green',
    shape: 'bun',
    projects: [
      {
        title: 'Kprintf 2026',
        description: '현업 개발자와 함께하는 교류',
        imageUrl: '/images/kprintf/2026-hall.webp',
      },
      {
        title: 'Kprintf 2025',
        description: '200여명의 학생 개발자들이 함께한 뜻깊은 시간',
        imageUrl: '/images/kprintf/2025.webp',
      },
      {
        title: 'Kprintf 2024',
        description: '건국대학교에서 개최된 첫 번째 테크 컨퍼런스',
        imageUrl: '/images/kprintf/2024.webp',
      },
      {
        title: '다양한 기술 세션',
        description: '최신 기술 트렌드와 개발 경험 공유',
        imageUrl: '/images/kprintf/sessions.webp',
      },
      {
        title: '연사자분들과 커피챗',
        description: '선배 개발자와의 네트워킹 기회',
        imageUrl: '/images/kprintf/coffee-chat.webp',
      },
    ],
  },
];
