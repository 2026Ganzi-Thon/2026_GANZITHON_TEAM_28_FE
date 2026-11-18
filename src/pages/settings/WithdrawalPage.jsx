import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccountSummary, leaveLocalAccount } from '../../api/preferences.js'
import chevron from '../../assets/icons/chevron-right.svg'
import Button from '../../components/buttons/Button.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import Checkbox from '../../components/inputs/Checkbox.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './WithdrawalPage.module.css'

export default function WithdrawalPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [summary] = useState(getAccountSummary)

  async function leave() {
    if (!checked || busy) return
    setBusy(true)
    try {
      await leaveLocalAccount()
      navigate('/login', { replace: true })
      showToast({ type: 'simple', title: '탈퇴가 완료됐어요. 그동안 함께해서 고마웠어요' })
    } catch {
      showToast({ type: 'notice', title: '탈퇴를 처리하지 못했어요. 다시 시도해 주세요' })
      setBusy(false)
    }
  }

  return (
    <div className={styles.page} data-assigned-page>
      <TopBar title="계정 탈퇴" onBack={() => navigate('/settings')} />
      <div className={styles.content}>
        <header>
          <h2 className={styles.title}>{'떠나기 전에\n한 번만 확인해 주세요'}</h2>
          <p className={styles.description}>탈퇴하면 아래 정보가 모두 지워지고, 다시 되돌릴 수 없어요.</p>
        </header>
        <dl className={styles.summary}>
          <div><dt>진행 중인 목표</dt><dd>{summary.goalCount}개</dd></div>
          <div><dt>내디딘 걸음 기록</dt><dd>{summary.stepCount}개</dd></div>
          <div><dt>닉네임 · 알림 설정</dt><dd>모두</dd></div>
        </dl>
        <button className={styles.reminder} onClick={() => navigate('/settings/reminder')}>
          <span><span>잠시 쉬고 싶은 거라면</span><small>탈퇴 대신 알림만 꺼둘 수도 있어요</small></span><img src={chevron} alt="" />
        </button>
        <Checkbox checked={checked} onChange={setChecked} disabled={busy}>위 내용을 확인했고, 탈퇴할게요</Checkbox>
      </div>
      <div className={styles.bottom}>
        <Button variant="secondary" className={styles.leaveButton} disabled={!checked} loading={busy} onClick={leave}>탈퇴하기</Button>
        <Button variant="text" className={styles.textButton} disabled={busy} onClick={() => navigate('/settings')}>계속 이용할게요</Button>
      </div>
    </div>
  )
}
