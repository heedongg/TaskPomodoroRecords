import React from "react";
import "./Header.css";

// Layout의 onSettingsClick함수 prop.
function Header({ onSettingsClick }) {
  return (
    <header className="header">
      <span className="header-title">Pomodoro Focus</span>
      <button onClick={onSettingsClick} className="settings-icon">
        ⚙️
      </button>
    </header>
  );
}

export default Header;
