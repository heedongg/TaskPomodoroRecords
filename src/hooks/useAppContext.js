// createContext: 전역 데이터를 담을 '빈 보관함'을 만드는 도구.
// useContext: 보관함에 있는 데이터를 '꺼내 쓰는' 도구.
import { createContext, useContext } from "react";

// 보관함 생성
export const AppContext = createContext(null);

// 커스텀 훅 만들기
export const useAppContext = () => {
  // 데이터 꺼내기 시도
  const context = useContext(AppContext);
  // 안전 장치
  if (!context) {
    throw new Error("useAppContext는 AppProvider 안에서만 사용해야 합니다.");
  }
  // 진짜 데이터({state, dispatch})를 반환
  return context;
};
