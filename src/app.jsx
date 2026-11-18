import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './components/feedback/ToastProvider.jsx'
import ReconnectToast from './components/feedback/ReconnectToast.jsx'
import StatusScreen from './components/feedback/StatusScreen.jsx'
import HomePage from './pages/home/HomePage.jsx'
import NewGoalPage from './pages/new-goal/NewGoalPage.jsx'
import ActionPage from './pages/action-suggestion/ActionPage.jsx'
import PausePage from './pages/pause/PausePage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import OnboardingPage from './pages/onboarding/OnboardingPage.jsx'
import AiConsentPage from './pages/onboarding/AiConsentPage.jsx'
import HistoryPage from './pages/history/HistoryPage.jsx'
import GoalEndingPage from './pages/goal-ending/GoalEndingPage.jsx'
import GoalCompletedPage from './pages/goal-ending/GoalCompletedPage.jsx'
import CrisisSupportPage from './pages/crisis-support/CrisisSupportPage.jsx'
import SettingsPage from './pages/settings/SettingsPage.jsx'
import WithdrawalPage from './pages/settings/WithdrawalPage.jsx'
import ReminderPage from './pages/settings/ReminderPage.jsx'
import GardenPage from './pages/garden/GardenPage.jsx'
import './styles/global.css'
import './styles/assigned.css'

/** 통합 진입점. 각 담당자의 화면과 공통 컴포넌트를 그대로 연결한다. */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ReconnectToast />
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/onboarding/ai-consent" element={<AiConsentPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/goals/new" element={<NewGoalPage />} />
            <Route path="/goals/:goalId/action" element={<ActionPage />} />
            <Route path="/goals/:goalId/pause" element={<PausePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/garden" element={<GardenPage />} />
            <Route path="/garden/archive" element={<GardenPage archive />} />
            <Route path="/goals/:goalId/end" element={<GoalEndingPage />} />
            <Route path="/goals/:goalId/completed" element={<GoalCompletedPage />} />
            <Route path="/support" element={<CrisisSupportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/withdrawal" element={<WithdrawalPage />} />
            <Route path="/settings/reminder" element={<ReminderPage />} />
            <Route path="*" element={<StatusScreen title="페이지를 찾을 수 없어요" actionLabel="홈으로 가기" onAction={() => window.location.assign('/')} />} />
          </Routes>
        </main>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
