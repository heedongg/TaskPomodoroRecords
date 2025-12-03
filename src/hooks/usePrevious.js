import { useRef, useEffect } from "react";

// 'value'의 "직전" 값을 기억하여 반환하는 훅
export function usePrevious(value) {
  // useRef: 리액트에게 "몰래 데이터를 저장할 상자 하나 줘"라고 요청
  const ref = useRef();

  // 렌더링이 끝난 후, 'ref.current'를 새 value로 업데이트
  useEffect(() => {
    ref.current = value;
  }, [value]);

  // ESLint 경고만 비활성화합니다.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return ref.current; // 과거의 값 반환
}
