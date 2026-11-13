import styles from './Toast.module.css'

// TODO: 피그마 아이콘 SVG(icon/check, 정보 아이콘)를 받으면 여기에 연결
const TOAST_ICONS = {
  success: null,
  simple: null,
  notice: null,
}

/**
 * 토스트 한 개의 모양 (피그마 Feedback/Toast, node 47:976)
 * - type: 'success'(제목+설명) | 'simple'(제목만) | 'notice'(안내·실패, 회색 아이콘 배경)
 * 화면에 띄우는 건 ToastProvider의 showToast()로 함
 */
export default function Toast({ type = 'success', title, description, leaving = false }) {
  const classNames = [styles.toast, leaving && styles.leaving].filter(Boolean).join(' ')
  const iconWrapClass = [styles.iconWrap, type === 'notice' && styles.iconWrapNotice]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} role={type === 'notice' ? 'alert' : 'status'}>
      <div className={iconWrapClass} aria-hidden="true">
        {TOAST_ICONS[type]}
      </div>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {type === 'success' && description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  )
}
