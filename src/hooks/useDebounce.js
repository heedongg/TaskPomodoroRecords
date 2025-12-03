import { useState, useEffect } from "react";

// 'value'가 바뀔 때마다 'delay'만큼 기다렸다가
// 최신 'value'를 반환하는 훅
export function useDebounce(value, delay) {
  // 지연된 값을 저장할 변수를 만듦. 처음에 들어온 value를 바로 넣어서 시작합니다.
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // delay 이후에 debouncedValue를 value로 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // value나 delay가 바뀌면 (새로운 변경이 들어오면)
    // 기존 타이머를 취소하고 새 타이머를 설정
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
