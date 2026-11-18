import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReminder, saveReminder } from '../../api/preferences.js'
import info from '../../assets/assigned/notice-info.svg'
import bell from '../../assets/assigned/bell-off.svg'
import Button from '../../components/buttons/Button.jsx'
import ConfirmModal from '../../components/dialogs/ConfirmModal.jsx'
import NotificationPermissionSheet from '../../components/dialogs/NotificationPermissionSheet.jsx'
import StatusScreen from '../../components/feedback/StatusScreen.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import Toggle from '../../components/inputs/Toggle.jsx'
import TopBar from '../../components/navigation/TopBar.jsx'
import TimePicker from './TimePicker.jsx'
import styles from './ReminderPage.module.css'

const DAYS = [{ value: 1, label: '월' }, { value: 2, label: '화' }, { value: 3, label: '수' }, { value: 4, label: '목' }, { value: 5, label: '금' }, { value: 6, label: '토' }, { value: 0, label: '일' }]

function notificationPermission() {
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

export default function ReminderPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [value, setValue] = useState(null)
  const [permission, setPermission] = useState(notificationPermission)
  const [permissionOpen, setPermissionOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    let active = true
    getReminder().then((saved) => { if (active) setValue(saved) })
    const refresh = () => setPermission(notificationPermission())
    window.addEventListener('focus', refresh)
    return () => { active = false; window.removeEventListener('focus', refresh) }
  }, [])

  function toggle(enabled) {
    if (enabled && permission === 'default') setPermissionOpen(true)
    else setValue((current) => ({ ...current, enabled }))
  }

  async function allow() {
    setRequesting(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setValue((current) => ({ ...current, enabled: result !== 'default' }))
      setPermissionOpen(false)
    } catch {
      showToast({ type: 'notice', title: '알림 권한을 확인하지 못했어요. 브라우저 설정을 확인해 주세요' })
    }
    setRequesting(false)
  }

  function toggleDay(day) {
    setValue((current) => ({ ...current, days: current.days.includes(day) ? current.days.filter((item) => item !== day) : [...current.days, day] }))
  }

  async function save() {
    if (busy || (value.enabled && !value.days.length)) return
    setBusy(true)
    try {
      await saveReminder(value)
      navigate('/settings')
      showToast({ type: 'simple', title: value.enabled ? '알림 시간을 저장했어요' : '알림을 껐어요. 필요할 때 다시 켤 수 있어요' })
    } catch {
      showToast({ type: 'notice', title: '저장하지 못했어요. 잠시 후 다시 시도해 주세요' })
    }
    setBusy(false)
  }

  if (!value) return <StatusScreen loading />
  const denied = value.enabled && ['denied', 'unsupported'].includes(permission)
  const time = `${value.hour < 12 ? '오전' : '오후'} ${value.hour % 12 || 12}:${String(value.minute).padStart(2, '0')}`

  return (
    <div className={styles.page} data-assigned-page>
      <TopBar title="알림 설정" onBack={() => navigate('/settings')} />
      <div className={styles.scroll}>
        {denied && <div className={styles.permissionNotice}>
          <div className={styles.permissionMessage}><img src={bell} alt="" /><div><p>휴대폰에서 1mm 알림이 꺼져 있어요</p><span>휴대폰 설정에서 허용해 주셔야 정해둔 시간에 알려드릴 수 있어요</span></div></div>
          <Button className={styles.button} variant="secondary" onClick={() => setHelpOpen(true)}>휴대폰 설정 열기</Button>
        </div>}
        <div className={styles.toggleCard}>
          <div><h2 id="reminder-label">부드러운 리마인드</h2><p>{!value.enabled ? '지금은 알림을 보내지 않아요' : denied ? '휴대폰 알림을 허용하면 바로 시작돼요' : '하루 한 번, 정해둔 시간에만 조용히 알려드려요'}</p></div>
          <Toggle checked={value.enabled} onChange={toggle} labelledBy="reminder-label" />
        </div>
        {!value.enabled && <div className={styles.offNotice}><img src={info} alt="" /><p>알림 없이도 괜찮아요. 켜면 시간과 요일을 고를 수 있어요.</p></div>}
        <section className={[styles.section, !value.enabled && styles.inactive].filter(Boolean).join(' ')}>
          <h2>알림 받을 시간</h2>
          <p>하루 중 마음이 가장 여유로운 시간을 골라주세요</p>
          <TimePicker hour={value.hour} minute={value.minute} disabled={!value.enabled} onChange={(timeValue) => setValue((current) => ({ ...current, ...timeValue }))} />
        </section>
        <section className={[styles.section, !value.enabled && styles.inactive].filter(Boolean).join(' ')}>
          <h2>알림 받을 요일</h2>
          <p>기본은 매일이에요. 쉬고 싶은 요일은 꺼둘 수 있어요</p>
          <div className={styles.days} role="group" aria-label="알림 받을 요일">
            {DAYS.map((day) => <button key={day.value} className={[styles.day, value.days.includes(day.value) && styles.selected].filter(Boolean).join(' ')} aria-pressed={value.days.includes(day.value)} aria-label={`${day.label}요일`} disabled={!value.enabled} onClick={() => toggleDay(day.value)}>{day.label}</button>)}
          </div>
          {value.enabled && !value.days.length && <p className={styles.error}>알림 받을 요일을 하나 이상 골라 주세요</p>}
        </section>
        {value.enabled && !denied && <section className={styles.section}>
          <h2>이렇게 알려드려요</h2>
          <div className={styles.notification}><span className={styles.appIcon}>1mm</span><div><div className={styles.notificationHeader}><span>1mm</span><time>{time}</time></div><p>오늘의 1mm, 준비되면 천천히 와도 괜찮아요</p></div></div>
          <p className={styles.smallHint}>기기 알림이 꺼져 있다면 휴대폰 설정에서 1mm 알림을 허용해 주세요</p>
        </section>}
      </div>
      <div className={styles.bottom}><Button className={styles.button} disabled={value.enabled && !value.days.length} loading={busy} onClick={save}>저장하기</Button></div>
      <NotificationPermissionSheet open={permissionOpen} onAllow={allow} onLater={() => setPermissionOpen(false)} allowing={requesting} />
      <ConfirmModal open={helpOpen} title="알림 권한을 확인해 주세요" description={'사용 중인 브라우저의 사이트 설정에서\n이 사이트의 알림을 허용해 주세요.'} secondaryLabel="나중에 할게요" primaryLabel="확인했어요" onSecondary={() => setHelpOpen(false)} onPrimary={() => { setPermission(notificationPermission()); setHelpOpen(false) }} onDismiss={() => setHelpOpen(false)} />
    </div>
  )
}
