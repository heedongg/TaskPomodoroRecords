import React, { useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import "./SettingsModal.css";

// 총 분(Minutes)을 {시, 분} 객체로 변환
const minutesToHM = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return { h, m };
};

function SettingsModal({ show, onClose }) {
  const { state, dispatch } = useAppContext();

  // 전역 state 가져오기
  const { workTime, restTime, darkMode } = state.settings;
  const { isRunning, secondsLeft, mode } = state.timer; // 타이머 상태 가져오기 (잠금 여부 판단용)

  // 로컬 state ('초안' 데이터)
  const [localSettings, setLocalSettings] = useState(null); // 사용자가 아직 수정한 적 없음.

  // '원본' 데이터를 시/분 형태로 변환
  const work = minutesToHM(workTime);
  const rest = minutesToHM(restTime);
  const globalSettingsAsLocal = {
    workH: work.h,
    workM: work.m,
    restH: rest.h,
    restM: rest.m,
    darkMode: darkMode,
  };

  // 화면에 보여줄 데이터 결정 (수정 중이면 초안, 아니면 원본)
  const displayedSettings =
    localSettings === null ? globalSettingsAsLocal : localSettings;

  // "설정을 변경할 수 없는 상태인가?" 계산
  // 현재 모드에 따른 총 시간(초) 계산
  const currentTotalSeconds = (mode === "WORK" ? workTime : restTime) * 60;

  // 시간이 조금이라도 흘렀는지 확인 (남은 시간 != 총 시간)
  const isTimerStarted = secondsLeft !== currentTotalSeconds;

  // 최종적으로 비활성화 여부 결정 (실행 중이거나, 일시정지 상태여도 진행 중이면)
  const isLocked = isRunning || isTimerStarted;

  // [핸들러] 저장
  const handleSave = () => {
    // 저장할 데이터 확정 (수정 안 했으면 원본 그대로 저장)
    const settingsToSave =
      localSettings === null ? globalSettingsAsLocal : localSettings;
    // 시/분을 다시 '총 분'으로 합침.
    const totalWorkTime = settingsToSave.workH * 60 + settingsToSave.workM;
    const totalRestTime = settingsToSave.restH * 60 + settingsToSave.restM;
    // 전역 상태로 '최종 확정'된 값만 보냄. (여기서 실제 변경 발생)
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: {
        workTime: totalWorkTime,
        restTime: totalRestTime,
        darkMode: settingsToSave.darkMode,
      },
    });
    setLocalSettings(null);
    onClose();
  };

  // [핸들러] 취소/닫기
  const handleClose = () => {
    setLocalSettings(null); // 수정하던 거 다 날리고 초기화
    onClose();
  };

  // [핸들러] 입력 변경
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numValue = parseInt(value, 10) || 0;

    // 값을 바꾸는 순간, localSettings를 업데이트
    setLocalSettings((prevSettings) => {
      const currentSettings =
        // 이전 값이 null(원본)이었다면 원본을 복사해서 시작
        prevSettings === null ? globalSettingsAsLocal : prevSettings;
      return {
        ...currentSettings,
        [name]: type === "checkbox" ? checked : numValue,
      };
    });
  };

  // [핸들러] 데이터 초기화
  const handleReset = () => {
    if (
      window.confirm(
        "정말로 모든 태스크와 기록을 삭제하고 앱을 초기화하시겠습니까?"
      )
    ) {
      dispatch({ type: "RESET_APP" });
      onClose();
    }
  };
  // 모달이 꺼져있으면 렌더링 안 함
  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>설정</h2>
          <button onClick={handleClose} className="close-button">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* 다크 모드는 언제든 변경 가능 */}
          <div className="form-group">
            <label htmlFor="darkMode">다크 모드</label>
            <input
              type="checkbox"
              id="darkMode"
              name="darkMode"
              checked={displayedSettings.darkMode}
              onChange={handleChange}
            />
          </div>

          {/* 잠금 상태면 경고 문구 표시 */}
          {isLocked && (
            <p className="warning-text">
              ⚠️ 타이머가 진행 중(일시정지 포함)일 때는 시간을 변경할 수
              없습니다. 리셋 후 변경해주세요.
            </p>
          )}

          {/* 작업 시간 입력 창 */}
          <div className="form-group">
            <label>작업 시간:</label>
            <div className="time-inputs">
              <input
                type="number"
                name="workH"
                value={displayedSettings.workH} // 계산된 값 표시
                onChange={handleChange}
                min="0"
                disabled={isLocked} // 잠금 상태면 입력 불가
              />{" "}
              시
              <input
                type="number"
                name="workM"
                value={displayedSettings.workM}
                onChange={handleChange}
                min="0"
                max="59"
                disabled={isLocked} // 잠금 상태면 입력 불가
              />{" "}
              분
            </div>
          </div>

          {/* 휴식 시간 */}
          <div className="form-group">
            <label>휴식 시간:</label>
            <div className="time-inputs">
              <input
                type="number"
                name="restH"
                value={displayedSettings.restH}
                onChange={handleChange}
                min="0"
                disabled={isLocked} // 잠금 상태면 입력 불가
              />{" "}
              시
              <input
                type="number"
                name="restM"
                value={displayedSettings.restM}
                onChange={handleChange}
                min="0"
                max="59"
                disabled={isLocked} // 잠금 상태면 입력 불가
              />{" "}
              분
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleReset} className="reset-app-button">
            데이터 초기화
          </button>
          <button onClick={handleSave} className="save-button">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
