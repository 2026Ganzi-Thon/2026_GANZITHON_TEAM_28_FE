import { useNavigate } from 'react-router-dom'
import backIcon from '../../assets/icons/back.svg'
import styles from './TopBar.module.css'

/**
 * 상단 바 (피그마 Nav/TopBar, node 4:54)
 * - 왼쪽 뒤로가기(44×44), 가운데 제목, 오른쪽은 같은 폭의 빈칸
 * - onBack을 안 넘기면 브라우저 뒤로가기
 */
export default function TopBar({ title, onBack, backLabel = '뒤로 가기' }) {
  const navigate = useNavigate()

  function handleBack() {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header className={styles.bar}>
      <button type="button" className={styles.back} onClick={handleBack} aria-label={backLabel}>
        <img src={backIcon} alt="" />
      </button>
      <h1 className={styles.title}>{title}</h1>
      <span className={styles.spacer} aria-hidden="true" />
    </header>
  )
}
