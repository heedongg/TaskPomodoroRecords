import { initialState } from "./initialState";

// state (현재 상태) -> "지금 우리 앱의 데이터가 어떤 상태야?"
// action (요청 사항) -> " 뭘 어떻게 바꾸라고?"
// 내용물: 우리가 dispatch로 보낸 쪽지(객체).
export const appReducer = (state, action) => {
  switch (action.type) {
    // 공장 초기화
    case "RESET_APP": {
      return { ...initialState }; // 초기 상태(initialState)를 복사해서 그대로 반환
    }
    // 저장된 데이터 불러오기
    case "LOAD_SAVED_STATE": {
      return { ...action.payload }; // 로컬스토리지에서 가져온 데이터(payload)로 전체 상태를 덮어씌움
    }
    // 태스크 추가
    case "ADD_TASK": {
      const newTask = action.payload;
      return {
        // ...state: 원본 내용을 그대로 복사해서 가져옴.
        ...state,
        tasks: [...state.tasks, newTask], // 기존 태스크 목록 뒤에 추가
      };
    }
    // 태스크 삭제
    case "DELETE_TASK": {
      const taskIdToDelete = action.payload;
      return {
        ...state,
        // 태스크 목록에서 해당 ID를 가진 태스크 제거 (filter 사용)
        tasks: state.tasks.filter((task) => task.id !== taskIdToDelete),
        // 기록(records) 목록에서도 해당 태스크와 관련된 기록을 모두 제거
        records: state.records.filter(
          (record) => record.taskId !== taskIdToDelete
        ),
      };
    }
    // 기록 추가
    case "ADD_RECORD": {
      const newRecord = action.payload;
      return {
        ...state,
        records: [...state.records, newRecord], // 기존 기록 목록 뒤에 추가
      };
    }

    // 설정 변경
    case "UPDATE_SETTINGS": {
      const newSettings = { ...state.settings, ...action.payload };
      // 타이머의 남은 시간을 '현재 남은 시간' 그대로 둠. 만약 타이머가 진행 중이라면, 이 값을 안 바꾸고 그대로 유지
      // 기본값이 유지.
      let newSecondsLeft = state.timer.secondsLeft;

      // 현재 모드의 '원래 총 시간(초)'을 계산
      const currentFullTime =
        (state.timer.mode === "WORK"
          ? state.settings.workTime
          : state.settings.restTime) * 60;

      // 타이머가 멈춰있고(!isRunning) AND "아직 시작 안 한 상태"일 때만
      //    새 설정에 맞춰 시간을 리셋합니다.
      if (
        !state.timer.isRunning &&
        state.timer.secondsLeft === currentFullTime
      ) {
        // 시간 변경 허용
        newSecondsLeft =
          (state.timer.mode === "WORK"
            ? newSettings.workTime
            : newSettings.restTime) * 60;
      }

      return {
        ...state,
        settings: newSettings,
        timer: { ...state.timer, secondsLeft: newSecondsLeft },
      };
    }
    // 현재 작업 선택
    case "SET_SELECTED_TASK": {
      return {
        ...state,
        timer: { ...state.timer, selectedTaskId: action.payload },
      };
    }
    // 타이머 시작
    case "START_TIMER": {
      return {
        ...state,
        timer: {
          ...state.timer,
          isRunning: true,
          // 종료 예정 시각(endTime) 계산
          // "현재 시간(Date.now)"에 "남은 시간(초 * 1000)"을 더해서 미래의 종료 시각을 구함.
          // 이렇게 하면 브라우저를 꺼도 시간이 흐른 것처럼 계산할 수 있음.
          endTime: Date.now() + state.timer.secondsLeft * 1000,
        },
      };
    }
    // 타이머 일시정지
    case "PAUSE_TIMER": {
      return {
        ...state,
        timer: {
          ...state.timer,
          isRunning: false,
          endTime: null, // 멈췄으니까 '종료 예정 시각'은 삭제 (무효화)
        },
      };
    }
    // 타이머 리셋
    case "RESET_TIMER": {
      const resetSeconds =
        (state.timer.mode === "WORK"
          ? state.settings.workTime
          : state.settings.restTime) * 60;
      return {
        ...state,
        timer: {
          ...state.timer,
          isRunning: false,
          secondsLeft: resetSeconds,
          endTime: null,
        },
      };
    }
    // 모드 전환
    case "SWITCH_MODE": {
      const nextMode = state.timer.mode === "WORK" ? "BREAK" : "WORK";
      const nextSeconds =
        (nextMode === "WORK"
          ? state.settings.workTime
          : state.settings.restTime) * 60;
      return {
        ...state,
        timer: {
          ...state.timer,
          mode: nextMode,
          isRunning: false,
          secondsLeft: nextSeconds,
          endTime: null,
        },
      };
    }

    // 작업 중단 및 기록
    case "CANCEL_TIMER": {
      const { duration } = action.payload; // 진행한 시간(분)
      let newRecords = state.records;

      // 1분 이상 진행했다면 기록에 추가
      if (duration > 0 && state.timer.selectedTaskId) {
        const newRecord = {
          id: Date.now(),
          taskId: state.timer.selectedTaskId,
          date: new Date().toISOString(),
          duration: duration,
          completed: false,
        };
        newRecords = [...state.records, newRecord];
      }

      // 기록 후 휴식 모드로 전환
      const restSeconds = state.settings.restTime * 60;
      let nextMode = "BREAK";
      let nextSeconds = restSeconds;

      // 만약 휴식 시간이 0초라면? -> 휴식 건너뛰고 바로 작업 모드(리셋 상태)로
      if (restSeconds <= 0) {
        nextMode = "WORK";
        nextSeconds = state.settings.workTime * 60;
      }

      return {
        ...state,
        records: newRecords,
        timer: {
          ...state.timer,
          mode: nextMode,
          isRunning: false,
          secondsLeft: nextSeconds,
          endTime: null,
        },
      };
    }
    // 1초 경과
    case "TICK": {
      // "종료 예정 시간(목표)"이 없거나, "실행 중" 상태가 아니라면?
      if (!state.timer.endTime || !state.timer.isRunning) {
        return state; // "아무것도 하지 말고 돌아가라!" (무시)
      }
      // 남은 시간 재계산 "목표 시간(endTime) - 현재 시간(Date.now)" 공식 사용
      // 단순히 -1을 하는 것보다, 렉이 걸리거나 백그라운드에 갔다 와도 시간이 정확하게 맞음.
      const newSecondsLeft = Math.max(
        0,
        Math.round((state.timer.endTime - Date.now()) / 1000)
      );
      // 시간이 남았으면 시간만 업데이트
      if (newSecondsLeft > 0) {
        return {
          ...state,
          timer: { ...state.timer, secondsLeft: newSecondsLeft },
        };
      }

      // 0초 도달 시
      const currentMode = state.timer.mode;
      let newRecords = state.records;
      // '작업(WORK)' 모드 완료 시 -> '성공(true)' 기록 저장
      if (currentMode === "WORK" && state.timer.selectedTaskId) {
        const newRecord = {
          id: Date.now(),
          taskId: state.timer.selectedTaskId,
          date: new Date().toISOString(),
          duration: state.settings.workTime,
          completed: true,
        };
        newRecords = [...state.records, newRecord];
      }
      // 다음 모드(휴식 or 작업) 준비
      let nextMode = currentMode === "WORK" ? "BREAK" : "WORK";
      let nextSeconds =
        (nextMode === "WORK"
          ? state.settings.workTime
          : state.settings.restTime) * 60;
      const autoStartNext = false;

      // 다음 모드 시간이 0분이면 건너뛰기 (연쇄 알림 방지)
      if (nextSeconds <= 0 && nextMode === "BREAK") {
        nextMode = "WORK";
        nextSeconds = state.settings.workTime * 60;
        // 작업 시간도 0분이면 그냥 멈춤
        if (nextSeconds <= 0) {
          return {
            ...state,
            records: newRecords,
            timer: {
              ...state.timer,
              mode: "WORK",
              isRunning: false,
              secondsLeft: 0,
              endTime: null,
            },
          };
        }
      }
      // 최종 상태 업데이트 (기록 저장 + 모드 변경 + 타이머 멈춤)
      return {
        ...state,
        records: newRecords,
        timer: {
          ...state.timer,
          mode: nextMode,
          isRunning: autoStartNext,
          secondsLeft: nextSeconds,
          endTime: autoStartNext ? Date.now() + nextSeconds * 1000 : null,
        },
      };
    }
    default:
      return state;
  }
};
