import { useEffect, useState } from 'react'
import spinnerPrimary from '../../assets/icons/spinner-primary.svg'
import spinnerSecondary from '../../assets/icons/spinner-secondary.svg'
import spinnerText from '../../assets/icons/spinner-text.svg'
import styles from './Button.module.css'

// 피그마 Button Loading 상태(46:947 / 46:952 / 46:957)의 Spinner — variant마다 색이 다름
const SPINNERS = {
  primary: spinnerPrimary,
  secondary: spinnerSecondary,
  text: spinnerText,
}

// 버튼 Loading 노출 기준 (핸드오프 노트: 서버 설정값 기본 1초)
const DEFAULT_LOADING_DELAY_MS = 1000

/**
 * 공통 버튼
 * - variant: 'primary' | 'secondary' | 'text'
 * - loading: true인 동안 탭을 막고, loadingDelayMs가 지나면 라벨 대신 스피너를 보여줌
 * - disabled: aria-disabled로 처리 (터치 불가, 커서 not-allowed)
 */
export default function Button({
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  loadingDelayMs = DEFAULT_LOADING_DELAY_MS,
  onClick,
  className,
  children,
  ...rest
}) {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (!loading) {
      setShowSpinner(false)
      return
    }
    const timer = setTimeout(() => setShowSpinner(true), loadingDelayMs)
    return () => clearTimeout(timer)
  }, [loading, loadingDelayMs])

  const blocked = disabled || loading

  function handleClick(event) {
    if (blocked) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  const classNames = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classNames}
      aria-disabled={blocked || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      <span className={showSpinner ? styles.labelHidden : undefined}>{children}</span>
      {showSpinner && (
        <img
          className={styles.spinner}
          src={SPINNERS[variant] ?? spinnerPrimary}
          alt=""
          aria-hidden="true"
        />
      )}
    </button>
  )
}
