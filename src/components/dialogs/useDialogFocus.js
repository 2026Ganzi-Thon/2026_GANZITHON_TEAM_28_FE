import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])'

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
    const opener = document.activeElement
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
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [open, containerRef, titleRef, titleId])
}
