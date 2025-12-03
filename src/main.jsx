import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { AppProvider } from "./context/AppContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <App /> 컴포넌트 전체를 <AppProvider>로 감쌉니다. */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
