import React, { useState } from "react";
import { useAppContext } from "../hooks/useAppContext"; // state와 dispatch를 가져오기 위해
import TaskItem from "../components/common/TaskItem";
import "./TasksPage.css";

function TasksPage() {
  // 데이터 저장소 연결
  // tasks: 이미 저장된 할 일 목록을 보여주기 위해 가져옴
  // dispatch: 새로운 할 일을 추가하라는 명령을 내리기 위해 가져옴
  const { state, dispatch } = useAppContext();

  // '새 태스크 추가' 폼의 input 값을 관리할 로컬 state
  const [taskName, setTaskName] = useState("");

  // 폼 제출(태스크 추가) 핸들러
  const handleSubmit = (e) => {
    // 기본 동작 막기 form 태그는 전송 시 페이지를 새로고침하는 기본 성질이 있음.
    // SPA(Single Page Application)에서는 새로고침되면 데이터가 날아가므로 이를 preventDefault()를 통해 막음.
    e.preventDefault(); // 페이지 새로고침 방지
    const nameToAdd = taskName.trim(); // 공백 제거한 이름

    // 유효성 검사
    // 빈 공백만 입력하거나 아무것도 입력하지 않았을 때를 방어.
    if (nameToAdd === "") {
      alert("태스크 이름을 입력해주세요.");
      return;
    }

    // state.tasks 배열을 뒤져서, 똑같은 이름이 하나라도 있는지 확인(some)
    const isDuplicate = state.tasks.some((task) => task.name === nameToAdd);

    if (isDuplicate) {
      alert("이미 존재하는 태스크 이름입니다.");
      return; // 중복이면 여기서 함수를 끝내서 dispatch를 막음
    }

    // 액션 발송 (Dispatch)
    // 리듀서에게 "ADD_TASK"를 전달.
    dispatch({
      type: "ADD_TASK", // 주문 메뉴
      payload: {
        id: Date.now(), // 고유 ID로 현재 시간을 사용 - 밀리초를 사용해서 중복 방지
        name: taskName.trim(),
      },
    });

    // 입력 후 input 필드 비우기
    setTaskName("");
  };

  return (
    <div className="tasks-page">
      {/* 입력 폼 섹션*/}
      <section className="task-form-section">
        <h2>새 태스크 추가</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <input
            type="text"
            // 양방향 바인딩
            // value와 onChange를 연결하여, 리액트 상태(taskName)와 화면의 인풋창 값이 항상 똑같도록 동기화.
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="태스크 이름을 입력하세요"
            className="task-input"
          />
          <button type="submit" className="add-button">
            추가
          </button>
        </form>
      </section>
      {/* 리스트 출력 섹션 */}
      <section className="task-list-section">
        <h2>등록된 태스크</h2>
        <ul className="task-list">
          {/* 조건부 렌더링 */}
          {/* 태스크가 하나도 없으면 안내 문구를, 있으면 리스트를 보여줌. */}
          {state.tasks.length === 0 ? (
            <p className="empty-message">등록된 태스크가 없습니다.</p>
          ) : (
            // state.tasks 배열을 순회하며 TaskItem 컴포넌트 렌더링
            state.tasks.map((task) => <TaskItem key={task.id} task={task} />)
          )}
        </ul>
      </section>
    </div>
  );
}

export default TasksPage;
