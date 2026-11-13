import errorIcon from '../../assets/icons/error.svg'
import styles from './FormErrorMessage.module.css'

/**
 * 폼 검증 메시지 (피그마 Form/ErrorMessage, node 12:195)
 * - 비난 대신 '무엇을 하면 되는지' 알려주는 문장으로
 * - 입력이 시작되면 쓰는 쪽에서 바로 숨김
 */
export default function FormErrorMessage({ id, children }) {
  return (
    <p id={id} className={styles.message} role="alert">
      <img className={styles.icon} src={errorIcon} alt="" />
      <span>{children}</span>
    </p>
  )
}
