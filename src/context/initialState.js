export const initialState = {
  tasks: [],
  records: [],
  // 사용자 설정값
  settings: {
    workTime: 25,
    restTime: 5,
    darkMode: false,
  },
  // 타이머의 현재 상태 (전역 관리)
  timer: {
    secondsLeft: 25 * 60, // 남은 시간(초)
    isRunning: false,
    mode: "WORK",
    selectedTaskId: null,
    endTime: null, // 종료 예정 시각 (백그라운드 실행용)
  },
};
