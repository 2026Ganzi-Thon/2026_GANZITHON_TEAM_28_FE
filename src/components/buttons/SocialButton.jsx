import appleLogo from '../../assets/icons/social-apple.svg'
import googleLogo from '../../assets/icons/social-google.png'
import kakaoLogo from '../../assets/icons/social-kakao.png'
import styles from './SocialButton.module.css'

// 각 회사 브랜드 가이드 고정 문구·색 (테마 토큰 미적용) — 피그마 Button/Social (node 163:123)
const PROVIDERS = {
  kakao: { label: '카카오 로그인', logo: kakaoLogo },
  apple: { label: 'Apple로 계속하기', logo: appleLogo },
  google: { label: 'Google로 계속하기', logo: googleLogo },
}

/**
 * 소셜 로그인 버튼 — S-00 로그인
 * - provider: 'kakao' | 'apple' | 'google'
 * - 로고는 각 회사 공식 에셋 그대로 (형태·비율·색 변경 금지)
 * - 세 버튼은 같은 크기로 유지
 *
 * 사용법:
 *   <SocialButton provider="kakao" onClick={loginWithKakao} />
 */
export default function SocialButton({ provider = 'kakao', onClick, loading = false, ...rest }) {
  const { label, logo } = PROVIDERS[provider] ?? PROVIDERS.kakao

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[provider]}`}
      onClick={loading ? undefined : onClick}
      aria-busy={loading || undefined}
      {...rest}
    >
      <img className={styles.logo} src={logo} alt="" />
      <span>{label}</span>
    </button>
  )
}
