import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { screens } from './screens/routes.js'
import './styles.css'

function App() {
  return (
    <main>
      <Routes>
        {screens.map(({ id, path, title }) => (
          <Route key={id} path={path} element={<h1>{title}</h1>} />
        ))}
        <Route path="*" element={<h1>페이지를 찾을 수 없어요</h1>} />
      </Routes>
      <nav aria-label="화면 목록">
        <ul>
          {screens.map(({ id, path, title }) => (
            <li key={id}>
              <Link to={path.replace(':goalId', 'demo')}>{title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
