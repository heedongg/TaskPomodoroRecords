import React, { useReducer, useEffect } from "react";
import { appReducer } from "./AppReducer";
import { AppContext } from "../hooks/useAppContext";
import { initialState } from "./initialState";
import { useDebounce } from "../hooks/useDebounce";

const LOCAL_STORAGE_KEY = "pomodoro-app-state";

export function AppProvider({ children }) {
  // useReducer(리듀서, 초기값, 초기화함수)
  // 3번째 인자인 '함수'는 앱이 시작될 때 딱 한 번 실행되어 '초기 state'를 만듭니다.
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    // parsedState는 "앱이 시작될 때 사용할 최종 데이터"를 담는 변수
    let parsedState;
    // 로컬스토리지 데이터 불러오기
    try {
      const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedState) {
        parsedState = JSON.parse(storedState); // 저장된 게 있으면 그걸 씀
      } else {
        parsedState = init; // 없으면 기본값(initialState) 씀
      }
    } catch (e) {
      console.error("로컬스토리지 파싱 실패", e);
      parsedState = init;
    }

    // 타이머 복원 로직 사용자가 브라우저를 끄거나 탭을 닫았다가 다시 돌아왔을 때를 처리합니다.
    const timer = parsedState.timer;
    const settings = parsedState.settings;
    // 타이머가 돌아가는중 + endTime의 값이 있으면
    if (timer.isRunning && timer.endTime) {
      const newSecondsLeft = Math.max(
        0,
        Math.round((timer.endTime - Date.now()) / 1000)
      );
      timer.secondsLeft = newSecondsLeft;
    } /* 앱을 껐을 때 타이머가 '멈춰' 있었다면? */ else {
      timer.secondsLeft =
        (timer.mode === "WORK" ? settings.workTime : settings.restTime) * 60;
      timer.endTime = null;
    }
    parsedState.timer = timer;
    return parsedState; // 이 데이터로 앱이 시작
  });

  // state가 변경되면 0.5초(500ms) 기다리는 값을 생성
  const debouncedState = useDebounce(state, 500);

  // 로컬스토리지 저장은 'debouncedState'를 기준으로 실행
  useEffect(() => {
    try {
      // debouncedState가 변했을 때만(즉, 0.5초마다 혹은 그 이상 간격으로) 저장.
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(debouncedState));
    } catch (e) {
      console.error("로컬스토리지 저장 실패", e);
    }
  }, [debouncedState]);

  // 전역 타이머 (setInterval) 로직
  useEffect(() => {
    let interval = null;
    // 타이머가 '실행 중' + '시간이 남았을 때'만 작동
    if (state.timer.isRunning && state.timer.secondsLeft > 0) {
      // 1초마다 반복
      interval = setInterval(() => {
        // 'TICK'이라는 신호를 Reducer에 보냄. (1초 지났으니 시간 줄이고 확인ㄱㄱ)
        dispatch({ type: "TICK" });
      }, 1000);
    }
    return () => {
      // 컴포넌트가 사라지거나, 일시정지되면 타이머를 끔.
      // 안 끄면 메모리 누수가 발생해서 컴퓨터가 느려짐.
      if (interval) clearInterval(interval);
    };
  }, [state.timer.isRunning, state.timer.secondsLeft]);

  return (
    // value={{ state, dispatch }} -> 나의 모든 자식들에게 state(데이터)와 dispatch(리모컨)를 방송
    // dispatch로 명령받는게 정의 되서 useReudcer의 기능을 갖다 쓸 수 있음.
    // "내 자식들({children})은 이 리모컨(dispatch)을 써도 된다!"
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
