import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNickname, saveNickname } from '../../api/profile.js'
import { clearLocalRecords, exportRecords, getLoginProvider, getReminder, reminderSummary } from '../../api/preferences.js'
import chevron from '../../assets/icons/chevron-right.svg'
import pencil from '../../assets/icons/pencil.svg'
import trash from '../../assets/icons/trash.svg'
import logout from '../../assets/icons/logout.svg'
import Button from '../../components/buttons/Button.jsx'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import { countChars } from '../../components/inputs/charCount.js'
import FormErrorMessage from '../../components/inputs/FormErrorMessage.jsx'
import TextField from '../../components/inputs/TextField.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [initialName, setInitialName] = useState(null)
  const [nickname, setNickname] = useState('')
  const [reminder, setReminder] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [busy, setBusy] = useState(false)
  const count = countChars(nickname)
  const displayCount = nickname.length > 0 && count === 0 ? nickname.length : count
  const invalid = count === 0 || count > 10
  const dirty = initialName !== null && nickname.trim() !== initialName

  useEffect(() => {
    let active = true
    Promise.all([getNickname(), getReminder()]).then(([name, value]) => {
      if (!active) return
      setInitialName(name)
      setNickname(name)
      setReminder(value)
    })
    return () => { active = false }
  }, [])

  function go(path) {
    if (dirty) setDialog({ type: 'draft', path })
    else navigate(path)
  }

  async function save(path) {
    if (invalid || busy) return
    const nextNickname = nickname.trim()
    setBusy(true)
    try {
      await saveNickname(nextNickname)
      setInitialName(nextNickname)
      setDialog(null)
      showToast({ type: 'simple', title: `이제 ‘${nextNickname}’님이라고 부를게요` })
      if (path) navigate(path)
    } catch {
      showToast({ type: 'notice', title: '저장하지 못했어요. 잠시 후 다시 시도해 주세요' })
    }
    setBusy(false)
  }

  async function clearRecords() {
    if (busy) return
    setBusy(true)
    try {
      await clearLocalRecords()
      setDialog(null)
      showToast({ type: 'simple', title: '기록을 모두 지웠어요' })
    } catch {
      showToast({ type: 'notice', title: '기록을 지우지 못했어요. 다시 시도해 주세요' })
    }
    setBusy(false)
  }

  async function download() {
    try {
      const exported = await exportRecords()
      if (exported) showToast({ type: 'simple', title: '기록 파일을 만들었어요' })
    } catch (error) {
      if (error.name !== 'AbortError') showToast({ type: 'notice', title: '기록을 내보내지 못했어요. 다시 시도해 주세요' })
    }
  }

  if (initialName === null) return <StatusScreen loading />

  return (
    <div className={styles.page} data-assigned-page>
      <TopBar title="설정" onBack={() => go('/')} />
      <div className={styles.scroll}>
        <section className={styles.section}>
          <label className={styles.sectionTitle} htmlFor="settings-nickname">프로필</label>
          <div className={styles.inputRow}>
            <TextField id="settings-nickname" value={nickname} onChange={setNickname} placeholder="닉네임을 입력해 주세요" error={invalid} describedBy={invalid ? 'settings-name-count settings-name-error' : 'settings-name-hint'} autoComplete="nickname" />
            {invalid && <span id="settings-name-count" className={styles.counter} aria-live="polite">{displayCount} / 10</span>}
          </div>
          {invalid && <FormErrorMessage id="settings-name-error">{count === 0 ? '불리고 싶은 이름을 한 글자 이상 적어주세요' : '닉네임은 10자 이내로 적어 주세요'}</FormErrorMessage>}
          {!invalid && <p id="settings-name-hint" className={styles.hint}>편하게 불리고 싶은 이름으로 언제든 바꿀 수 있어요</p>}
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계정</h2>
          <div className={styles.account}><p>연결된 계정</p><span>{getLoginProvider() ? `${getLoginProvider()}로 로그인되어 있어요` : '연결된 계정이 없어요'}</span></div>
          <SettingsRow title="로그아웃" onClick={() => setDialog({ type: 'logout' })} />
          <SettingsRow title="계정 탈퇴" description="모든 목표와 걸음 기록이 지워져요" onClick={() => go('/settings/withdrawal')} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>알림</h2>
          <SettingsRow title="부드러운 리마인드" description={reminderSummary(reminder)} onClick={() => go('/settings/reminder')} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기록</h2>
          <SettingsRow title="행동 기록 내보내기" onClick={download} />
          <SettingsRow title="모든 기록 지우기" description="지운 기록은 다시 되돌릴 수 없어요" onClick={() => setDialog({ type: 'clear' })} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>도움이 필요할 때</h2>
          <SettingsRow title="마음이 많이 힘들 때 연락할 곳" description="109 자살예방 상담전화 등 안내 (S-08)" tone="support" onClick={() => go('/support')} />
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>정보</h2>
          {['이용약관', '개인정보 처리방침', '문의하기'].map((title) => <SettingsRow key={title} title={title} onClick={() => setDialog({ type: 'info', title })} />)}
          <div className={styles.version}><span>앱 버전</span><span>1.0.0</span></div>
        </section>
      </div>
      <div className={styles.bottom}><Button className={styles.saveButton} disabled={!dirty || invalid} loading={busy} onClick={() => save()}>변경 내용 저장하기</Button></div>
      <ConfirmModal open={dialog?.type === 'draft'} icon={<img src={pencil} alt="" />} title="바뀐 내용을 저장할까요?" description={'저장하지 않고 나가면\n입력한 내용은 반영되지 않아요.'} secondaryLabel="저장 안 함" primaryLabel="저장하기" onSecondary={() => navigate(dialog.path)} onPrimary={() => save(dialog.path)} primaryLoading={busy} onDismiss={() => setDialog(null)} />
      <ConfirmModal open={dialog?.type === 'clear'} icon={<img src={trash} alt="" />} title="모든 기록을 지울까요?" description={'지금까지의 목표와 걸음 기록이 모두 사라져요.\n지운 기록은 다시 되돌릴 수 없어요.'} secondaryLabel="지우기" secondaryTone="danger" primaryLabel="그대로 둘래요" onSecondary={clearRecords} onPrimary={() => setDialog(null)} onDismiss={() => setDialog(null)} />
      <ConfirmModal open={dialog?.type === 'logout'} icon={<img src={logout} alt="" />} title="로그아웃할까요?" description={'다시 로그인하면 지금까지의 걸음과\n기록을 이어갈 수 있어요.'} secondaryLabel="취소" primaryLabel="로그아웃" onSecondary={() => setDialog(null)} onPrimary={() => { localStorage.removeItem('1mm.login.provider'); navigate('/login'); showToast({ type: 'simple', title: '로그아웃했어요' }) }} onDismiss={() => setDialog(null)} />
      <ConfirmModal open={dialog?.type === 'info'} title={dialog?.title} description="아직 안내를 준비하고 있어요." secondaryLabel="돌아가기" primaryLabel="확인" onSecondary={() => setDialog(null)} onPrimary={() => setDialog(null)} onDismiss={() => setDialog(null)} />
    </div>
  )
}

function SettingsRow({ title, description, onClick, tone }) {
  return (
    <button type="button" className={[styles.row, tone === 'support' && styles.support].filter(Boolean).join(' ')} onClick={onClick}>
      <span><span className={styles.rowTitle}>{title}</span>{description && <span className={styles.rowDescription}>{description}</span>}</span>
      <img src={chevron} alt="" />
    </button>
  )
}
