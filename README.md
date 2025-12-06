# 🍅 Pomodoro Focus (태스크 연동형 뽀모도로 타이머)

**Pomodoro Focus**는 뽀모도로 기법(25분 집중, 5분 휴식)을 기반으로, 특정 **태스크(과목/작업)**와 연동하여 학습 시간을 추적하고 통계를 제공하는 웹 애플리케이션입니다.

외부 라이브러리(Redux, Zustand 등)에 의존하지 않고, **React의 핵심 기능(Context API, useReducer, Custom Hooks)**만을 활용하여 견고한 전역 상태 관리 시스템을 직접 구현했습니다.

---

## 📚 목차

1. [주요 기능](#-주요-기능)
2. [기술 스택](#-기술-스택)
3. [프로젝트 구조](#-프로젝트-구조)
4. [설치 및 실행 방법](#-설치-및-실행-방법)
5. [핵심 기술 및 설계 의도 (Architecture)](#-핵심-기술-및-설계-의도)

---

## ✨ 주요 기능

### 1. ⏱️ 스마트 타이머

- **백그라운드 실행:** 브라우저 탭을 닫거나 다른 앱을 다녀와도 시간이 정확하게 흐릅니다. (`Date.now()` 기반 계산)
- **시각화:** 시간이 흐름에 따라 줄어드는 원형 링(Conic Gradient) 애니메이션을 제공합니다.
- **상태 관리:** 작업(WORK)과 휴식(BREAK) 모드가 자동으로 전환되며, 필요시 스킵(SKIP)하거나 중단(STOP)할 수 있습니다.

### 2. 📝 태스크 관리 (CRUD)

- 공부할 과목이나 작업을 추가하고 삭제할 수 있습니다.
- **데이터 무결성:** 태스크를 삭제하면, 관련된 과거 공부 기록들도 함께 삭제되어 데이터의 정확성을 보장합니다.
- **실수 방지:** 타이머가 진행 중일 때는 태스크를 변경할 수 없도록 잠금 처리됩니다.

### 3. 📊 데이터 통계

- **완료 vs 중단 구분:** 끝까지 수행한 횟수와 중간에 포기한 횟수를 구분하여 보여줍니다.
- **기간별 필터링:** 오늘 / 이번 주 / 전체 기간별로 학습 데이터를 필터링합니다.
- **정확한 시간 집계:** 설정 시간이 바뀌어도 과거 기록은 변하지 않도록, 기록 당시의 수행 시간(`duration`)을 저장합니다.

### 4. ⚙️ 사용자 설정

- **다크 모드:** 눈의 피로를 줄여주는 다크 테마를 지원합니다.
- **시간 커스텀:** 작업 시간과 휴식 시간을 자유롭게 설정할 수 있습니다. (진행 중인 타이머 보호 기능 포함)
- **데이터 초기화:** 앱의 모든 데이터를 공장 초기화할 수 있습니다.

---

## 🛠 기술 스택

- **Frontend:** React (Vite)
- **State Management:** Context API + useReducer (Flux Pattern)
- **Data Persistence:** LocalStorage + Custom Hook (`useDebounce`)
- **Styling:** CSS Modules (Vanilla CSS)
- **Routing:** React Router v6

---

## 📂 프로젝트 구조

    pomodoro-focus/
    ├── public/
    │   └── (favicon 등 정적 파일)
    ├── src/
    │   ├── components/              # 재사용 가능한 UI 컴포넌트
    │   │   ├── common/              # 범용 컴포넌트
    │   │   │   ├── SettingsModal.css
    │   │   │   ├── SettingsModal.jsx
    │   │   │   ├── TaskItem.css
    │   │   │   └── TaskItem.jsx
    │   │   ├── layout/              # 레이아웃 관련 (헤더, 네비게이션)
    │   │   │   ├── BottomNav.css
    │   │   │   ├── BottomNav.jsx
    │   │   │   ├── Header.css
    │   │   │   └── Header.jsx
    │   │   └── timer/               # 타이머 전용 컴포넌트
    │   │       ├── TimerDisplay.css
    │   │       └── TimerDisplay.jsx
    │   │
    │   ├── context/                 # 전역 상태 관리 (Core Logic)
    │   │   ├── AppContext.jsx       # Provider & Timer Engine
    │   │   ├── AppReducer.js        # State Management Logic
    │   │   └── initialState.js      # Data Schema
    │   │
    │   ├── hooks/                   # 커스텀 훅 (Custom Hooks)
    │   │   ├── useAppContext.js     # Context 접근용
    │   │   ├── useDebounce.js       # 성능 최적화
    │   │   └── usePrevious.js       # 이전 상태 감지
    │   │
    │   ├── pages/                   # 주요 화면 (Views)
    │   │   ├── StatsPage.css
    │   │   ├── StatsPage.jsx
    │   │   ├── TasksPage.css
    │   │   ├── TasksPage.jsx
    │   │   ├── TimerPage.css
    │   │   └── TimerPage.jsx
    │   │
    │   ├── App.css                  # 공통 레이아웃 스타일
    │   ├── App.jsx                  # 라우팅 & 레이아웃 설정
    │   ├── index.css                # 전역 스타일 (Reset, Dark Mode)
    │   └── main.jsx                 # 앱 진입점
    │
    ├── index.html
    ├── package.json
    ├── README.md
    └── vite.config.js

---

## 🚀 설치 및 실행 방법

1. **프로젝트 클론**

   ```bash
   git clone https://github.com/heedongg/TaskPomodoroRecords.git
   cd pomodoro-focus

   ```

2. **의존성 설치**

   ```bash
   npm install i
   npm install react-router-dom

   ```

3. **개발 환경 실행**
   ```bash
   npm run dev
   ```

---

💡 핵심 기술 및 설계 의도
이 프로젝트는 단순한 구현을 넘어 성능 최적화와 유지보수성을 고려하여 설계되었습니다.

1. Context API + useReducer 패턴
   이유: 타이머 상태, 태스크 목록, 설정값 등 앱 전반에 걸쳐 공유해야 할 데이터가 많아 Prop Drilling을 방지하고자 했습니다.

구현: Redux와 유사한 Flux 패턴을 적용하여, 상태 변경 로직을 AppReducer.js 한 곳에 집중시켜 유지보수성을 높였습니다.

2. 백그라운드 타이머 보정 (Time Travel)
   문제: setInterval은 브라우저 탭이 비활성화되거나 닫히면 멈추거나 느려집니다.

해결: 단순히 1초를 빼는 방식이 아니라, **"종료 예정 시각(endTime)"**을 저장하고, 매초 **(종료 시각 - 현재 시각)**을 다시 계산하는 방식을 사용했습니다. 이로 인해 앱을 껐다 켜도 시간이 정확하게 유지됩니다.

3. 성능 최적화 (useDebounce, useMemo)
   Storage I/O 최적화: 1초마다 변하는 타이머 시간을 매번 LocalStorage에 저장하면 성능 저하가 발생합니다. useDebounce 훅을 구현하여 변경이 멈춘 후 0.5초 뒤에 한 번만 저장하도록 최적화했습니다.

렌더링 최적화: 통계 페이지의 복잡한 계산(필터링, 집계)은 useMemo를 사용하여 데이터가 변경될 때만 재계산되도록 했습니다.

4. 데이터 무결성 보장
   Cascade Delete: 태스크 삭제 시 AppReducer에서 해당 태스크와 연관된 모든 records를 함께 삭제하여 고아 데이터(Orphan Data)가 발생하는 것을 방지했습니다.

스냅샷 저장: 통계 기록 시, 현재의 설정 시간(duration)과 완료 여부(completed)를 함께 저장하여, 나중에 설정을 변경해도 과거 데이터가 왜곡되지 않도록 설계했습니다.
