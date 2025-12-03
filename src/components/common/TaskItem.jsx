import React from "react";
import { useAppContext } from "../../hooks/useAppContext";
import "./TaskItem.css";

// props로 'task' 객체를 받음. (예: { id: 123, name: 'React 공부' })
function TaskItem({ task }) {
  // 전역 dispatch 함수를 가져옴.
  const { dispatch } = useAppContext();

  const handleDelete = () => {
    // 삭제 버튼 클릭 시 사용자가 '확인'을 누르면 true, '취소'를 누르면 false가 반환됩니다.
    if (
      window.confirm(
        `'${task.name}' 태스크를 정말 삭제하시겠습니까?\n(관련된 공부 기록도 모두 삭제됩니다)`
      )
    ) {
      dispatch({
        type: "DELETE_TASK", // 리듀서가 받을 명령
        payload: task.id, // 이 태스크의 id를 payload로 전달
      });
    }
  };

  return (
    // 리스트 아이템 (<li> 태그)
    <li className="task-item">
      {/* 태스크 이름 보여주기 */}
      <span className="task-name">{task.name}</span>
      {/* 삭제 버튼 */}
      {/* 클릭하면 위에서 만든 handleDelete 함수가 실행됨 */}
      <button onClick={handleDelete} className="delete-button">
        삭제
      </button>
    </li>
  );
}

export default TaskItem;
