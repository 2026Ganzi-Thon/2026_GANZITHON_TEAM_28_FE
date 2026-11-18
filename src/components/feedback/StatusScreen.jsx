import Button from '../buttons/Button.jsx'
import TopBar from '../navigation/TopBar.jsx'
import Spinner from './Spinner.jsx'
import styles from './StatusScreen.module.css'

/**
 * 화면 전체를 쓰는 상태 화면 (불러오는 중 · 찾을 수 없음 · 오류)
 * - loading: 가운데 스피너만
 * - 아니면 title·description + 아래 버튼(actionLabel, onAction)
 * - onBack: 상단 뒤로가기 (없으면 상단 바 없음)
 */
export default function StatusScreen({ loading = false, title, description, actionLabel, onAction, onBack }) {
  return (
    <div className={styles.status}>
      {onBack && <TopBar title="" onBack={onBack} />}
      {loading ? (
        <div className={styles.statusBody} role="status" aria-label="불러오는 중">
          <Spinner />
        </div>
      ) : (
        <>
          <div className={styles.statusBody}>
            <p className={styles.statusTitle}>{title}</p>
            {description && <p className={styles.statusDescription}>{description}</p>}
          </div>
          {actionLabel && (
            <div className={styles.statusActions}>
              <Button onClick={onAction}>{actionLabel}</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
