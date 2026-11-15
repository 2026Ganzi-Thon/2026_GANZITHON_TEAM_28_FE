import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { screens } from './pages/routes.js'
import NewGoalPage from './pages/new-goal/NewGoalPage.jsx'
import ActionPage from './pages/action-suggestion/ActionPage.jsx'
import PausePage from './pages/pause/PausePage.jsx'
import HomePage from './pages/home/HomePage.jsx'
import { ToastProvider } from './components/feedback/ToastProvider.jsx'
import ReconnectToast from './components/feedback/ReconnectToast.jsx'
import './styles/global.css'

// 공통 컴포넌트 미리보기 (/dev/components) — 개발 모드에서만, 배포 빌드에는 빠짐
const ComponentsPreview = import.meta.env.DEV ? lazy(() => import('./pages/dev/ComponentsPreview.jsx')) : null

// 완성된 화면만 여기에 연결. 나머지는 임시 화면(Placeholder)으로 보여줌
const pages = {
  'S-02': <HomePage />,
  'S-03': <NewGoalPage />,
  'S-04': <ActionPage />,
  'S-05': <PausePage />,
}

/** 아직 안 만든 화면: 제목 + 화면 목록 (개발용) */
function Placeholder({ title }) {
  return (
    <div className="placeholder">
      <h1>{title}</h1>
      <nav aria-label="화면 목록">
        <ul>
          {screens.map(({ id, path, title }) => (
            <li key={id}>
              <Link to={path.replace(':goalId', 'demo')}>{title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function App() {
  return (
    <main>
      <Routes>
        {screens.map(({ id, path, title }) => (
          <Route key={id} path={path} element={pages[id] ?? <Placeholder title={title} />} />
        ))}
        {ComponentsPreview && (
          <Route
            path="/dev/components"
            element={
              <Suspense fallback={null}>
                <ComponentsPreview />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<Placeholder title="페이지를 찾을 수 없어요" />} />
      </Routes>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ReconnectToast />
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
