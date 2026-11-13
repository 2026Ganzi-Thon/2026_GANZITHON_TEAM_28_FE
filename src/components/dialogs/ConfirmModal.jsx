import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import Button from '../buttons/Button.jsx'
import styles from './ConfirmModal.module.css'

/**
 * 확인 모달 (피그마 Overlay/Modal, node 9:128)
 * - 왼쪽 Secondary 버튼, 오른쪽 Primary 버튼
 * - 딤을 누르거나 Esc를 누르면 onDismiss (S-04b에서는 '계속하기'와 같은 동작)
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
}) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event) {
      if (event.key === 'Escape') onDismiss?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onDismiss])

  if (!open) return null

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.dim} onClick={onDismiss} aria-hidden="true" />
      <div
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
          <p id={titleId} className={styles.title}>
            {title}
          </p>
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" className={styles.action} onClick={onSecondary}>
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
