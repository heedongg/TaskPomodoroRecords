import React from "react";
import { NavLink } from "react-router-dom";
import "./BottomNav.css";

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {/*
        NavLink는 현재 주소창의 URL이 "to"에 적힌 주소와 똑같으면, 자동으로 class="nav-link active"로 변신. 
        따라서 "nav-link" 클래스만 지정해주면, 활성화 시 "nav-link active"가 되어 CSS 파일에 정의한 스타일이 적용
      */}
      <NavLink to="/" className="nav-link">
        타이머
      </NavLink>
      <NavLink to="/tasks" className="nav-link">
        태스크
      </NavLink>
      <NavLink to="/stats" className="nav-link">
        통계
      </NavLink>
    </nav>
  );
}

export default BottomNav;
