# 테스트

- `npm test`: 테스트를 한 번 실행합니다(CI에서도 동일한 명령 사용).
- `npm run test:watch`: 변경 시 테스트를 다시 실행합니다.
- `npm run typecheck`: 제품 코드와 테스트 코드의 타입을 검사합니다.

현재 store와 toast API의 기본값·옵션·삭제 계약, 타이머의 pause/resume/reset과 정렬 훅의 생명주기를 검증합니다. 타이머는 일반 모드와 StrictMode 양쪽에서 확인합니다. jsdom은 브라우저 DOM을 모사하며 실제 레이아웃이나 스크린리더를 검증하지 않습니다. 실제 낭독, 이미지 품질, 화면 가장자리 잘림, 글자 확대는 브라우저에서 별도로 확인해야 합니다.

공개 Toaster의 hover/focus/클릭, 삭제 경합과 애니메이션 정리도 검증합니다. 애니메이션 완료는 mock으로 제어하며 시각 효과는 확인하지 않습니다.

SSR은 브라우저 전역이 없는 Node 환경에서 서버 호출의 no-op과 렌더링을 확인합니다. hydration은 jsdom에서 일반 모드와 StrictMode의 DOM 유지·portal·자동 종료를 확인합니다. nonce 속성도 확인하지만 실제 CSP 차단 여부나 Next.js RSC 통합까지 검증하지는 않습니다.

키보드·live region의 DOM 계약과 CI 구성은 #43의 다음 작업 단위에서 추가합니다.
