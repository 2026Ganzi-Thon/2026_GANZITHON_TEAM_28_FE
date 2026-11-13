import checkIcon from '../../assets/icons/check.svg'
import infoIcon from '../../assets/icons/info.svg'
import styles from './Toast.module.css'

// 피그마 Toast(47:976): Success·Simple은 icon/check, Notice는 정보 아이콘
const TOAST_ICONS = {
  success: checkIcon,
  simple: checkIcon,
  notice: infoIcon,
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
        <img src={TOAST_ICONS[type] ?? checkIcon} alt="" />

      </div>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {type === 'success' && description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  )
}
