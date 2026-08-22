// eslint-config-next 16은 flat config 배열을 직접 export한다.
// @eslint/eslintrc의 FlatCompat은 eslintrc 스키마로 검증하려다 실패하므로 쓰지 않는다.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'out/**'] },
  ...nextCoreWebVitals,
];

export default config;
