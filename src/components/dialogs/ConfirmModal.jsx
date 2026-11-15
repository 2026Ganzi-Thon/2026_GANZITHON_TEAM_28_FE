import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from '../buttons/Button.jsx'
import styles from './ConfirmModal.module.css'
import { useDialogFocus } from './useDialogFocus.js'

/**
 * 확인 모달 (피그마 Overlay/Modal, node 9:128)
 * - 왼쪽 Secondary 버튼, 오른쪽 Primary 버튼
 * - 딤을 누르거나 Esc를 누르면 onDismiss (S-04b에서는 '계속하기'와 같은 동작)
 * - 열리면 제목으로 포커스, Tab은 모달 안에만, 닫히면 열었던 버튼으로 복귀
 * - icon: 아이콘 요소 (모달마다 달라서 밖에서 넘겨줌: 달, 휴지통, 연필 등)
 * - description의 줄바꿈(\n)은 그대로 줄바꿈으로 보여줌
 */
export default function ConfirmModal({
  open,
  icon,
  title,
  description,
  secondaryLabel,
  primaryLabel,
  onSecondary,
  onPrimary,
  onDismiss,
  primaryLoading = false,
  secondaryTone = 'default', // 'danger'면 왼쪽 버튼 글자를 오류 색으로 (G-03 지우기)
}) {
  const titleId = useId()
  const descriptionId = useId()

  const containerRef = useRef(null)
  const titleRef = useRef(null)
  useDialogFocus(open, { containerRef, titleRef, onDismiss })

  if (!open) return null

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.dim} onClick={onDismiss} aria-hidden="true" />
      <div
        ref={containerRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        {icon && (
          <div className={styles.iconWrap} aria-hidden="true">
            {icon}
          </div>
        )}
        <div className={styles.text}>
          <p id={titleId} ref={titleRef} className={styles.title} tabIndex={-1}>
            {title}
          </p>
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            className={[styles.action, secondaryTone === 'danger' && styles.danger].filter(Boolean).join(' ')}
            onClick={onSecondary}
          >
            {secondaryLabel}
          </Button>
          <Button className={styles.action} onClick={onPrimary} loading={primaryLoading}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
