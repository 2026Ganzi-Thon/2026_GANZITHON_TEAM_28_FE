import { useEffect, useId, useRef } from 'react'
import styles from './TimePicker.module.css'

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1)
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5)
const ROW_HEIGHT = 32

export default function TimePicker({ hour, minute, onChange, disabled }) {
  const period = hour < 12 ? 0 : 1
  const displayedHour = hour % 12 || 12

  function changeHour(value) {
    onChange({ hour: (value % 12) + period * 12, minute })
  }

  return (
    <div className={[styles.picker, disabled && styles.disabled].filter(Boolean).join(' ')}>
      <div className={styles.highlight} aria-hidden="true" />
      <Wheel label="오전 또는 오후" values={[0, 1]} value={period} render={(value) => value === 0 ? '오전' : '오후'} onChange={(value) => onChange({ hour: displayedHour % 12 + value * 12, minute })} disabled={disabled} />
      <span className={styles.colon} aria-hidden="true">:</span>
      <Wheel label="시" values={HOURS} value={displayedHour} onChange={changeHour} disabled={disabled} cyclic />
      <Wheel label="분" values={MINUTES} value={minute} render={(value) => String(value).padStart(2, '0')} onChange={(value) => onChange({ hour, minute: value })} disabled={disabled} cyclic />
    </div>
  )
}

function Wheel({ label, values, value, onChange, render = String, disabled, cyclic = false }) {
  const id = useId()
  const ref = useRef(null)
  const timer = useRef(null)
  const onChangeRef = useRef(onChange)
  const visibleValues = cyclic ? [...values, ...values, ...values] : values
  const index = values.indexOf(value) + (cyclic ? values.length : 0)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    ref.current.scrollTop = index * ROW_HEIGHT
    return () => clearTimeout(timer.current)
  }, [index])

  function select(next) {
    if (disabled) return
    const clamped = Math.max(0, Math.min(visibleValues.length - 1, next))
    ref.current.scrollTo({ top: clamped * ROW_HEIGHT, behavior: 'smooth' })
    onChange(visibleValues[clamped])
  }

  function onScroll() {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const next = Math.round(ref.current.scrollTop / ROW_HEIGHT)
      if (!disabled && visibleValues[next] !== undefined) {
        onChangeRef.current(visibleValues[next])
        if (cyclic) ref.current.scrollTop = (next % values.length + values.length) * ROW_HEIGHT
      }
    }, 100)
  }

  function onKeyDown(event) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? (cyclic ? values.length : 0) : event.key === 'End' ? (cyclic ? values.length * 2 - 1 : values.length - 1) : index + (event.key === 'ArrowDown' ? 1 : -1)
    select(next)
  }

  return (
    <div ref={ref} className={styles.wheel} role="listbox" aria-label={label} aria-disabled={disabled} aria-activedescendant={`${id}-${index}`} tabIndex={disabled ? -1 : 0} onScroll={onScroll} onKeyDown={onKeyDown}>
      {visibleValues.map((option, itemIndex) => (
        <button id={`${id}-${itemIndex}`} key={itemIndex} type="button" role="option" aria-selected={itemIndex === index} disabled={disabled} tabIndex={-1} className={[styles.option, itemIndex === index && styles.chosen, Math.abs(itemIndex - index) > 1 && styles.far].filter(Boolean).join(' ')} onClick={() => select(itemIndex)}>{render(option)}</button>
      ))}
    </div>
  )
}
