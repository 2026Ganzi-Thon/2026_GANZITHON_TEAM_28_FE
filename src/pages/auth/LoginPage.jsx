import { useNavigate } from 'react-router-dom'
import { getAiConsent, getNickname } from '../../api/profile.js'
import seeds from '../../assets/icons/illustration-seeds.svg'
import logo from '../../assets/icons/logo.svg'
import SocialButton from '../../components/buttons/SocialButton.jsx'
import { useToast } from '../../components/feedback/ToastProvider.jsx'
import styles from './LoginPage.module.css'

/** S-00. 소셜 인증 API 연결 지점은 continueLogin이다. */
export default function LoginPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  async function continueLogin(provider) {
    try {
      localStorage.setItem('1mm.login.provider', provider)
      const nickname = await getNickname()
      navigate(nickname ? (getAiConsent()?.required ? '/' : '/onboarding/ai-consent') : '/onboarding')
    } catch {
      showToast({ type: 'notice', title: '저장하지 못했어요. 잠시 후 다시 시도해 주세요' })
    }
  }

  return (
    <div className={styles.page} data-assigned-page>
      <div className={styles.content}>
        <img className={styles.illustration} src={seeds} alt="" />
        <img className={styles.logo} src={logo} alt="1mm" />
        <h1 className={styles.title}>{'1mm씩 자라는 새싹처럼\n천천히 시작하는\n당신을 응원해요'}</h1>
        <p className={styles.description}>{'로그인하면 휴대폰을 바꿔도\n지금까지의 걸음과 정원이 그대로 남아 있어요.'}</p>
      </div>
      <div className={styles.bottom}>
        {['kakao', 'apple', 'google'].map((provider) => (
          <SocialButton key={provider} provider={provider} onClick={() => continueLogin(provider)} />
        ))}
        <p className={styles.hint}>시작하면 이용약관과 개인정보 처리방침에 동의하게 돼요</p>
      </div>
    </div>
  )
}
