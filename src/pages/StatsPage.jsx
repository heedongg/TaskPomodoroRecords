import React, { useMemo, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";
import "./StatsPage.css";

// 날짜 변환기
// Date 객체(복잡함)를 '2025-11-26' 같은 단순한 문자열로 바꿈.
// 이유: 오늘이랑 날짜가 같은지 비교하기 쉽게 하기위해.
const getLocalDateString = (date) => {
  const year = date.getFullYear(); // 4자리 연도
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth는 0부터 시작 + 1자리 월을 0X월처럼 2자리로 변환.
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 시간 포맷터
// 분(minute)을 받아서 'x시간 xx분' 처럼 바꿈.
const formatMinutesToHM = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0 && m === 0) return `${h}시간`;
  return `${m}분`;
};

function StatsPage() {
  // 전역 데이터 가져오기
  const { state } = useAppContext();
  const { tasks, records } = state;
  // 로컬 상태: 필터
  // '오늘', '이번 주', '전체' 중 무엇을 볼지 결정.
  // 이 상태가 바뀌면 아래의 useMemo가 다시 실행되어 통계가 바뀜.
  const [filter, setFilter] = useState("today");

  const statsData = useMemo(() => {
    // 유효한 태스크 ID 목록 생성
    // 삭제된 태스크인지 아닌지 판별하는 용도
    const validTaskIds = new Set(tasks.map((task) => task.id));
    // 태스크 이름 사전 ID를 주면 이름을 바로 뱉어내는 사전을 만들어 검색 속도 향상
    const taskMap = tasks.reduce((acc, task) => {
      acc[task.id] = task.name;
      return acc;
    }, {});

    // 날짜 기준점
    // '오늘'과 '일주일 전' 날짜를 미리 구하기.
    const today = getLocalDateString(new Date());
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateFilteredRecords = records.filter((record) => {
      const recordDate = new Date(record.date); // 기록된 날짜 문자열을 다시 Date 객체로 복원
      if (isNaN(recordDate.getTime())) return false; // 데이터가 날짜가 아니면 버림
      if (filter === "today") return getLocalDateString(recordDate) === today; // 문자열로 바꿔서 오늘 날짜와 똑같은지 비교.
      if (filter === "week") return recordDate >= oneWeekAgo; // 기록된 날짜가 일주일 전 날짜보다 '크거나 같은지(미래인지)' 확인
      return true; // C. 필터가 '전체(all)'이면? 그냥 통과.
    });

    // 삭제된 태스크 기록 제외 (삭제된 과목은 통계에서 제외)
    const filteredRecords = dateFilteredRecords.filter((record) =>
      // 이 기록의 태스크 ID가 유효한 태스크 목록에 들어있는지 확인.
      validTaskIds.has(record.taskId)
    );

    // 총합 계산 (완료/중단 분리)
    let totalCount = 0; // 시도 횟수
    let completedCount = 0; // 성공(완료) 횟수
    let totalMinutes = 0; // 총 시간

    filteredRecords.forEach((record) => {
      totalCount++;
      totalMinutes += record.duration;

      if (record.completed) {
        completedCount++;
      }
    });

    // 태스크별 집계 (횟수 + 시간 + 완료)
    // Reduce를 써서 태스크 이름별로 데이터를 모음.
    const taskSummary = filteredRecords.reduce((acc, record) => {
      const taskName = taskMap[record.taskId];
      if (taskName) {
        // 처음 보는 태스크면 객체부터 만들기
        if (!acc[taskName]) {
          acc[taskName] = { count: 0, completedCount: 0, totalMinutes: 0 };
        }
        acc[taskName].count += 1; // 총 횟수(시도) 증가
        acc[taskName].totalMinutes += record.duration;
        if (record.completed) {
          acc[taskName].completedCount += 1; // 완료 횟수 증가
        }
      }
      return acc;
    }, {});

    // 객체를 배열로 바꾸고 정렬
    const taskSummaryArray = Object.entries(taskSummary)
      .map(([name, data]) => ({
        name,
        count: data.count, // 총 횟수
        completedCount: data.completedCount, // 완료 횟수
        totalMinutes: data.totalMinutes, // 총 시간
      }))
      // 공부 시간이 많은 순서로 내림차순 정렬.
      .sort((a, b) => b.totalMinutes - a.totalMinutes);

    // 이 객체가 statsData 변수에 들어감.
    return { totalCount, completedCount, totalMinutes, taskSummaryArray };
  }, [tasks, records, filter]);

  return (
    <div className="stats-page">
      {/* 필터 버튼  */}
      <section className="filter-section">
        {/* 버튼을 누르면 setFilter로 상태를 바꿉니다 -> useMemo 재실행 */}
        <button
          onClick={() => setFilter("today")}
          className={filter === "today" ? "active" : ""}
        >
          오늘
        </button>
        <button
          onClick={() => setFilter("week")}
          className={filter === "week" ? "active" : ""}
        >
          이번 주
        </button>
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "active" : ""}
        >
          전체
        </button>
      </section>

      {/* 총합 카드 */}
      <section className="summary-section">
        <div className="summary-card">
          <span className="card-title">총 뽀모도로 횟수</span>
          <span className="card-value">
            {statsData.totalCount} <span>회</span>
          </span>
          {/* 완료된 횟수를 부제로 표시 */}
          <span className="card-subtitle">
            {statsData.completedCount} 회 완료
          </span>
        </div>
        <div className="summary-card">
          <span className="card-title">총 집중 시간</span>
          <span className="card-value long-text">
            {/* 헬퍼 함수로 X시간 X분 포맷팅 */}
            {formatMinutesToHM(statsData.totalMinutes)}
          </span>
        </div>
      </section>

      {/* 태스크별 리스트 영역 */}
      <section className="task-summary-section">
        <h2>태스크별 통계</h2>
        <div className="task-summary-list">
          {/* 데이터가 없으면 안내 문구 */}
          {statsData.taskSummaryArray.length === 0 ? (
            <p className="empty-message">완료된 뽀모도로가 없습니다.</p>
          ) : (
            // 데이터가 있으면 map으로 반복해서 그림
            statsData.taskSummaryArray.map((task) => (
              <div key={task.name} className="task-summary-item">
                <span className="task-name">{task.name}</span>
                <div className="task-details">
                  <span className="task-minutes">
                    {formatMinutesToHM(task.totalMinutes)}
                  </span>
                  {/* "완료 / 총 횟수" 형식으로 보여줌 */}
                  <span className="task-count">
                    {task.completedCount} / {task.count} 회
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default StatsPage;
