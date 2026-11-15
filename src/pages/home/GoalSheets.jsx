import { useId, useState } from 'react'
import { APP_CONFIG } from '../../api/config.js'
import flagIcon from '../../assets/icons/flag.svg'
import pencilIcon from '../../assets/icons/pencil.svg'
import trashSmallIcon from '../../assets/icons/trash-small.svg'
import Button from '../../components/buttons/Button.jsx'
import BottomSheet from '../../components/dialogs/BottomSheet.jsx'
import TextField from '../../components/inputs/TextField.jsx'
import { doneLabel } from './goalSummary.js'
import styles from './GoalSheets.module.css'

/**
 * G-01 목표 더보기 시트
 * 마무리 → S-07 / 이름 바꾸기 → G-02 시트 / 지우기 → G-03 확인 모달
 */
export function GoalActionsSheet({ summary, onClose, onEnd, onRename, onDelete }) {
  const titleId = useId()

  return (
    <BottomSheet open={Boolean(summary)} onClose={onClose} labelledBy={titleId}>
      {summary && (
        <>
          <div className={styles.goalInfo}>
            <h2 id={titleId} className={styles.sheetTitle} tabIndex={-1}>
              {summary.goal.title}
            </h2>
            <p className={styles.goalProgress}>{doneLabel(summary.doneCount)}</p>
          </div>

          <ul className={styles.actions}>
            <li>
              <button type="button" className={styles.row} onClick={onEnd}>
                <span className={styles.rowIcon}>
                  <img src={flagIcon} alt="" />
                </span>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>목표 마무리하기</span>
                  <span className={styles.rowDescription}>완료 또는 그만두기를 고를 수 있어요</span>
                </span>
              </button>
            </li>
            <li>
              <button type="button" className={styles.row} onClick={onRename}>
                <span className={styles.rowIcon}>
                  <img src={pencilIcon} alt="" />
                </span>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>목표 이름 바꾸기</span>
                </span>
              </button>
            </li>
            <li>
              <button type="button" className={styles.row} onClick={onDelete}>
                <span className={styles.rowIcon}>
                  <img src={trashSmallIcon} alt="" />
                </span>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>목표 지우기</span>
                  <span className={styles.rowDescription}>걸음 기록은 행동 기록에 그대로 남아요</span>
                </span>
              </button>
            </li>
          </ul>

          <Button variant="text" className={styles.fullWidth} onClick={onClose}>
            닫기
          </Button>
        </>
      )}
    </BottomSheet>
  )
}

/**
 * G-02 목표 이름 바꾸기 시트
 * 입력 규칙은 목표 입력과 같음 (1~50자, 앞뒤 공백 제거, 공백만 불가 → 버튼만 비활성)
 */
export function RenameGoalSheet({ summary, saving, onClose, onSave }) {
  const titleId = useId()

  return (
    <BottomSheet open={Boolean(summary)} onClose={onClose} labelledBy={titleId}>
      {summary && (
        <RenameForm key={summary.goal.id} titleId={titleId} initialTitle={summary.goal.title} saving={saving} onClose={onClose} onSave={onSave} />
      )}
    </BottomSheet>
  )
}

function RenameForm({ titleId, initialTitle, saving, onClose, onSave }) {
  const hintId = useId()
  const [title, setTitle] = useState(initialTitle)
  const trimmed = title.trim()

  function handleSubmit(event) {
    event.preventDefault()
    if (trimmed && !saving) onSave(trimmed)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 id={titleId} className={styles.sheetTitle} tabIndex={-1}>
        목표 이름 바꾸기
      </h2>
      <TextField
        value={title}
        onChange={setTitle}
        maxChars={APP_CONFIG.goalMaxChars}
        aria-labelledby={titleId}
        describedBy={hintId}
        autoFocus
      />
      <p id={hintId} className={styles.hint}>
        1~{APP_CONFIG.goalMaxChars}자 · 이름을 바꿔도 내디딘 걸음은 그대로예요
      </p>
      <div className={styles.formActions}>
        <Button type="submit" disabled={!trimmed} loading={saving}>
          저장하기
        </Button>
        <Button variant="text" className={styles.fullWidth} onClick={onClose}>
          취소
        </Button>
      </div>
    </form>
  )
}
