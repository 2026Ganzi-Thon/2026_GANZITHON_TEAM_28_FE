import { useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './BottomSheet.module.css'
import { useDialogFocus } from './useDialogFocus.js'

/**
 * 바텀시트 틀 (피그마 Overlay/BottomSheet/*)
 * - 위쪽 손잡이(Grabber) + children
 * - 딤을 누르거나 Esc를 누르면 onClose
 * - labelledBy: 시트 제목 요소의 id (스크린리더용) — 열리면 그 제목으로 포커스
 * - Tab은 시트 안에만, 닫히면 열었던 버튼으로 복귀
 */
export default function BottomSheet({ open, onClose, labelledBy, children }) {
  const sheetRef = useRef(null)
  useDialogFocus(open, { containerRef: sheetRef, titleId: labelledBy, onDismiss: onClose })

  if (!open) return null

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.dim} onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <div className={styles.grabberRow} aria-hidden="true">
          <span className={styles.grabber} />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
