import spinnerIcon from '../../assets/icons/spinner-large.svg'
import styles from './Spinner.module.css'

/**
 * 큰 로딩 스피너 (피그마 Feedback/Spinner, node 12:200)
 * - 1.1초 한 바퀴, 모션 줄이기 설정이면 회전 대신 깜빡임
 * - 버튼 안 작은 스피너는 Button이 따로 가지고 있음
 */
export default function Spinner() {
  return <img className={styles.spinner} src={spinnerIcon} alt="" aria-hidden="true" />
}
