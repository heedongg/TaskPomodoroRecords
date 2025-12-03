import React from "react";
import "./TimerDisplay.css"; // CSS

function TimerDisplay({ secondsLeft, totalSeconds }) {
  // '시:분:초' (HH:MM:SS) 포맷
  const formatTime = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSeconds = sec % 60;

    // 두 자리 맞추기 (Padding) 1분 5초 -> "01", "05"로 만듦
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    // 조건부 반환 1시간 이상이면 "00:00:00" (시:분:초)
    if (hours > 0) {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      // 1시간 미만이면 "30:00" (00분:00초) -> 공간 절약!
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  };

  // 남은 시간 비율(%) = (현재 남은 초 / 전체 초) * 100
  const remainingPercent = (secondsLeft / totalSeconds) * 100;

  return (
    <div
      className="timer-display"
      // style 속성을 이용해 CSS 변수(--remaining-percent)에 값을 주입하여 시간이 흐르는 것을 표현
      style={{ "--remaining-percent": `${remainingPercent}%` }}
    >
      {/* 도넛 모양을 만들기 위한 안쪽 마스크 */}
      <div className="timer-inner-mask">
        <h1
          className={
            secondsLeft >= 3600 ? "timer-text-long" : "timer-text-short"
          }
        >
          {formatTime(secondsLeft)}
        </h1>
      </div>
    </div>
  );
}

export default TimerDisplay;
