import { useRef } from 'react'
import Chip from './Chip.jsx'
import styles from './ChipGroup.module.css'

const STEP = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/**
 * 단일 선택 칩 묶음 — S-03 에너지·부담, S-04-3 에너지 다시 묻기 등
 * - 스크린리더: 라디오 그룹 ("지금 에너지는 어느 정도인가요? · 조금 남아 있음, 선택됨, 4개 중 2번째")
 * - 키보드: Tab으로 묶음에 들어오고, 화살표 키로 옮기며 고름 (Home/End = 처음/끝)
 *
 * 사용법:
 *   <h2 id={titleId}>지금 에너지는 어느 정도인가요?</h2>
 *   <ChipGroup labelledBy={titleId} options={[{ value: 'low', label: '조금 남아 있음' }, ...]}
 *     value={energy} onChange={setEnergy} />
 */
export default function ChipGroup({ options, value, onChange, labelledBy }) {
  const chipRefs = useRef([])
  const selectedIndex = options.findIndex((option) => option.value === value)
  // Tab으로 들어올 칩: 고른 칩, 없으면 첫 번째
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0

  function handleKeyDown(event, index) {
    const count = options.length
    let next
    if (event.key in STEP) next = (index + STEP[event.key] + count) % count
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = count - 1
    else return

    event.preventDefault()
    onChange(options[next].value)
    chipRefs.current[next]?.focus()
  }

  return (
    <div className={styles.group} role="radiogroup" aria-labelledby={labelledBy}>
      {options.map((option, index) => (
        <Chip
          key={option.value}
          ref={(element) => {
            chipRefs.current[index] = element
          }}
          label={option.label}
          selected={value === option.value}
          tabIndex={index === tabStop ? 0 : -1}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        />
      ))}
    </div>
  )
}
