import { useId } from 'react'
import bellIcon from '../../assets/icons/bell.svg'
import checkMutedIcon from '../../assets/icons/check-muted.svg'
import Button from '../buttons/Button.jsx'
import BottomSheet from './BottomSheet.jsx'
import styles from './NotificationPermissionSheet.module.css'

const PROMISES = ['하루 최대 한 번만 알려드려요', '재촉하거나 다그치는 말은 쓰지 않아요', '설정에서 언제든 끌 수 있어요']

/**
 * 알림 사전 안내 시트 (피그마 Overlay/BottomSheet/NotificationPermission, node 34:374 · D-03)
 * - S-09-1에서 토글을 처음 켤 때, 휴대폰 알림 권한을 묻기 직전에 보여줌
 * - 알림 허용하기 → onAllow (여기서 브라우저/OS 권한 요청) / 나중에 할게요·딤·Esc → onLater (토글 Off 유지)
 *
 * 사용법:
 *   <NotificationPermissionSheet open={open} onAllow={requestPermission} onLater={() => setOpen(false)} />
 */
export default function NotificationPermissionSheet({ open, onAllow, onLater, allowing = false }) {
  const titleId = useId()

  return (
    <BottomSheet open={open} onClose={onLater} labelledBy={titleId} className={styles.sheet}>
      <span className={styles.iconWrap} aria-hidden="true">
        <img src={bellIcon} alt="" />
      </span>

      <div className={styles.text}>
        <h2 id={titleId} className={styles.title} tabIndex={-1}>
          {'정해둔 시간에\n살며시 알려드려도 될까요?'}
        </h2>
        <p className={styles.description}>다음 화면에서 휴대폰 알림 허용을 물어볼 거예요.</p>
      </div>

      <ul className={styles.promises}>
        {PROMISES.map((text) => (
          <li key={text} className={styles.promise}>
            <img src={checkMutedIcon} alt="" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button onClick={onAllow} loading={allowing}>
          알림 허용하기
        </Button>
        <Button variant="text" className={styles.fullWidth} onClick={onLater}>
          나중에 할게요
        </Button>
      </div>
    </BottomSheet>
  )
}
