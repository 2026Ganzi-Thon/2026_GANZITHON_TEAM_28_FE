import { useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNickname, saveAiConsent } from '../../api/profile.js'
import sparkle from '../../assets/icons/consent-sparkle.svg'
import heart from '../../assets/icons/consent-heart.svg'
import lock from '../../assets/icons/consent-lock.svg'
import sprout from '../../assets/icons/consent-sprout.svg'
import Button from '../../components/buttons/Button.jsx'
import BottomSheet from '../../components/dialogs/BottomSheet.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import Checkbox from '../../components/inputs/Checkbox.jsx'
import styles from './AiConsentPage.module.css'

const NOTICES = [
  { icon: sparkle, title: 'AI가 아주 작은 걸음을 제안해요', description: '입력한 목표와 지금 상태를 바탕으로 걸음을 추천해요. 추천이 맞지 않으면 언제든 더 작게 바꾸거나 쉬어갈 수 있어요.' },
  { icon: heart, title: '1mm는 의료·상담 서비스가 아니에요', description: '많이 힘든 순간에는 전문 상담 기관을 안내해 드려요. 혼자 견디지 않아도 괜찮아요.' },
  { icon: lock, title: '내 기록은 나만 볼 수 있어요', description: '입력한 내용은 걸음 추천과 내 기록을 위해서만 쓰여요.' },
  { icon: sprout, title: '당신의 새싹들을 가꿔 멋진 정원을 만들어봐요', description: '목표를 끝까지 해내면 1mm 정원에 흰 꽃이 피어요. 내려놓은 목표도 작은 돌멩이로 남아요.' },
]

export default function AiConsentPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const sheetId = useId()
  const [nickname, setNickname] = useState(null)
  const [required, setRequired] = useState(false)
  const [optional, setOptional] = useState(false)
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    getNickname().then((name) => {
      if (!active) return
      if (!name) navigate('/onboarding', { replace: true })
      else setNickname(name)
    })
    return () => { active = false }
  }, [navigate])

  async function start() {
    if (!required || busy) return
    setBusy(true)
    try {
      await saveAiConsent(optional)
      navigate('/', { replace: true })
    } catch {
      showToast({ type: 'notice', title: '저장하지 못했어요. 잠시 후 다시 시도해 주세요' })
    }
    setBusy(false)
  }

  if (nickname === null) return <StatusScreen loading />

  return (
    <div className={styles.page} data-assigned-page>
      <div className={styles.content}>
        <h1 className={styles.title}>{`${nickname}님, 시작하기 전에\n이것만 알려드릴게요`}</h1>
        <ul className={styles.notices}>
          {NOTICES.map((notice) => (
            <li key={notice.title} className={styles.notice}>
              <span className={styles.icon}><img src={notice.icon} alt="" /></span>
              <div><h2 className={styles.noticeTitle}>{notice.title}</h2><p className={styles.description}>{notice.description}</p></div>
            </li>
          ))}
        </ul>
        <div className={styles.consents}>
          <div className={styles.consentRow}>
            <Checkbox checked={required} onChange={setRequired}>[필수] AI 걸음 추천을 위한 입력 정보 처리 동의</Checkbox>
            <button type="button" className={styles.details} onClick={() => setDetail('required')} aria-label="필수 동의 내용 보기">보기</button>
          </div>
          <div className={styles.consentRow}>
            <Checkbox checked={optional} onChange={setOptional}>[선택] 서비스 개선을 위한 익명 이용 정보 활용</Checkbox>
            <button type="button" className={styles.details} onClick={() => setDetail('optional')} aria-label="선택 동의 내용 보기">보기</button>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.hint}>필수 항목에 동의해야 시작할 수 있어요. 선택 항목은 설정에서 언제든 바꿀 수 있어요.</p>
        <Button className={styles.primaryButton} disabled={!required} loading={busy} onClick={start}>동의하고 시작하기</Button>
      </div>
      <BottomSheet open={detail !== null} onClose={() => setDetail(null)} labelledBy={sheetId}>
        <h2 id={sheetId} className={styles.noticeTitle} tabIndex={-1}>{detail === 'required' ? 'AI 걸음 추천을 위한 입력 정보 처리' : '익명 이용 정보 활용'}</h2>
        <p className={styles.description}>{detail === 'required' ? '입력한 목표, 에너지 상태, 심리적 부담과 최근 걸음 기록을 AI 걸음 추천에 활용해요. 민감한 개인정보는 목표에 입력하지 말아 주세요.' : '서비스 개선을 위한 익명 이용 정보 활용 여부를 선택할 수 있어요. 동의하지 않아도 서비스를 이용할 수 있어요.'}</p>
        <p className={styles.hint}>동의 문구 초안이에요. 정식 서비스의 처리 항목과 보관 기간은 개인정보 처리방침 확정 후 안내해요.</p>
        <Button onClick={() => setDetail(null)}>확인했어요</Button>
      </BottomSheet>
    </div>
  )
}
