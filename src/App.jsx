import React, { useState, useEffect } from "react";
// 리액트 라우터: 페이지 이동을 담당하는 핵심 도구들
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./App.css";

// 커스텀 훅: 전역 상태(다크모드 설정값)를 가져오기 위해 필요
import { useAppContext } from "./hooks/useAppContext";

// 페이지 컴포넌트
import TimerPage from "./pages/TimerPage";
import TasksPage from "./pages/TasksPage";
import StatsPage from "./pages/StatsPage";

// 레이아웃 컴포넌트
import Header from "./components/layout/Header";
import BottomNav from "./components/layout/BottomNav";

// 모달 컴포넌트
import SettingsModal from "./components/common/SettingsModal";

function Layout() {
  // 모달 표시 여부를 Layout에서 관리
  const [showSettings, setShowSettings] = useState(false);

  // 전역 state에서 darkMode 값을 가져옴
  const { state } = useAppContext();
  const { darkMode } = state.settings;

  // darkMode 값이 바뀔 때마다 body 태그에 class 적용
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]); // darkMode가 true/false로 바뀔 때마다 실행

  return (
    // 최상위 컨테이너 'dark' 클래스를 붙여주면, 하위 모든 컴포넌트(CSS)들이 .app-container.dark { ... } 규칙을 따라가며 색이 변함.
    <div className={darkMode ? "app-container dark" : "app-container"}>
      {/* 상단 헤더 */}
      {/* 헤더의 톱니바퀴 버튼을 누르면 -> setShowSettings(true) 실행 -> 모달 열림 */}
      <Header onSettingsClick={() => setShowSettings(true)} />

      {/* Outlet (콘텐츠 구멍) */}
      {/* 여기가 바로 '바뀌는 부분'. URL이 '/'면 TimerPage가, '/tasks'면 TasksPage가 이 자리에 끼워집니다. */}
      <main className="main-content">
        <Outlet />
      </main>
      {/* 하단 내비게이션 */}
      <BottomNav />
      {/* 설정 모달 (팝업) */}
      {/* 평소에는 안 보이다가 showSettings가 true일 때만 화면 덮으면서 등장 */}
      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

function App() {
  return (
    // BrowserRouter: 리액트 라우터 기능을 활성화합니다. (주소창 감시 시작)
    <BrowserRouter>
      {/* 부모 경로 (Layout) */}
      {/* 모든 주소("/")는 일단 Layout 컴포넌트를 먼저 그립니다. */}
      <Routes>
        {/* Layout 컴포넌트를 부모 경로로 사용 */}
        <Route path="/" element={<Layout />}>
          {/* 자식 경로 (Outlet에 들어갈 것들) */}
          <Route index element={<TimerPage />} /> {/* path="/" (홈) */}
          <Route path="tasks" element={<TasksPage />} /> {/* path="/tasks" */}
          <Route path="stats" element={<StatsPage />} /> {/* path="/stats" */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
