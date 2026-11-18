import wifiOffIcon from '../../assets/icons/wifi-off.svg'
import styles from './OfflineBanner.module.css'

/**
 * 오프라인 배너 (피그마 Feedback/OfflineBanner, node 47:994)
 * 상태바(또는 상단 바) 바로 아래에 둠. 연결 여부는 useOnlineStatus()로 판단해서 쓰는 쪽에서 렌더
 */
export default function OfflineBanner() {
  return (
    <div className={styles.wrap}>
      <div className={styles.banner} role="status">
        <img className={styles.icon} src={wifiOffIcon} alt="" />
        <div className={styles.text}>
          <p className={styles.title}>인터넷 연결이 끊겼어요</p>
          <p className={styles.description}>연결되면 자동으로 이어갈게요</p>
        </div>
      </div>
    </div>
  )
}
