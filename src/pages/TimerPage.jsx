import React, { useEffect, useMemo, useCallback } from "react";
import { useAppContext } from "../hooks/useAppContext";
import TimerDisplay from "../components/timer/TimerDisplay";
import "./TimerPage.css";
import { usePrevious } from "../hooks/usePrevious";

function TimerPage() {
  // 전역 상태 가져오기
  // Context에서 우리에게 필요한 데이터(state)와 리모컨(dispatch)을 꺼냄.
  const { state, dispatch } = useAppContext();
  const { tasks, settings } = state;
  const { secondsLeft, isRunning, mode, selectedTaskId } = state.timer;

  // 태스크 ID 목록 계산 (최적화)
  // tasks가 바뀔 때만 다시 계산하도록 메모.
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  // 선택된 태스크 유효성 검사
  // ID 목록에 selectedTaskId가 포함되어 있는지 확인.
  const selectedTaskExists = taskIds.includes(selectedTaskId);

  // 최종 선택된 태스크 ID 결정
  // 유효하면 -> 선택된 ID 사용 | 유효하지 않은데 목록은 있다면 -> 첫 번째 태스크 사용 | 아예 없으면 -> null
  const effectiveSelectedTask = selectedTaskExists
    ? selectedTaskId
    : tasks.length > 0
    ? tasks[0].id
    : null;

  // 태스크 자동 선택 (유효하지 않을 때 리셋)
  // 유효하지 않아서 다른 걸로 바꿨다면, 전역 상태(selectedTaskId)도 업데이트 (자동 수정)
  useEffect(() => {
    if (effectiveSelectedTask !== selectedTaskId) {
      dispatch({ type: "SET_SELECTED_TASK", payload: effectiveSelectedTask });
    }
  }, [effectiveSelectedTask, selectedTaskId, dispatch]);

  // 모드 변경 알림
  // "이전 모드" 기억(커스텀 훅) 화면이 그려지기 직전의 mode 값을 가져옴.
  const prevMode = usePrevious(mode);
  useEffect(() => {
    if (prevMode !== undefined && prevMode !== mode) {
      if (mode === "BREAK") alert("작업 완료! 휴식을 시작하세요.");
      else if (mode === "WORK" && prevMode === "BREAK") {
        alert("휴식 완료! 다음 작업을 시작하세요.");
      }
    }
  }, [mode, prevMode]);

  // 총 시간 계산
  // 링 그래프를 그릴 때 '전체 시간 대비 남은 시간' 비율을 알아야 하므로 계산
  const totalSeconds = useMemo(
    () => (mode === "WORK" ? settings.workTime : settings.restTime) * 60,
    [mode, settings.workTime, settings.restTime]
  );
  // 0으로 나누기 에러 방지용
  const safeTotalSeconds = totalSeconds === 0 ? 1 : totalSeconds;

  // 타이머가 "시작되었는지" (조금이라도 흘렀는지) 확인
  const isTimerStarted = secondsLeft !== totalSeconds;

  // STOP 핸들러
  const handleCancel = useCallback(() => {
    if (
      // 브라우저 기본 알림창(확인/취소)을 띄움.
      window.confirm(
        "작업을 중단하고 기록하시겠습니까? (1분 미만은 기록되지 않습니다)"
      )
    ) {
      // 총 시간 - 남은 시간
      const elapsedSeconds = safeTotalSeconds - secondsLeft;
      // 분 단위 변환 + 초 단위 버리기
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);

      dispatch({
        type: "CANCEL_TIMER",
        payload: { duration: elapsedMinutes > 0 ? elapsedMinutes : 0 },
      });
    }
  }, [dispatch, safeTotalSeconds, secondsLeft]);

  return (
    <div className="timer-page">
      {/* 모드 표시 (WORK / BREAK) */}
      <div className="mode-indicator">{mode}</div>
      {/* 원형 타이머 (남은 시간과 총 시간을 넘겨줘서 그래프를 그리게 함) */}
      <TimerDisplay secondsLeft={secondsLeft} totalSeconds={safeTotalSeconds} />

      {/* 태스크 선택 드롭다운 */}
      <div className="task-selector">
        <label htmlFor="task-select">현재 작업:</label>
        <select
          id="task-select"
          value={effectiveSelectedTask || ""}
          onChange={(e) =>
            dispatch({
              type: "SET_SELECTED_TASK",
              payload: Number(e.target.value),
            })
          }
          // 태스크가 없거나, 실행 중이거나, 일시정지 중이라도 진행 중이면 변경 불가!
          disabled={tasks.length === 0 || isRunning || isTimerStarted}
        >
          {tasks.length > 0 ? (
            // 태스크가 있을 때: 배열을 돌면서 <option> 태그들을 만듦
            tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))
          ) : (
            // 태스크가 없을 때: 안내 메시지 <option> 하나만 보여줌
            <option value="">태스크 페이지에서 태스크를 추가해주세요</option>
          )}
        </select>
      </div>

      {/* 조건부 렌더링: 상황에 맞는 버튼만 보여줌 */}
      <div className="timer-controls">
        {/* 멈춰있을 때 -> START 버튼 */}
        {!isRunning ? (
          <button
            onClick={() => dispatch({ type: "START_TIMER" })}
            className="control-button start"
          >
            START
          </button>
        ) : (
          /* 실행 중일 때 -> PAUSE 버튼 */
          <button
            onClick={() => dispatch({ type: "PAUSE_TIMER" })}
            className="control-button pause"
          >
            PAUSE
          </button>
        )}
        {/* 항상 보이는 RESET 버튼 */}
        <button
          onClick={() => dispatch({ type: "RESET_TIMER" })}
          className="control-button reset"
        >
          RESET
        </button>
        {/* 휴식 중이고 멈춰있을 때 -> SKIP 버튼 */}
        {!isRunning && mode === "BREAK" && (
          <button
            onClick={() => dispatch({ type: "SWITCH_MODE" })}
            className="control-button skip"
          >
            SKIP
          </button>
        )}
        {/* 작업 중이고 실행 중일 때 -> STOP 버튼 */}
        {isRunning && mode === "WORK" && (
          <button onClick={handleCancel} className="control-button cancel">
            STOP
          </button>
        )}
      </div>
    </div>
  );
}

export default TimerPage;
