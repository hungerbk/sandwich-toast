# 테스트

- `npm run check`: 린트·타입·테스트·라이브러리/데모 빌드·용량 검사를 순서대로 실행합니다. CI도 Node 24.13.0에서 `npm ci` 후 같은 명령을 사용합니다.
- `npm run check:size`: 기존 `dist`의 용량을 확인합니다. 먼저 `npm run build`를 실행하세요.
- `npm test`: 테스트를 한 번 실행합니다(CI에서도 동일한 명령 사용).
- `npm run test:watch`: 변경 시 테스트를 다시 실행합니다.
- `npm run typecheck`: 제품 코드와 테스트 코드의 타입을 검사합니다.

현재 store와 toast API의 기본값·옵션·삭제 계약, 타이머의 pause/resume/reset과 정렬 훅의 생명주기를 검증합니다. 타이머는 일반 모드와 StrictMode 양쪽에서 확인합니다. jsdom은 브라우저 DOM을 모사하며 실제 레이아웃이나 스크린리더를 검증하지 않습니다. 실제 낭독, 이미지 품질, 화면 가장자리 잘림, 글자 확대는 브라우저에서 별도로 확인해야 합니다.

공개 Toaster의 hover/focus/클릭, 삭제 경합과 애니메이션 정리도 검증합니다. 애니메이션 완료는 mock으로 제어하며 시각 효과는 확인하지 않습니다.

SSR은 브라우저 전역이 없는 Node 환경에서 서버 호출의 no-op과 렌더링을 확인합니다. hydration은 jsdom에서 일반 모드와 StrictMode의 DOM 유지·portal·자동 종료를 확인합니다. nonce 속성도 확인하지만 실제 CSP 차단 여부나 Next.js RSC 통합까지 검증하지는 않습니다.

키보드 테스트는 6개 위치의 방향키 순서·재정렬·경계, 보조키 이벤트 보존, 삭제 후 포커스 복원과 라벨 연결을 확인합니다. jsdom은 Tab 탐색이나 Enter/Space의 네이티브 클릭을 자동 실행하지 않으므로 해당 키를 가로채지 않는지만 검사합니다. 실제 브라우저의 기본 키 동작은 수동 확인 대상입니다.

live region 테스트는 초기 빈 영역, status/alert 분리, 재정렬 시 노드 유지와 추가·삭제만 확인합니다. 중복·누락 없는 실제 낭독을 보장하는 테스트가 아니며 연속 알림 낭독 개선은 별도 이슈 범위입니다.

CI는 모든 PR과 main push 및 수동 실행에서 동작합니다. 필수 검사로 지정하려면 GitHub 브랜치 보호 설정에서 CI의 check 작업을 선택하세요.

용량 예산은 #40 기준으로 WebP 합계 90,000 bytes, ESM 145,000/gzip 100,000 bytes, CJS 140,000/gzip 100,000 bytes입니다. Node zlib 기본 gzip 옵션으로 측정하며 하나라도 초과하면 실패합니다. ESM/CJS는 합산하지 않습니다. 예산 변경은 원인과 품질을 검토한 뒤 결정합니다.

표시 정책은 scale 입력 보정, 대기열 없는 활성 카드 표시, 중복 Toaster의 개발 경고와 비차단을 검증합니다. production 경고 분기는 환경 값을 바꿔 확인하며 production React 번들 실행을 대신하지 않습니다.

공개 API에는 생성된 토스트의 duration 변경 기능이나 Toaster의 초기 paused prop이 없습니다. duration 갱신 계약을 새로 정의하는 테스트는 추가하지 않습니다. 최초 paused는 훅 경계조건으로, 공개 Toaster의 pause는 hover/focus 이벤트로 확인합니다.

최종 수동 QA에서는 320px 화면, 6개 위치, scale 0.5~1.5, 긴 메시지·글자 확대, 포커스 테두리·키보드 안내의 잘림, 모션 감소, 실제 스크린리더 낭독을 확인하세요. jsdom의 scale/DOM 검사는 레이아웃 검증이 아닙니다.
