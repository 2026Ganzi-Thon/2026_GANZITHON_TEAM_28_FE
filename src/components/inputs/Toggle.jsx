import styles from './Toggle.module.css'

/**
 * 토글 스위치 (피그마 Control/Toggle, node 32:321)
 * - 스크린리더: role="switch" + aria-checked (예: "부드러운 리마인드, 켜짐")
 * - 이름은 label(aria-label) 또는 labelledBy(옆 글자의 id)로 꼭 넘겨주세요
 *
 * 사용법:
 *   <Toggle checked={on} onChange={setOn} label="부드러운 리마인드" />
 */
export default function Toggle({ checked = false, onChange, label, labelledBy, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-disabled={disabled || undefined}
      className={[styles.toggle, checked && styles.on].filter(Boolean).join(' ')}
      onClick={() => !disabled && onChange?.(!checked)}
    >
      <span className={styles.knob} aria-hidden="true" />
    </button>
  )
}
