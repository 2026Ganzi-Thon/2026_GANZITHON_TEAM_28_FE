import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])'

// 모달·시트 바깥에서 마지막으로 포커스됐던 요소 (닫을 때 돌아갈 곳)
// 시트 안 입력칸이 바로 포커스를 받거나(G-02), 시트에서 다른 시트·모달을 연 경우(G-01 → G-02·G-03)에도
// 처음 시트를 연 화면의 버튼(예: 목표 카드 ⋯)으로 돌아가게 함
let lastFocusedOutside = null
if (typeof document !== 'undefined') {
  document.addEventListener(
    'focusin',
    (event) => {
      if (event.target instanceof HTMLElement && !event.target.closest('[role="dialog"]')) {
        lastFocusedOutside = event.target
      }
    },
    true,
  )
}

/**
 * 모달·시트 포커스 규칙 (피그마 Accessibility · 2. 키보드 · 포커스)
 * - 열리면 제목(titleRef 또는 titleId)으로 포커스 이동 — 안쪽에 autoFocus 요소가 있으면 그대로 둠
 * - Tab이 바깥으로 못 나가게 가둠
 * - Esc = 닫기 (딤 탭과 동일)
 * - 닫히면 열었던 버튼으로 포커스 복귀
 */
export function useDialogFocus(open, { containerRef, titleRef, titleId, onDismiss }) {
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  })

  useEffect(() => {
    if (!open) return
    const active = document.activeElement
    // 열 때 포커스가 이미 다른 모달·시트 안에 있으면, 그 바깥의 마지막 요소를 돌아갈 곳으로
    const activeOutside = active instanceof HTMLElement && active !== document.body && !active.closest('[role="dialog"]')
    if (activeOutside) lastFocusedOutside = active // focusin을 못 받은 경우(창이 비활성)에도 기록
    const opener = activeOutside ? active : lastFocusedOutside
    const container = containerRef.current
    if (container && !container.contains(document.activeElement)) {
      const title = titleRef?.current ?? (titleId ? document.getElementById(titleId) : null)
      ;(title ?? container).focus()
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onDismissRef.current?.()
        return
      }
      if (event.key !== 'Tab' || !container) return
      const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest('[aria-hidden="true"]'))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // 다른 모달·시트로 넘어가는 중이면 그쪽이 포커스를 가져가므로 건드리지 않음
      const target = opener?.isConnected ? opener : lastFocusedOutside?.isConnected ? lastFocusedOutside : null
      if (target) requestAnimationFrame(() => !document.activeElement?.closest('[role="dialog"]') && target.focus())
    }
  }, [open, containerRef, titleRef, titleId])
}
