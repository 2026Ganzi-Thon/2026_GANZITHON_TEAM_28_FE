import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Toast from './Toast.jsx'
import styles from './Toast.module.css'

// 핸드오프 노트: Success 2.5초 / Simple 2초 / Notice 3.5초
const DURATION_MS = {
  success: 2500,
  simple: 2000,
  notice: 3500,
}
const LEAVE_ANIMATION_MS = 200

const ToastContext = createContext(null)

/**
 * 앱 전체에서 토스트를 띄우는 공급자
 * - 한 번에 하나만 보여주고, 새 토스트가 오면 이전 것을 바로 대체
 * - 닫기 버튼 없이 시간이 지나면 위로 사라짐
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timers = useRef([])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const showToast = useCallback(({ type = 'success', title, description }) => {
    clearTimers()
    const id = Date.now()
    setToast({ id, type, title, description, leaving: false })

    const duration = DURATION_MS[type] ?? DURATION_MS.success
    timers.current.push(
      setTimeout(() => {
        setToast((current) => (current?.id === id ? { ...current, leaving: true } : current))
      }, duration),
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current))
      }, duration + LEAVE_ANIMATION_MS),
    )
  }, [])

  useEffect(() => clearTimers, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={styles.container}>
        {toast && (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            leaving={toast.leaving}
          />
        )}
      </div>
    </ToastContext.Provider>
  )
}

/** 사용법: const showToast = useToast(); showToast({ type: 'success', title: '...', description: '...' }) */
export function useToast() {
  const showToast = useContext(ToastContext)
  if (!showToast) throw new Error('useToast는 ToastProvider 안에서만 쓸 수 있어요')
  return showToast
}
