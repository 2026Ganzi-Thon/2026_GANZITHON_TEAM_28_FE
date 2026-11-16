import { useLocation, useNavigate } from 'react-router-dom'
import heart from '../../assets/icons/support-heart.svg'
import primaryCall from '../../assets/assigned/support-call-primary.svg'
import call from '../../assets/assigned/support-call.svg'
import chevron from '../../assets/assigned/support-chevron.svg'
import people from '../../assets/assigned/support-people.svg'
import styles from './CrisisSupportPage.module.css'

export default function CrisisSupportPage() {
  const navigate = useNavigate()
  const location = useLocation()

  function goBack() {
    if (location.state?.fromGoalInput) navigate('/goals/new', { replace: true })
    else if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <div className={styles.page} data-assigned-page>
      <div className={styles.content}>
        <img className={styles.heart} src={heart} alt="" />
        <h1 className={styles.title}>{'많이 지치고 힘든 마음이\n느껴져요'}</h1>
        <p className={styles.description}>{'지금은 행동을 쪼개는 것보다\n당신의 마음을 먼저 돌보고 싶어요.\n혼자 견디지 않아도 괜찮아요.\n이야기를 들어줄 사람이 있어요.'}</p>
        <div className={styles.links}>
          <a className={styles.primaryLink} href="tel:+82109?oai_link_source=model_response_hotline">
            <img className={styles.phone} src={primaryCall} alt="" />
            <span><span className={styles.linkTitle}>109 상담 전화 걸기</span><span className={styles.linkHint}>자살예방 상담전화 · 24시간 · 무료</span></span>
          </a>
          <a className={styles.link} href="tel:15770199">
            <img className={styles.call} src={call} alt="" /><span><span className={styles.linkTitle}>정신건강 위기상담 1577-0199</span><span className={styles.linkHint}>24시간 정신건강 상담</span></span><img className={styles.arrow} src={chevron} alt="" />
          </a>
          <a className={styles.link} href="tel:119"><img className={styles.call} src={call} alt="" /><span><span className={styles.linkTitle}>지금 위험한 상황이라면 119</span><span className={styles.linkHint}>바로 도움을 받을 수 있어요</span></span><img className={styles.arrow} src={chevron} alt="" /></a>
        </div>
        <div className={styles.help}><img src={people} alt="" /><p>전화가 부담스럽다면, 믿을 수 있는 사람에게<br />“나 요즘 좀 힘들어”라고 한마디 건네보는 것도 좋아요.</p></div>
      </div>
      <button className={styles.back} onClick={goBack}>이전 화면으로 돌아가기</button>
    </div>
  )
}
