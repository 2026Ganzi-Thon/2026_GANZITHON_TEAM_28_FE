import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAiConsent, getNickname, saveNickname } from '../../api/profile.js'
import logo from '../../assets/icons/logo.svg'
import Button from '../../components/buttons/Button.jsx'
import { countChars } from '../../components/inputs/charCount.js'
import FormErrorMessage from '../../components/inputs/FormErrorMessage.jsx'
import TextField from '../../components/inputs/TextField.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import styles from './OnboardingPage.module.css'

// 최신 피그마 N-03의 닉네임 제한(10자)을 기준으로 한다.
const NICKNAME_MAX_CHARS = 10

export default function OnboardingPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [nickname, setNickname] = useState('')
  const [busy, setBusy] = useState(false)
  const count = countChars(nickname)
  const whitespaceOnly = nickname.length > 0 && count === 0
  const displayCount = whitespaceOnly ? nickname.length : count
  const error = whitespaceOnly || count > NICKNAME_MAX_CHARS

  useEffect(() => {
    let active = true
    getNickname().then((name) => {
      if (active && name) navigate(getAiConsent()?.required ? '/' : '/onboarding/ai-consent', { replace: true })
    })
    return () => { active = false }
  }, [navigate])

  async function submit(event) {
    event.preventDefault()
    if (!count || error || busy) return
    setBusy(true)
    try {
      await saveNickname(nickname)
      navigate('/onboarding/ai-consent')
    } catch {
      showToast({ type: 'notice', title: '저장하지 못했어요. 잠시 후 다시 시도해 주세요' })
    }
    setBusy(false)
  }

  return (
    <form data-assigned-page className={styles.page} onSubmit={submit}>
      <div className={styles.content}>
        <img className={styles.logo} src={logo} alt="1mm" />
        <h1 className={styles.title}>{'오늘은 1mm만\n움직여도 충분해요'}</h1>
        <p className={styles.description}>{'거창한 계획은 잠시 내려놓아도 괜찮아요.\n지금의 나에게 맞는 아주 작은 한 걸음을\n1mm가 함께 찾아볼게요.'}</p>
        <section className={styles.form}>
          <label htmlFor="nickname" className={styles.label}>어떻게 불러드릴까요?</label>
          <div className={styles.inputRow}>
            <TextField id="nickname" autoComplete="nickname" value={nickname} onChange={setNickname} error={error} describedBy={`nickname-count ${error ? 'nickname-error' : 'nickname-hint'}`} placeholder="닉네임을 입력해 주세요" />
            <span id="nickname-count" className={styles.counter} aria-live="polite">{displayCount} / {NICKNAME_MAX_CHARS}</span>
          </div>
          {error && <FormErrorMessage id="nickname-error">{whitespaceOnly ? '띄어쓰기만으로는 이름이 될 수 없어요' : '닉네임은 10자 이내로 적어 주세요'}</FormErrorMessage>}
          {!error && <p id="nickname-hint" className={styles.hint}>편하게 불리고 싶은 이름이면 충분해요. 나중에 언제든 바꿀 수 있어요.</p>}
        </section>
      </div>
      <div className={styles.bottom}>
        <p className={styles.hint}>가입 없이 바로 시작할 수 있어요</p>
        <Button className={styles.primaryButton} type="submit" disabled={!count || error} loading={busy}>시작하기</Button>
      </div>
    </form>
  )
}
