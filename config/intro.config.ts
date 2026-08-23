export interface IntroConfig {
  heading: string;
  body: string[];
  chapterFactsConfirmed: boolean;
  needed: string[];
}

export const INTRO: IntroConfig = {
  heading: 'GDG on Campus란',
  body: [
    'GDG on Campus는 대학을 기반으로 활동하는 학생 개발자 커뮤니티입니다. 관심 있는 기술을 함께 공부하고, 서로의 경험을 나누며, 직접 무언가를 만들어보는 활동을 이어갑니다.',
    'GDGoC Konkuk은 건국대학교에서 활동하는 챕터입니다. 정기 스터디부터 기술 발표와 실습형 세미나, 프로젝트, 네트워킹까지 다양한 활동을 진행합니다. 매년 개발자 컨퍼런스 Kprintf를 열고, Google Solution Challenge를 통해 실제 문제를 해결하는 프로젝트에도 도전하고 있습니다.',
    '혼자 공부하는 데서 끝나지 않고, 배운 것을 나누고 함께 만들어보는 것.\nGDGoC Konkuk은 그런 경험을 함께하는 커뮤니티입니다.',
  ],

  chapterFactsConfirmed: true,

  needed: [],
};
