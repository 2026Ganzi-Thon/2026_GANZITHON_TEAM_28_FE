import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { screens } from './pages/routes.js'
import NewGoalPage from './pages/new-goal/NewGoalPage.jsx'
import { ToastProvider } from './components/feedback/ToastProvider.jsx'
import './styles/global.css'

// 완성된 화면만 여기에 연결. 나머지는 임시 화면(Placeholder)으로 보여줌
const pages = {
  'S-03': <NewGoalPage />,
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
        <Route path="*" element={<Placeholder title="페이지를 찾을 수 없어요" />} />
      </Routes>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
